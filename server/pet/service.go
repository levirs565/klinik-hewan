package pet

import (
	"context"
	"fmt"
	"time"
	"vetconnect-server/core"

	"github.com/google/uuid"
)

type Service struct {
	s3 *core.S3Helper
}

func NewService(s3 *core.S3Helper) *Service {
	return &Service{
		s3: s3,
	}
}

func (s *Service) GetPresignedURL(ctx context.Context, userID uint, contentType string) (*GetPresignedURLResponse, error) {
	uploadID := uuid.New().String()
	key := fmt.Sprintf("temp/%d/pet_avatar/%s", userID, uploadID)

	presigned, err := s.s3.GeneratePresignedPutURL(ctx, key, contentType, 15*time.Minute)
	if err != nil {
		return nil, err
	}

	return &GetPresignedURLResponse{
		UploadID: uploadID,
		URL:      presigned.URL,
		Method:   presigned.Method,
		Headers:  presigned.Headers,
	}, nil
}
