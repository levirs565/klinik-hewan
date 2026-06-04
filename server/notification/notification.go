package notification

import (
	"context"
	"log/slog"
	"vetconnect-server/models"
)

type NotificationData struct {
	Title string
	Body  string
}

type Service interface {
	SendNotification(ctx context.Context, userType models.UserType, userId uint, data NotificationData, extraData map[string]string) error
}

type compositeService struct {
	services []Service
}

func NewCompositeService(services ...Service) Service {
	return &compositeService{services: services}
}

func (s *compositeService) SendNotification(ctx context.Context, userType models.UserType, userId uint, data NotificationData, extraData map[string]string) error {
	for _, svc := range s.services {
		if err := svc.SendNotification(ctx, userType, userId, data, extraData); err != nil {
			slog.Error("failed to send notification through provider", "error", err)
			continue
		}
	}
	return nil
}

type logService struct{}

func NewLogService() Service {
	return &logService{}
}

func (s *logService) SendNotification(ctx context.Context, userType models.UserType, userId uint, data NotificationData, extraData map[string]string) error {
	slog.Info("Notification Sent (Log Provider)",
		"user_type", userType,
		"user_id", userId,
		"title", data.Title,
		"body", data.Body,
		"extra", extraData,
	)
	return nil
}
