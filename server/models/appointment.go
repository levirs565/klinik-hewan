package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type AppointmentState string

const (
	StateWaitingConfirmation AppointmentState = "Menunggu Konfirmasi"
	StateAccepted            AppointmentState = "Diterima"
	StateRejected            AppointmentState = "Ditolak"
	StateCheckIn             AppointmentState = "Check-In"
	StateDoctorAllocation    AppointmentState = "Alokasi Dokter"
	StateWaitingDoctor       AppointmentState = "Menunggu Dokter"
	StateInTreatment         AppointmentState = "Dalam Penanganan"
	StateFinished            AppointmentState = "Selesai"
	StateAdminFinished       AppointmentState = "Selesai Administrasi"
)

type Appointment struct {
	ID                     uuid.UUID        `gorm:"type:char(36);primaryKey"`
	PetID                  uint             `gorm:"not null"`
	Pet                    Pet              `gorm:"foreignKey:PetID"`
	DoctorID               *uint            `gorm:"default:null"`
	ServiceType            string           `gorm:"type:enum('vaccine','checkup','treatment');not null"`
	AppointmentDate        datatypes.Date   `gorm:"type:date;not null"`
	QueueNumber            *int             `gorm:"default:null"`
	OwnerNotes             string           `gorm:"type:text"`
	PreviousMedicalHistory string           `gorm:"type:text"`
	CurrentState           AppointmentState `gorm:"type:varchar(100);not null;default:'Menunggu Konfirmasi'"`
	CreatedAt              time.Time
	UpdatedAt              time.Time
}
