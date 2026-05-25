package auth

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"time"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/argon2"
	"gorm.io/gorm"
)

var (
	ErrEmailAlreadyRegistered = errors.New("email already registered")
	ErrInvalidCredentials     = errors.New("invalid email or password")
	ErrInvalidRefreshToken    = errors.New("invalid refresh token")
	ErrExpiredRefreshToken    = errors.New("expired refresh token")
)

type Service struct {
	db          *gorm.DB
	mongo       *core.MongoStorage
	tokenHelper *core.TokenHelper
}

func NewService(db *gorm.DB, mongo *core.MongoStorage, tokenHelper *core.TokenHelper) *Service {
	return &Service{
		db:          db,
		mongo:       mongo,
		tokenHelper: tokenHelper,
	}
}

type argon2Params struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

var params = argon2Params{
	memory:      64 * 1024,
	iterations:  3,
	parallelism: 2,
	saltLength:  16,
	keyLength:   32,
}

func (s *Service) RegisterOwner(ctx context.Context, req RegisterOwnerRequest) (*RegisterOwnerResponse, error) {
	// Check if email exists
	_, err := gorm.G[models.ExternalUser](s.db).Where("email = ?", req.Email).First(ctx)
	if err == nil {
		return nil, ErrEmailAlreadyRegistered
	}

	hashedPassword, err := s.hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := models.ExternalUser{
		FullName: req.FullName,
		Email:    req.Email,
		Password: hashedPassword,
	}

	if err := gorm.G[models.ExternalUser](s.db).Create(ctx, &user); err != nil {
		return nil, err
	}

	return &RegisterOwnerResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Email:    user.Email,
	}, nil
}

