package models

import "gorm.io/datatypes"

type AccountRole string

const (
	RoleManager      AccountRole = "manager"
	RoleReceptionist AccountRole = "receptionist"
	RoleDoctor       AccountRole = "doctor"
	RoleOwner        AccountRole = "owner"
)

type ExternalUser struct {
	ID          uint   `gorm:"primaryKey"`
	Email       string `gorm:"uniqueIndex;not null"`
	Password    string `gorm:"not null"`
	FullName    string `gorm:"not null"`
	Address     string
	PhoneNumber string
}

type InternalUser struct {
	ID            uint           `gorm:"primaryKey"`
	Username      string         `gorm:"uniqueIndex;size:100;not null"`
	Password      string         `gorm:"not null"`
	Role          AccountRole    `gorm:"type:enum('manager','receptionist','doctor');not null"`
	FullName      string         `gorm:"size:255;not null"`
	AvatarID      string         `gorm:"size:255"`
	IsActive      bool           `gorm:"default:true"`
	DoctorProfile *DoctorProfile `gorm:"foreignKey:InternalUserID"`
}

type DoctorProfile struct {
	ID                      uint         `gorm:"primaryKey"`
	InternalUserID          uint         `gorm:"not null"`
	InternalUser            InternalUser `gorm:"foreignKey:InternalUserID"`
	BirthDate               datatypes.Date
	EducationHistory        string `gorm:"type:text"`
	PracticeStartDate       datatypes.Date
	JoinDate                datatypes.Date
	PracticeLocationHistory string `gorm:"type:text"`
}
