package pet

import (
	"time"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
)

type GetPresignedURLRequest struct {
	FileSize    int64  `json:"file_size" validate:"required,min=1,max=5242880"` // Max 5MB
	ContentType string `json:"content_type" validate:"required,oneof=image/jpeg image/png image/webp"`
}

type GetPresignedURLResponse struct {
	UploadID string            `json:"upload_id"`
	URL      string            `json:"url"`
	Method   string            `json:"method"`
	Headers  map[string]string `json:"headers"`
}

type CreatePetRequest struct {
	Name                  string        `json:"name" validate:"required"`
	Species               string        `json:"species" validate:"required"`
	Breed                 string        `json:"breed" validate:"required"`
	Gender                models.Gender `json:"gender" validate:"required,oneof=male female"`
	BirthDate             core.Date     `json:"birth_date" validate:"required"`
	InitialMedicalHistory string        `json:"initial_medical_history"`
	AvatarUploadID        string        `json:"avatar_upload_id"`
}

type PetResponse struct {
	ID                    uint          `json:"id"`
	OwnerID               uint          `json:"owner_id"`
	Name                  string        `json:"name"`
	Species               string        `json:"species"`
	Breed                 string        `json:"breed"`
	Gender                models.Gender `json:"gender"`
	BirthDate             core.Date     `json:"birth_date"`
	InitialMedicalHistory string        `json:"initial_medical_history,omitempty"`
	AvatarURL             string        `json:"avatar_url,omitempty"`
	CreatedAt             time.Time     `json:"created_at"`
}

type MyPetResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	AvatarURL string    `json:"avatar_url,omitempty"`
	Species   string    `json:"species"`
	BirthDate core.Date `json:"birth_date"`
}

type PetReminderResponse struct {
	ID          uuid.UUID          `json:"id"`
	ServiceType models.ServiceType `json:"service_type"`
	Date        core.Date          `json:"date"`
	Description string             `json:"description"`
}
