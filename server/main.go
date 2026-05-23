package main

import (
	"log/slog"
	"net/http"
	"os"
	"vetconnect-server/auth"
	"vetconnect-server/core"

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

	// Routes
	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "VetConnect API")
	})

	// Register Domain Routes
	api := e.Group("/api")
	authController.RegisterRoutes(api)

	if err := e.Start(":1323"); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
