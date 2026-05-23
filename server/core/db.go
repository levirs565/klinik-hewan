package core

import (
	"context"
	"fmt"
	"os"
	"time"
	"vetconnect-server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DB_URL environment variable is not set")
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	// Auto Migrate the models
	err = db.AutoMigrate(
		&models.ExternalUser{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return db, nil
}

type MongoStorage struct {
	Client        *mongo.Client
	Database      *mongo.Database
	RefreshTokens *mongo.Collection
}

func InitMongoDB() (*MongoStorage, error) {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return nil, fmt.Errorf("MONGODB_URI environment variable is not set")
	}

	dbName := os.Getenv("MONGODB_DATABASE")
	if dbName == "" {
		return nil, fmt.Errorf("MONGODB_DATABASE environment variable is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	db := client.Database(dbName)

	storage := &MongoStorage{
		Client:        client,
		Database:      db,
		RefreshTokens: db.Collection("refresh_tokens"),
	}

	if err := ensureIndexes(ctx, storage); err != nil {
		return nil, fmt.Errorf("failed to ensure mongodb indexes: %w", err)
	}

	return storage, nil
}

func ensureIndexes(ctx context.Context, s *MongoStorage) error {
	// Indexes for RefreshTokens
	_, err := s.RefreshTokens.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "token", Value: 1},
				{Key: "is_revoked", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				{Key: "user_type", Value: 1},
				{Key: "user_id", Value: 1},
			},
		},
		{
			Keys: bson.D{
				{Key: "ttl_expiry", Value: 1},
			},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
	})
	return err
}
