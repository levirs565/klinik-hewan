package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AppointmentReservation struct {
	ID            primitive.ObjectID           `bson:"_id,omitempty"`
	AppointmentID string                       `bson:"appointment_id"`
	ServiceType   string                       `bson:"service_type"`
	Checkup       *CheckupReservationDetails   `bson:"checkup,omitempty"`
	Treatment     *TreatmentReservationDetails `bson:"treatment,omitempty"`
	Vaccine       *VaccineReservationDetails   `bson:"vaccine,omitempty"`
	CreatedAt     time.Time                    `bson:"created_at"`
}

type CheckupReservationDetails struct {
	Purpose   string `bson:"purpose"`
	FocusArea string `bson:"focus_area"`
}

type TreatmentReservationDetails struct {
	ObservedSymptoms []string `bson:"observed_symptoms"`
	SymptomDuration  string   `bson:"symptom_duration"`
	HomeCareReceived bool     `bson:"home_care_received"`
}

type VaccineReservationDetails struct {
	VaccineType string `bson:"vaccine_type"`
}
