package auth

type LoginOwnerRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginOwnerResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RegisterOwnerRequest struct {
	FullName string `json:"full_name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type RegisterOwnerResponse struct {
	ID       uint   `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}
