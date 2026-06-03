package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MedicalRecord struct {
	ID                  primitive.ObjectID    `bson:"_id,omitempty"`
	AppointmentID       string                `bson:"appointment_id"`
	PhysicalExamination PhysicalExamination   `bson:"physical_examination"`
	Type                ServiceType           `bson:"type"`
	Vaccine             *VaccineMedicalData   `bson:"vaccine,omitempty"`
	Checkup             *CheckupMedicalData   `bson:"checkup,omitempty"`
	Treatment           *TreatmentMedicalData `bson:"treatment,omitempty"`
	CreatedAt           time.Time             `bson:"created_at"`
}

type PhysicalExamination struct {
	Weight            float64 `bson:"weight"`
	Temperature       float64 `bson:"temperature"`
	PhysicalCondition string  `bson:"physical_condition"`
	HeartRate         string  `bson:"heart_rate,omitempty"`
	RespiratoryRate   string  `bson:"respiratory_rate,omitempty"`
}

type VaccineMedicalData struct {
	VaccineType         string    `bson:"vaccine_type"`
	Brand               string    `bson:"brand"`
	BatchNumber         string    `bson:"batch_number"`
	AdministrationDate  time.Time `bson:"administration_date"`
	PreVaccineCondition string    `bson:"pre_vaccine_condition"`
	PostVaccineReaction string    `bson:"post_vaccine_reaction"`
}

type CheckupMedicalData struct {
	Palpation                   string `bson:"palpation"`
	CleanlinessNotes            string `bson:"cleanliness_notes"`
	NutritionRecommendations    string `bson:"nutrition_recommendations"`
	PeriodicCareRecommendations string `bson:"periodic_care_recommendations"`
}

type TreatmentMedicalData struct {
	ClinicalSymptoms string         `bson:"clinical_symptoms"`
	Diagnosis        string         `bson:"diagnosis"`
	MedicalActions   string         `bson:"medical_actions"`
	Prescriptions    []Prescription `bson:"prescriptions"`
	HomeCareNotes    string         `bson:"home_care_notes"`
	EstimatedCost    float64        `bson:"estimated_cost"`
}

type Prescription struct {
	Name      string `bson:"name"`
	Dosage    string `bson:"dosage"`
	Frequency string `bson:"frequency"`
}
