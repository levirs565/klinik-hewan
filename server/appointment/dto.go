package appointment

import (
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/google/uuid"
)

type CreateAppointmentRequest struct {
	PetID                  uint               `json:"pet_id" validate:"required"`
	ReminderID             *uuid.UUID         `json:"reminder_id"`
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
	MedicalRecord          *MedicalRecordResponse    `json:"medical_record,omitempty"`
}

type MedicalRecordResponse struct {
	PhysicalExamination PhysicalExaminationDTO   `json:"physical_examination"`
	Type                models.ServiceType       `json:"type"`
	Vaccine             *VaccineMedicalDataDTO   `json:"vaccine,omitempty"`
	Checkup             *CheckupMedicalDataDTO   `json:"checkup,omitempty"`
	Treatment           *TreatmentMedicalDataDTO `json:"treatment,omitempty"`
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

type SaveMedicalRecordRequest struct {
	PhysicalExamination PhysicalExaminationDTO   `json:"physical_examination" validate:"required"`
	Vaccine             *VaccineMedicalDataDTO   `json:"vaccine"`
	Checkup             *CheckupMedicalDataDTO   `json:"checkup"`
	Treatment           *TreatmentMedicalDataDTO `json:"treatment"`
	Reminders           []ReminderInputDTO       `json:"reminders" validate:"omitempty,dive"`
}

type PhysicalExaminationDTO struct {
	Weight            float64 `json:"weight" validate:"required,gt=0"`
	Temperature       float64 `json:"temperature" validate:"required,gt=0"`
	PhysicalCondition string  `json:"physical_condition" validate:"required"`
	HeartRate         string  `json:"heart_rate"`
	RespiratoryRate   string  `json:"respiratory_rate"`
}

type VaccineMedicalDataDTO struct {
	VaccineType         string    `json:"vaccine_type" validate:"required"`
	Brand               string    `json:"brand" validate:"required"`
	BatchNumber         string    `json:"batch_number" validate:"required"`
	AdministrationDate  core.Date `json:"administration_date" validate:"required"`
	PreVaccineCondition string    `json:"pre_vaccine_condition" validate:"required"`
	PostVaccineReaction string    `json:"post_vaccine_reaction"`
}

type CheckupMedicalDataDTO struct {
	Palpation                   string `json:"palpation" validate:"required"`
	CleanlinessNotes            string `json:"cleanliness_notes" validate:"required"`
	NutritionRecommendations    string `json:"nutrition_recommendations"`
	PeriodicCareRecommendations string `json:"periodic_care_recommendations"`
}

type PrescriptionDTO struct {
	Name      string `json:"name" validate:"required"`
	Dosage    string `json:"dosage" validate:"required"`
	Frequency string `json:"frequency" validate:"required"`
}

type TreatmentMedicalDataDTO struct {
	ClinicalSymptoms string            `json:"clinical_symptoms" validate:"required"`
	Diagnosis        string            `json:"diagnosis" validate:"required"`
	MedicalActions   string            `json:"medical_actions" validate:"required"`
	Prescriptions    []PrescriptionDTO `json:"prescriptions" validate:"required,dive"`
	HomeCareNotes    string            `json:"home_care_notes"`
	EstimatedCost    float64           `json:"estimated_cost" validate:"required,gte=0"`
}

type ReminderInputDTO struct {
	ServiceType  models.ServiceType `json:"service_type" validate:"required,oneof=vaccine checkup treatment"`
	Description  string             `json:"description" validate:"required"`
	ReminderDate core.Date          `json:"reminder_date" validate:"required"`
}
