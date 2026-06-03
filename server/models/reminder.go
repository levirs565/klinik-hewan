package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Reminder struct {
	ID                      uuid.UUID      `gorm:"type:char(36);primaryKey"`
	PetID                   uint           `gorm:"not null"`
	Pet                     Pet            `gorm:"foreignKey:PetID"`
	SourceAppointmentID     uuid.UUID      `gorm:"type:char(36);not null"`
	SourceAppointment       Appointment    `gorm:"foreignKey:SourceAppointmentID"`
	FulfillingAppointmentID *uuid.UUID     `gorm:"type:char(36);default:null"`
	FulfillingAppointment   *Appointment   `gorm:"foreignKey:FulfillingAppointmentID"`
	ServiceType             ServiceType    `gorm:"type:enum('vaccine','checkup','treatment');not null"`
	Description             string         `gorm:"type:text;not null"`
	ReminderDate            datatypes.Date `gorm:"type:date;not null"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
