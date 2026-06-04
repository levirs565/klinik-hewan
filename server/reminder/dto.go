package reminder

import (
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
)

type PetResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

type ReminderResponse struct {
	ID          uuid.UUID          `json:"id"`
	ServiceType models.ServiceType `json:"service_type"`
	Date        core.Date          `json:"date"`
	Description string             `json:"description"`
	Pet         PetResponse        `json:"pet"`
}
