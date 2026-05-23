package pet

type GetPresignedURLRequest struct {
	FileSize    int64  `json:"file_size" validate:"required,min=1,max=5242880"` // Max 5MB
	ContentType string `json:"content_type" validate:"required,oneof=image/jpeg image/png image/webp"`
}

type GetPresignedURLResponse struct {
	UploadID string            `json:"upload_id"`
	URL      string            `json:"url"`
	Method   string            `json:"method"`
	Headers  map[string]string `json:"headers"`
}
