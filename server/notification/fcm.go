package notification

import (
	"context"
	"fmt"
	"log/slog"
	"vetconnect-server/core"
	"vetconnect-server/models"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"go.mongodb.org/mongo-driver/bson"
	"google.golang.org/api/option"
)

type fcmService struct {
	mongo  *core.MongoStorage
	client *messaging.Client
}

func NewFCMService(mongo *core.MongoStorage, credentialsJSON []byte) (Service, error) {
	ctx := context.Background()
	var opts []option.ClientOption

	if len(credentialsJSON) > 0 {
		opts = append(opts, option.WithAuthCredentialsJSON(option.ServiceAccount, credentialsJSON))
	}

	app, err := firebase.NewApp(ctx, nil, opts...)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting messaging client: %v", err)
	}

	return &fcmService{
		mongo:  mongo,
		client: client,
	}, nil
}

func (s *fcmService) SendNotification(ctx context.Context, userType models.UserType, userId uint, data NotificationData, extraData map[string]string) error {
	cursor, err := s.mongo.FCMTokens.Find(ctx, bson.M{
		"user_id":   userId,
		"user_type": userType,
	})
	if err != nil {
		return fmt.Errorf("failed to fetch FCM tokens: %w", err)
	}
	defer cursor.Close(ctx)

	var tokens []models.FCMToken
	if err := cursor.All(ctx, &tokens); err != nil {
		return fmt.Errorf("failed to decode FCM tokens: %w", err)
	}

	if len(tokens) == 0 {
		slog.Debug("no FCM tokens found for user", "user_id", userId, "user_type", userType)
		return nil
	}

	var registrationTokens []string
	for _, t := range tokens {
		registrationTokens = append(registrationTokens, t.Token)
	}

	message := &messaging.MulticastMessage{
		Data: extraData,
		Notification: &messaging.Notification{
			Title: data.Title,
			Body:  data.Body,
		},
		Tokens: registrationTokens,
	}

	br, err := s.client.SendEachForMulticast(ctx, message)
	if err != nil {
		return fmt.Errorf("failed to send multicast message: %w", err)
	}

	if br.FailureCount > 0 {
		var tokensToDelete []string
		for idx, resp := range br.Responses {
			if !resp.Success {
				slog.Error("failed to send to FCM token",
					"token", registrationTokens[idx],
					"error", resp.Error,
					"user_id", userId,
				)

				if messaging.IsUnregistered(resp.Error) {
					tokensToDelete = append(tokensToDelete, registrationTokens[idx])
				}
			}
		}

		if len(tokensToDelete) > 0 {
			_, err := s.mongo.FCMTokens.DeleteMany(ctx, bson.M{
				"token": bson.M{"$in": tokensToDelete},
			})
			if err != nil {
				slog.Error("failed to cleanup invalid FCM tokens", "error", err)
			}
		}
	}

	slog.Info("FCM notifications sent",
		"user_id", userId,
		"success_count", br.SuccessCount,
		"failure_count", br.FailureCount,
	)

	return nil
}
