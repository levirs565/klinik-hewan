package appointment

import (
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
)

type CreateAppointmentRequest struct {
	PetID                  uint               `json:"pet_id" validate:"required"`
	ServiceType            models.ServiceType `json:"service_type" validate:"required,oneof=vaccine checkup treatment"`
	AppointmentDate        core.Date          `json:"appointment_date" validate:"required"`
	OwnerNotes             string             `json:"owner_notes"`
	PreviousMedicalHistory string             `json:"previous_medical_history"`
	Checkup                *CheckupDetails    `json:"checkup" validate:"required_if=ServiceType checkup,excluded_unless=ServiceType checkup"`
	Treatment              *TreatmentDetails  `json:"treatment" validate:"required_if=ServiceType treatment,excluded_unless=ServiceType treatment"`
	Vaccine                *VaccineDetails    `json:"vaccine" validate:"required_if=ServiceType vaccine,excluded_unless=ServiceType vaccine"`
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
	ID              uuid.UUID               `json:"id"`
	Pet             AppointmentPetSummary   `json:"pet"`
	Status          models.AppointmentState `json:"status"`
	ServiceType     models.ServiceType      `json:"service_type"`
	AppointmentDate core.Date               `json:"appointment_date"`
}

type GetOwnerAppointmentsResponse struct {
	Items []AppointmentListItem `json:"items"`
}

type AppointmentDetailPet struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Breed     string    `json:"breed"`
	BirthDate core.Date `json:"birth_date"`
	AvatarURL string    `json:"avatar_url,omitempty"`
}

type AppointmentDoctorSummary struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type AppointmentOwnerSummary struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

type AppointmentDetailResponse struct {
	ID                     uuid.UUID                 `json:"id"`
	Pet                    AppointmentDetailPet      `json:"pet"`
	Doctor                 *AppointmentDoctorSummary `json:"doctor,omitempty"`
	Status                 models.AppointmentState   `json:"status"`
	ServiceType            models.ServiceType        `json:"service_type"`
	AppointmentDate        core.Date                 `json:"appointment_date"`
	OwnerNotes             string                    `json:"owner_notes"`
	PreviousMedicalHistory string                    `json:"previous_medical_history"`
}

type InternalAppointmentDetailResponse struct {
	AppointmentDetailResponse
	Owner AppointmentOwnerSummary `json:"owner"`
}

type RejectAppointmentRequest struct {
	Reason string `json:"reason" validate:"required"`
}

type SelectDoctorRequest struct {
	DoctorID uint `json:"doctor_id" validate:"required"`
}
