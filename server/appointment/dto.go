package appointment

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

type AppointmentDate time.Time

func (ad *AppointmentDate) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "null" || s == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return err
	}
	*ad = AppointmentDate(t)
	return nil
}

func (ad AppointmentDate) Time() time.Time {
	return time.Time(ad)
}

type CreateAppointmentRequest struct {
	PetID                  uint              `json:"pet_id" validate:"required"`
	ServiceType            string            `json:"service_type" validate:"required,oneof=vaccine checkup treatment"`
	AppointmentDate        AppointmentDate   `json:"appointment_date" validate:"required"`
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
