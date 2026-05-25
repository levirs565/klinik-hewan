package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"
	"vetconnect-server/appointment"
	"vetconnect-server/auth"
	"vetconnect-server/core"
	"vetconnect-server/pet"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		slog.Warn("Error loading .env file, using environment variables")
	}

	e := echo.New()
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	// Initialize Validator
	e.Validator = core.NewValidator()

	// Initialize Database
	db, err := core.InitDB()
	if err != nil {
		panic(err)
	}

	mongoClient, err := core.InitMongoDB()
	if err != nil {
		panic(err)
	}

	// Initialize TokenHelper
	jwtKey := os.Getenv("JWT_SECRET")
	if jwtKey == "" {
		panic("JWT_SECRET environment variable is not set")
	}
	tokenHelper := core.NewTokenHelper(jwtKey)

	// Initialize Layers
	authService := auth.NewService(db, mongoClient, tokenHelper)
	authController := auth.NewController(authService)

	s3Helper, err := core.NewS3Helper()
	if err != nil {
		panic(fmt.Errorf("S3 Helper initialization failed: %w", err))
	}

	// Set lifecycle policy for temp files
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := s3Helper.ConfigureLifecyclePolicy(ctx); err != nil {
		panic(fmt.Errorf("failed to configure S3 lifecycle policy: %w", err))
	}

	petService := pet.NewService(db, s3Helper)
	petController := pet.NewController(petService)

	appointmentService := appointment.NewService(db, mongoClient)
	appointmentController := appointment.NewController(appointmentService)

	// Routes
	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "VetConnect API")
	})

	// Register Domain Routes
	api := e.Group("/api")
	api.Use(core.NewSessionMiddleware(tokenHelper))
	authController.RegisterRoutes(api)
	petController.RegisterRoutes(api)
	appointmentController.RegisterRoutes(api)

	if err := e.Start(":1323"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
