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

	"golang.org/x/crypto/argon2"
	"gorm.io/gorm"
)

var (
	ErrEmailAlreadyRegistered = errors.New("email already registered")
	ErrInvalidCredentials     = errors.New("invalid email or password")
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
	user, err := gorm.G[models.ExternalUser](s.db).Where("email = ?", req.Email).First(ctx)
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
