package appointment

import (
	"errors"
	"net/http"
	"vetconnect-server/core"
	"vetconnect-server/models"

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
	internal.GET("", ctrl.GetAllAppointments, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.GET("/:id", ctrl.GetInternalAppointmentDetail, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/approve", ctrl.ApproveAppointment, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/reject", ctrl.RejectAppointment, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/select-doctor", ctrl.SelectDoctor, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/doctor-reject", ctrl.DoctorRejectAppointment, core.NewGuardRoleMiddleware(core.GuardRoleDoctor))
}

func (ctrl *Controller) DoctorRejectAppointment(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	var req RejectAppointmentRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	err = ctrl.service.DoctorRejectAppointment(c.Request().Context(), session.ID, appointmentID, req.Reason)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

func (ctrl *Controller) SelectDoctor(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	var req SelectDoctorRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	err = ctrl.service.SelectDoctor(c.Request().Context(), session.ID, appointmentID, req.DoctorID)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) || errors.Is(err, ErrDoctorNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		if err.Error() == "appointment must be in accepted state to select a doctor" {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

func (ctrl *Controller) RejectAppointment(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	var req RejectAppointmentRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	err = ctrl.service.RejectAppointment(c.Request().Context(), session.ID, appointmentID, req.Reason)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		if errors.Is(err, ErrInvalidAppointmentState) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

func (ctrl *Controller) ApproveAppointment(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	session := core.GetUserSession(c)
	err = ctrl.service.ApproveAppointment(c.Request().Context(), session.ID, appointmentID)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		if errors.Is(err, ErrInvalidAppointmentState) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

func (ctrl *Controller) GetInternalAppointmentDetail(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	res, err := ctrl.service.GetInternalAppointmentDetail(c.Request().Context(), appointmentID)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) GetAllAppointments(c *echo.Context) error {
	status := c.QueryParam("status")
	date := c.QueryParam("date")

	res, err := ctrl.service.GetAllAppointments(c.Request().Context(), models.AppointmentState(status), date)
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
