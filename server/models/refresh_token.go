package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserType string

const (
	UserTypeInternal UserType = "internal"
	UserTypeExternal UserType = "external"
)

type RefreshToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    uint               `bson:"user_id"`
	UserType  UserType           `bson:"user_type"`
	Token     string             `bson:"token"`
	ExpiresAt time.Time          `bson:"expires_at"`
	TTLExpiry time.Time          `bson:"ttl_expiry"`
	CreatedAt time.Time          `bson:"created_at"`
	IsRevoked bool               `bson:"is_revoked"`
}
