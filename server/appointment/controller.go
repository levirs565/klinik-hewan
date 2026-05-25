package appointment

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
	return &Controller{
		service: service,
	}
}

func (ctrl *Controller) RegisterRoutes(g *echo.Group) {
	appointments := g.Group("/appointments")
	appointments.Use(core.NewGuardRoleMiddleware(core.GuardRoleOwner))
	appointments.POST("", ctrl.CreateAppointment)
}

func (ctrl *Controller) CreateAppointment(c *echo.Context) error {
	var req CreateAppointmentRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	res, err := ctrl.service.CreateAppointment(c.Request().Context(), session.ID, req)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}
