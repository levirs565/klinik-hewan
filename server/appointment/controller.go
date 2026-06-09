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
	internal.GET("", ctrl.GetAllAppointments, core.NewGuardRoleMiddleware(core.GuardRoleInternal))
	internal.GET("/:id", ctrl.GetInternalAppointmentDetail, core.NewGuardRoleMiddleware(core.GuardRoleInternal))
	internal.POST("/:id/approve", ctrl.ApproveAppointment, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/reject", ctrl.RejectAppointment, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/select-doctor", ctrl.SelectDoctor, core.NewGuardRoleMiddleware(core.GuardRoleReceptionist))
	internal.POST("/:id/doctor-reject", ctrl.DoctorRejectAppointment, core.NewGuardRoleMiddleware(core.GuardRoleDoctor))
	internal.POST("/:id/doctor-approve", ctrl.DoctorApproveAppointment, core.NewGuardRoleMiddleware(core.GuardRoleDoctor))
	internal.POST("/:id/medical-record", ctrl.SaveMedicalRecord, core.NewGuardRoleMiddleware(core.GuardRoleDoctor))
}

// DoctorApproveAppointment marks an appointment as being in treatment by the assigned doctor.
// @Summary Doctor Approve Appointment
// @Description Transition an appointment from 'Waiting Doctor' to 'In Treatment' state.
// @Tags Appointment
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Success 200 {object} core.ActionResponse
// @Security BearerAuth
// @Router /internal/appointments/{id}/doctor-approve [post]
func (ctrl *Controller) DoctorApproveAppointment(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	session := core.GetUserSession(c)
	err = ctrl.service.DoctorApproveAppointment(c.Request().Context(), session.ID, appointmentID)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

// DoctorRejectAppointment rejects an appointment by the assigned doctor and returns it to the accepted state.
// @Summary Doctor Reject Appointment
// @Description Rejects an assigned appointment, moving it back to 'Accepted' state for reassignment.
// @Tags Appointment
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Param request body RejectAppointmentRequest true "Rejection Reason"
// @Success 200 {object} core.ActionResponse
// @Security BearerAuth
// @Router /internal/appointments/{id}/doctor-reject [post]
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

// SelectDoctor assigns a doctor to an accepted appointment.
// @Summary Select Doctor
// @Description Assign a specific doctor to an appointment that has been accepted.
// @Tags Appointment
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Param request body SelectDoctorRequest true "Doctor ID"
// @Success 200 {object} core.ActionResponse
// @Security BearerAuth
// @Router /internal/appointments/{id}/select-doctor [post]
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

// RejectAppointment rejects a new appointment request by a receptionist.
// @Summary Reject Appointment
// @Description Rejects a new appointment request with a provided reason.
// @Tags Appointment
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Param request body RejectAppointmentRequest true "Rejection Reason"
// @Success 200 {object} core.ActionResponse
// @Security BearerAuth
// @Router /internal/appointments/{id}/reject [post]
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

// ApproveAppointment accepts a new appointment request by a receptionist.
// @Summary Approve Appointment
// @Description Accepts a new appointment request, moving it to 'Accepted' state.
// @Tags Appointment
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Success 200 {object} core.ActionResponse
// @Security BearerAuth
// @Router /internal/appointments/{id}/approve [post]
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

// GetInternalAppointmentDetail returns full details of an appointment for internal use.
// @Summary Get Internal Appointment Detail
// @Description Get comprehensive appointment information for staff members.
// @Tags Appointment
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Success 200 {object} InternalAppointmentDetailResponse
// @Security BearerAuth
// @Router /internal/appointments/{id} [get]
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

// GetAllAppointments returns a list of all appointments based on status and date filters.
// @Summary Get All Appointments (Internal)
// @Description Get a list of appointments for staff, with optional status, date, and doctor filters.
// @Tags Appointment
// @Produce json
// @Param status query string false "Appointment Status"
// @Param date query string false "Appointment Date (YYYY-MM-DD)"
// @Param my_appointments query boolean false "Filter for doctor's own appointments"
// @Success 200 {array} AppointmentListItem
// @Security BearerAuth
// @Router /internal/appointments [get]
func (ctrl *Controller) GetAllAppointments(c *echo.Context) error {
	status := c.QueryParam("status")
	date := c.QueryParam("date")
	isMyAppointments := c.QueryParam("my_appointments") == "true"

	session := core.GetUserSession(c)
	var doctorID *uint
	if isMyAppointments && session.Role == models.RoleDoctor {
		id := session.ID
		doctorID = &id
	}

	res, err := ctrl.service.GetAllAppointments(c.Request().Context(), models.AppointmentState(status), date, doctorID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// CreateAppointment creates a new appointment request for an owner's pet.
// @Summary Create Appointment
// @Description Create a new appointment request for a pet.
// @Tags Appointment
// @Accept json
// @Produce json
// @Param request body CreateAppointmentRequest true "Create Request"
// @Success 201 {object} CreateAppointmentResponse
// @Security BearerAuth
// @Router /appointments [post]
func (ctrl *Controller) CreateAppointment(c *echo.Context) error {
	var req CreateAppointmentRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	res, err := ctrl.service.CreateAppointment((*c).Request().Context(), session.ID, req)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) || errors.Is(err, ErrReminderNotFound) || errors.Is(err, ErrReminderTypeMismatch) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}

// GetOwnerAppointments returns a list of appointments for the logged-in owner.
// @Summary Get Owner Appointments
// @Description Get a list of upcoming or past appointments for the current pet owner.
// @Tags Appointment
// @Produce json
// @Param filter query string false "Filter: 'upcoming' or 'past'"
// @Success 200 {array} AppointmentListItem
// @Security BearerAuth
// @Router /appointments [get]
func (ctrl *Controller) GetOwnerAppointments(c *echo.Context) error {
	filter := c.QueryParam("filter")
	session := core.GetUserSession(c)
	res, err := ctrl.service.GetOwnerAppointments(c.Request().Context(), session.ID, filter)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// GetAppointmentDetail returns the details of a specific appointment for the owner.
// @Summary Get Appointment Detail
// @Description Get details of a specific appointment for the authenticated owner.
// @Tags Appointment
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Success 200 {object} AppointmentDetailResponse
// @Security BearerAuth
// @Router /appointments/{id} [get]
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

// SaveMedicalRecord saves the medical record data and completes the appointment.
// @Summary Save Medical Record
// @Description Save physical examination, service-specific data, and reminders for an appointment.
// @Tags Appointment
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID (UUID)"
// @Param request body SaveMedicalRecordRequest true "Medical Record Data"
// @Success 200 {object} core.ActionResponse
// @Security BearerAuth
// @Router /internal/appointments/{id}/medical-record [post]
func (ctrl *Controller) SaveMedicalRecord(c *echo.Context) error {
	idParam := c.Param("id")
	appointmentID, err := uuid.Parse(idParam)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid appointment id")
	}

	var req SaveMedicalRecordRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	err = ctrl.service.SaveMedicalRecord(c.Request().Context(), session.ID, appointmentID, req)
	if err != nil {
		if errors.Is(err, ErrAppointmentNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}