func (s *Service) LoginOwner(ctx context.Context, req LoginOwnerRequest) (*LoginOwnerResponse, error) {
	user, err := gorm.G[models.ExternalUser](s.db).
		Select("id", "email", "password").
		Where("email = ?", req.Email).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	match, err := s.ComparePassword(req.Password, user.Password)
	if err != nil || !match {
		return nil, ErrInvalidCredentials
	}
	tokens, err := s.tokenHelper.GenerateToken(user.ID, models.RoleOwner)
	if err != nil {
		return nil, err
	}

	// Store refresh token in MongoDB
	refreshTokenDoc := models.RefreshToken{
		UserID:    user.ID,
		UserType:  models.UserTypeExternal,
		Token:     tokens.RefreshTokenHash,
		ExpiresAt: tokens.RefreshTokenExpiresAt,
		TTLExpiry: tokens.RefreshTokenExpiresAt.Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
		IsRevoked: false,
	}

	if _, err := s.mongo.RefreshTokens.InsertOne(ctx, refreshTokenDoc); err != nil {
		return nil, err
	}

	return &LoginOwnerResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

func (s *Service) LoginInternal(ctx context.Context, req LoginInternalRequest) (*LoginInternalResponse, error) {
	user, err := gorm.G[models.InternalUser](s.db).
		Select("id", "username", "password", "role", "is_active").
		Where("username = ?", req.Username).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, errors.New("account is inactive")
	}

	match, err := s.ComparePassword(req.Password, user.Password)
	if err != nil || !match {
		return nil, ErrInvalidCredentials
	}

	tokens, err := s.tokenHelper.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	// Store refresh token in MongoDB
	refreshTokenDoc := models.RefreshToken{
		UserID:    user.ID,
		UserType:  models.UserTypeInternal,
		Token:     tokens.RefreshTokenHash,
		ExpiresAt: tokens.RefreshTokenExpiresAt,
		TTLExpiry: tokens.RefreshTokenExpiresAt.Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
		IsRevoked: false,
	}

	if _, err := s.mongo.RefreshTokens.InsertOne(ctx, refreshTokenDoc); err != nil {
		return nil, err
	}

	return &LoginInternalResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

func (s *Service) RefreshToken(ctx context.Context, req RefreshTokenRequest) (*RefreshTokenResponse, error) {
	tokenHash := s.tokenHelper.HashToken(req.RefreshToken)

	var refreshToken models.RefreshToken
	err := s.mongo.RefreshTokens.FindOne(ctx, bson.M{
		"token":      tokenHash,
		"is_revoked": false,
	}).Decode(&refreshToken)

	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	if time.Now().After(refreshToken.ExpiresAt) {
		return nil, ErrExpiredRefreshToken
	}

	// Revoke old token
	_, err = s.mongo.RefreshTokens.UpdateOne(ctx,
		bson.M{"_id": refreshToken.ID},
		bson.M{"$set": bson.M{"is_revoked": true}},
	)
	if err != nil {
		return nil, err
	}

	var role models.AccountRole
	if refreshToken.UserType == models.UserTypeExternal {
		role = models.RoleOwner
	} else {
		user, err := gorm.G[models.InternalUser](s.db).
			Select("id", "role", "is_active").
			Where("id = ?", refreshToken.UserID).
			First(ctx)
		if err != nil {
			return nil, errors.New("user not found")
		}
		if !user.IsActive {
			return nil, errors.New("account is inactive")
		}
		role = user.Role
	}

	tokens, err := s.tokenHelper.GenerateToken(refreshToken.UserID, role)
	if err != nil {
		return nil, err
	}

	// Store new refresh token
	newRefreshTokenDoc := models.RefreshToken{
		UserID:    refreshToken.UserID,
		UserType:  refreshToken.UserType,
		Token:     tokens.RefreshTokenHash,
		ExpiresAt: tokens.RefreshTokenExpiresAt,
		TTLExpiry: tokens.RefreshTokenExpiresAt.Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
		IsRevoked: false,
	}

	if _, err := s.mongo.RefreshTokens.InsertOne(ctx, newRefreshTokenDoc); err != nil {
		return nil, err
	}

	return &RefreshTokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

func (s *Service) Logout(ctx context.Context, req LogoutRequest) error {
	tokenHash := s.tokenHelper.HashToken(req.RefreshToken)

	result, err := s.mongo.RefreshTokens.UpdateOne(ctx,
		bson.M{
			"token":      tokenHash,
			"is_revoked": false,
		},
		bson.M{"$set": bson.M{"is_revoked": true}},
	)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return ErrInvalidRefreshToken
	}

	return nil
}

func (s *Service) GetMe(ctx context.Context, session core.UserSession) (*MeResponse, error) {
	if session.Role == string(models.RoleOwner) {
		user, err := gorm.G[models.ExternalUser](s.db).
			Select("id", "full_name", "email").
			Where("id = ?", session.ID).
			First(ctx)
		if err != nil {
			return nil, err
		}

		return &MeResponse{
			ID:       user.ID,
			FullName: user.FullName,
			Email:    user.Email,
			Role:     session.Role,
		}, nil
	}

	// Handle internal roles
	user, err := gorm.G[models.InternalUser](s.db).
		Select("id", "full_name", "username").
		Where("id = ?", session.ID).
		First(ctx)
	if err != nil {
		return nil, err
	}

	return &MeResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Username: user.Username,
		Role:     session.Role,
	}, nil
}

func (s *Service) CreateInternalUser(ctx context.Context, username, password, fullName string, role models.AccountRole) error {
	hashedPassword, err := s.hashPassword(password)
	if err != nil {
		return err
	}

	user := models.InternalUser{
		Username: username,
		Password: hashedPassword,
		FullName: fullName,
		Role:     role,
		IsActive: true,
	}

	return gorm.G[models.InternalUser](s.db).Create(ctx, &user)
}

func (s *Service) hashPassword(password string) (string, error) {
	salt := make([]byte, params.saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey([]byte(password), salt, params.iterations, params.memory, params.parallelism, params.keyLength)

	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	encoded := fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", argon2.Version, params.memory, params.iterations, params.parallelism, b64Salt, b64Hash)
	return encoded, nil
}

func (s *Service) ComparePassword(password, encodedHash string) (bool, error) {
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 {
		return false, errors.New("invalid hash format")
	}

	var version int
	_, err := fmt.Sscanf(parts[2], "v=%d", &version)
	if err != nil {
		return false, err
	}

	var memory, iterations uint32
	var parallelism uint8
	_, err = fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism)
	if err != nil {
		return false, err
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, err
	}

	hash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, err
	}

	comparisonHash := argon2.IDKey([]byte(password), salt, iterations, memory, parallelism, uint32(len(hash)))

	return subtle.ConstantTimeCompare(hash, comparisonHash) == 1, nil
}
