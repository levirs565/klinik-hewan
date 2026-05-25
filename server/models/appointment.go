package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Appointment struct {
	ID                     uuid.UUID      `gorm:"type:char(36);primaryKey"`
	PetID                  uint           `gorm:"not null"`
	DoctorID               *uint          `gorm:"default:null"`
	ServiceType            string         `gorm:"type:enum('vaccine','checkup','treatment');not null"`
	AppointmentDate        datatypes.Date `gorm:"type:date;not null"`
	QueueNumber            *int           `gorm:"default:null"`
	OwnerNotes             string         `gorm:"type:text"`
	PreviousMedicalHistory string         `gorm:"type:text"`
	CurrentState           string         `gorm:"size:100;not null;default:'Menunggu Konfirmasi'"`
	CreatedAt              time.Time
	UpdatedAt              time.Time
}
