package models

type AccountRole string

const (
	RoleManager      AccountRole = "manager"
	RoleReceptionist AccountRole = "receptionist"
	RoleDoctor       AccountRole = "doctor"
	RoleOwner        AccountRole = "owner"
)

type ExternalUser struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Email       string `gorm:"uniqueIndex;not null" json:"email"`
	Password    string `gorm:"not null" json:"-"`
	FullName    string `gorm:"not null" json:"full_name"`
	Address     string `json:"address"`
	PhoneNumber string `json:"phone_number"`
}
