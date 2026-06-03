package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type StatusHistory struct {
	ID            primitive.ObjectID `bson:"_id,omitempty"`
	AppointmentID string             `bson:"appointment_id"`
	State         AppointmentState   `bson:"state"`
	ActorID       uint               `bson:"actor_id"`
	ActorRole     string             `bson:"actor_role"`
	ChangedAt     time.Time          `bson:"changed_at"`
	Reason        string             `bson:"reason,omitempty"`
}
