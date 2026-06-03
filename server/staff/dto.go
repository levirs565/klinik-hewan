package staff

import (
	"vetconnect-server/core"
	"vetconnect-server/models"
)

type GetStaffListRequest struct {
	Role  models.AccountRole `query:"role" validate:"omitempty,oneof=doctor receptionist"`
	Limit int                `query:"limit" validate:"omitempty,min=1,max=100"`
}

type StaffResponse struct {
	ID        uint               `json:"id"`
	FullName  string             `json:"full_name"`
	Role      models.AccountRole `json:"role"`
	AvatarURL string             `json:"avatar_url,omitempty"`
}

type CreateDoctorRequest struct {
	Username                string    `json:"username" validate:"required,min=4,max=100"`
	Password                string    `json:"password" validate:"required,min=6"`
	FullName                string    `json:"full_name" validate:"required,max=255"`
	IsActive                bool      `json:"is_active"`
	BirthDate               core.Date `json:"birth_date" validate:"required"`
	EducationHistory        string    `json:"education_history" validate:"required"`
	PracticeStartDate       core.Date `json:"practice_start_date" validate:"required"`
	JoinDate                core.Date `json:"join_date" validate:"required"`
	PracticeLocationHistory string    `json:"practice_location_history" validate:"required"`
}

type CreateDoctorResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
}
