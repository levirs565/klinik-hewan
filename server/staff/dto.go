package staff

import "vetconnect-server/models"

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

type GetStaffListResponse struct {
	Data []StaffResponse `json:"data"`
}
