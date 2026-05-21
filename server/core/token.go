package core

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"vetconnect-server/models"

	"github.com/golang-jwt/jwt/v5"
)

var ErrInvalidSigningAlgorithm = errors.New("invalid signing algorithm")
var ErrInvalidToken = errors.New("invalid token")

type TokenHelper struct {
	key string
}

func NewTokenHelper(key string) *TokenHelper {
	return &TokenHelper{key: key}
}

const RefreshTokenLength = 32
const RefreshTokenTimeout = 30 * 24 * time.Hour

func (t *TokenHelper) GenerateRefreshToken() (string, time.Time, error) {
	bytes := make([]byte, RefreshTokenLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", time.Time{}, err
	}
	return base64.RawURLEncoding.EncodeToString(bytes), time.Now().Add(RefreshTokenTimeout), nil
}

const Timeout = time.Hour

type AccessTokenClaims struct {
	jwt.RegisteredClaims
	Scope string `json:"scope,omitempty"`
	Type  string `json:"type,omitempty"`
	Role  string `json:"role,omitempty"`
}

func (t *TokenHelper) HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (t *TokenHelper) GenerateAccessToken(userId uint, role models.AccountRole) (string, time.Time, error) {
	now := time.Now()
	expire := now.Add(Timeout)
	claims := AccessTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expire),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   strconv.FormatUint(uint64(userId), 10),
		},
		Role: string(role),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(t.key))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expire, nil
}

type TokenResult struct {
	AccessToken           string
	AccessTokenExpiresAt  time.Time
	RefreshToken          string
	RefreshTokenHash      string
	RefreshTokenExpiresAt time.Time
}

func (t *TokenHelper) GenerateToken(userId uint, role models.AccountRole) (*TokenResult, error) {
	accessToken, accessTokenExpire, err := t.GenerateAccessToken(userId, role)
	if err != nil {
		return nil, err
	}

	refreshToken, refreshTokenExpire, err := t.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	return &TokenResult{
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessTokenExpire,
		RefreshToken:          refreshToken,
		RefreshTokenHash:      t.HashToken(refreshToken),
		RefreshTokenExpiresAt: refreshTokenExpire,
	}, nil
}

func (t *TokenHelper) VerifyAccessToken(tokenString string) (AccessTokenClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&AccessTokenClaims{},
		func(token *jwt.Token) (any, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, ErrInvalidSigningAlgorithm
			}
			return []byte(t.key), nil
		})
	if err != nil {
		return AccessTokenClaims{}, err
	}

	if !token.Valid {
		return AccessTokenClaims{}, ErrInvalidToken
	}

	claims, ok := token.Claims.(*AccessTokenClaims)
	if !ok {
		return AccessTokenClaims{}, ErrInvalidToken
	}

	return *claims, nil
}
