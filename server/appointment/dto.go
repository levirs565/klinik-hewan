package appointment

import (
	"vetconnect-server/core"

	"github.com/google/uuid"
)

type CreateAppointmentRequest struct {
	PetID                  uint              `json:"pet_id" validate:"required"`
	ServiceType            string            `json:"service_type" validate:"required,oneof=vaccine checkup treatment"`
	AppointmentDate        core.Date         `json:"appointment_date" validate:"required"`
	OwnerNotes             string            `json:"owner_notes"`
	PreviousMedicalHistory string            `json:"previous_medical_history"`
	Checkup                *CheckupDetails   `json:"checkup" validate:"required_if=ServiceType checkup,excluded_unless=ServiceType checkup"`
	Treatment              *TreatmentDetails `json:"treatment" validate:"required_if=ServiceType treatment,excluded_unless=ServiceType treatment"`
	Vaccine                *VaccineDetails   `json:"vaccine" validate:"required_if=ServiceType vaccine,excluded_unless=ServiceType vaccine"`
}

type CheckupDetails struct {
	Purpose   string `json:"purpose" validate:"required"`
	FocusArea string `json:"focus_area" validate:"required"`
}

type TreatmentDetails struct {
	ObservedSymptoms []string `json:"observed_symptoms" validate:"required,min=1"`
	SymptomDuration  string   `json:"symptom_duration" validate:"required"`
	HomeCareReceived bool     `json:"home_care_received"`
}

type VaccineDetails struct {
	VaccineType string `json:"vaccine_type" validate:"required"`
}

type CreateAppointmentResponse struct {
	ID uuid.UUID `json:"id"`
}

type AppointmentPetSummary struct {
	Name      string `json:"name"`
	Breed     string `json:"breed"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

type AppointmentListItem struct {
	ID              uuid.UUID             `json:"id"`
	Pet             AppointmentPetSummary `json:"pet"`
	Status          string                `json:"status"`
	ServiceType     string                `json:"service_type"`
	AppointmentDate core.Date             `json:"appointment_date"`
}

type GetOwnerAppointmentsResponse struct {
	Items []AppointmentListItem `json:"items"`
}
