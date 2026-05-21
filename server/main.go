package main

import (
	"net/http"
	"vetconnect-server/auth"
	"vetconnect-server/core"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
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

	// Initialize Layers
	authService := auth.NewService(db)
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
