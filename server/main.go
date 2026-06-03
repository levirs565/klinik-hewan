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
	"vetconnect-server/reminder"
	"vetconnect-server/staff"

	"vetconnect-server/models"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		slog.Warn("Error loading .env file, using environment variables")
	}

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

	// Initialize Service
	authService := auth.NewService(db, mongoClient, tokenHelper)

	// Check for CLI commands
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "create-manager":
			if len(os.Args) < 5 {
				fmt.Println("Usage: create-manager <username> <password> <full_name>")
				return
			}
			username := os.Args[2]
			password := os.Args[3]
			fullName := os.Args[4]

			err := authService.CreateInternalUser(context.Background(), username, password, fullName, models.RoleManager)
			if err != nil {
				fmt.Printf("Error creating manager: %v\n", err)
				os.Exit(1)
			}
			fmt.Println("Manager account created successfully")
			return
		}
	}

	e := echo.New()
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	// Initialize Validator
	e.Validator = core.NewValidator()

	// Initialize Layers
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

	appointmentService := appointment.NewService(db, mongoClient, s3Helper)
	appointmentController := appointment.NewController(appointmentService)

	staffService := staff.NewService(db, s3Helper)
	staffController := staff.NewController(staffService)

	reminderService := reminder.NewService(db, s3Helper)
	reminderController := reminder.NewController(reminderService)

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
	reminderController.RegisterRoutes(api)
	staffController.RegisterRoutes(api.Group("/staff"))

	if err := e.Start(":1323"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
