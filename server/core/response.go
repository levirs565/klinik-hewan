package core

type ActionResponse struct {
	Success bool `json:"success"`
}

func CreateActionResponse(success bool) ActionResponse {
	return ActionResponse{
		Success: success,
	}
}
