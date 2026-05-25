package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FCMToken struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     uint               `bson:"user_id"`
	UserType   UserType           `bson:"user_type"`
	Token      string             `bson:"token"`
	DeviceType string             `bson:"device_type"`
	CreatedAt  time.Time          `bson:"created_at"`
	LastUsedAt time.Time          `bson:"last_used_at"`
}
