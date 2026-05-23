package models

import (
	"time"

	"gorm.io/datatypes"
)

type Pet struct {
	ID                    uint           `gorm:"primaryKey"`
	OwnerID               uint           `gorm:"not null"`
	Name                  string         `gorm:"size:255;not null"`
	Species               string         `gorm:"size:100;not null"`
	Breed                 string         `gorm:"size:100;not null"`
	Gender                string         `gorm:"type:enum('male','female');not null"`
	BirthDate             datatypes.Date `gorm:"type:date;not null"`
	HairColor             string         `gorm:"size:100;not null"`
	InitialMedicalHistory string         `gorm:"type:text"`
	AvatarID              string         `gorm:"size:255"`
	CreatedAt             time.Time
	UpdatedAt             time.Time
}
