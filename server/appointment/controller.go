package appointment

import (
	"errors"
	"net/http"
	"vetconnect-server/core"

	"github.com/google/uuid"
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
	appointments.GET("", ctrl.GetOwnerAppointments)
	appointments.GET("/:id", ctrl.GetAppointmentDetail)

	internal := g.Group("/internal/appointments")
	internal.Use(core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.GET("", ctrl.GetAllAppointments)
}

func (ctrl *Controller) GetAllAppointments(c *echo.Context) error {
	status := c.QueryParam("status")
	date := c.QueryParam("date")

	res, err := ctrl.service.GetAllAppointments(c.Request().Context(), status, date)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
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

func (ctrl *Controller) GetOwnerAppointments(c *echo.Context) error {
	filter := c.QueryParam("filter")
	session := core.GetUserSession(c)
	res, err := ctrl.service.GetOwnerAppointments(c.Request().Context(), session.ID, filter)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) GetAppointmentDetail(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	session := core.GetUserSession(c)
	res, err := ctrl.service.GetAppointmentDetail(c.Request().Context(), session.ID, appointmentID)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}
