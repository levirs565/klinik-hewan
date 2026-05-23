package models

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
