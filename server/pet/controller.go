package pet

import (
	"errors"
	"net/http"
	"vetconnect-server/core"

	"github.com/labstack/echo/v5"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (ctrl *Controller) RegisterRoutes(group *echo.Group) {
	petGroup := group.Group("/pets")
	petGroup.Use(core.NewGuardRoleMiddleware(core.GuardRoleOwner))
	petGroup.GET("", ctrl.GetMyPets)
	petGroup.GET("/:id", ctrl.GetPetDetail)
	petGroup.GET("/:id/reminders", ctrl.GetPetReminders)
	petGroup.GET("/:id/appointments", ctrl.GetPetAppointments)
	petGroup.PUT("/:id", ctrl.UpdatePet)
	petGroup.POST("", ctrl.CreatePet)
	petGroup.POST("/avatar/presigned-url", ctrl.GetPresignedURL)
}

// GetMyPets returns all pets belonging to the logged-in owner.
// @Summary Get My Pets
// @Description Get a list of all pets owned by the currently authenticated pet owner.
// @Tags Pet
// @Produce json
// @Success 200 {array} MyPetResponse
// @Security BearerAuth
// @Router /pets [get]
func (ctrl *Controller) GetMyPets(c *echo.Context) error {
	session := core.GetUserSession(c)

	res, err := ctrl.service.GetMyPets((*c).Request().Context(), session.ID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// GetPetDetail returns the details of a specific pet.
// @Summary Get Pet Detail
// @Description Get detailed information about a specific pet owned by the current user.
// @Tags Pet
// @Produce json
// @Param id path uint true "Pet ID"
// @Success 200 {object} PetResponse
// @Security BearerAuth
// @Router /pets/{id} [get]
func (ctrl *Controller) GetPetDetail(c *echo.Context) error {
	session := core.GetUserSession(c)

	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid pet id")
	}

	res, err := ctrl.service.GetPetDetail((*c).Request().Context(), session.ID, id)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// GetPetReminders returns all active reminders for a specific pet.
// @Summary Get Pet Reminders
// @Description Get a list of all reminders for a specific pet owned by the current user.
// @Tags Pet
// @Produce json
// @Param id path uint true "Pet ID"
// @Success 200 {array} PetReminderResponse
// @Security BearerAuth
// @Router /pets/{id}/reminders [get]
func (ctrl *Controller) GetPetReminders(c *echo.Context) error {
	session := core.GetUserSession(c)

	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid pet id")
	}

	res, err := ctrl.service.GetPetReminders((*c).Request().Context(), session.ID, id)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// GetPetAppointments returns all appointments for a specific pet.
// @Summary Get Pet Appointments
// @Description Get a list of all appointments for a specific pet owned by the current user.
// @Tags Pet
// @Produce json
// @Param id path uint true "Pet ID"
// @Success 200 {array} PetAppointmentResponse
// @Security BearerAuth
// @Router /pets/{id}/appointments [get]
func (ctrl *Controller) GetPetAppointments(c *echo.Context) error {
	session := core.GetUserSession(c)

	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid pet id")
	}

	res, err := ctrl.service.GetPetAppointments((*c).Request().Context(), session.ID, id)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// UpdatePet updates the information of an existing pet.
// @Summary Update Pet
// @Description Update the profile information of an existing pet owned by the current user.
// @Tags Pet
// @Accept json
// @Produce json
// @Param id path uint true "Pet ID"
// @Param request body CreatePetRequest true "Update Request"
// @Success 200 {object} PetResponse
// @Security BearerAuth
// @Router /pets/{id} [put]
func (ctrl *Controller) UpdatePet(c *echo.Context) error {
	session := core.GetUserSession(c)

	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid pet id")
	}

	var req CreatePetRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.UpdatePet((*c).Request().Context(), session.ID, id, req)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		if errors.Is(err, ErrAvatarNotFound) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// CreatePet registers a new pet for the logged-in owner.
// @Summary Create Pet
// @Description Register a new pet under the currently authenticated pet owner's account.
// @Tags Pet
// @Accept json
// @Produce json
// @Param request body CreatePetRequest true "Create Request"
// @Success 201 {object} PetResponse
// @Security BearerAuth
// @Router /pets [post]
func (ctrl *Controller) CreatePet(c *echo.Context) error {
	session := core.GetUserSession(c)

	var req CreatePetRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.CreatePet((*c).Request().Context(), session.ID, req)
	if err != nil {
		if errors.Is(err, ErrAvatarNotFound) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}

// GetPresignedURL generates a URL for uploading a pet's avatar to storage.
// @Summary Get Presigned URL
// @Description Generate a temporary presigned URL for secure avatar image upload.
// @Tags Pet
// @Accept json
// @Produce json
// @Param request body GetPresignedURLRequest true "Presigned URL Request"
// @Success 200 {object} GetPresignedURLResponse
// @Security BearerAuth
// @Router /pets/avatar/presigned-url [post]
func (ctrl *Controller) GetPresignedURL(c *echo.Context) error {
	var req GetPresignedURLRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)

	res, err := ctrl.service.GetPresignedURL((*c).Request().Context(), session.ID, req.ContentType, req.FileSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}
