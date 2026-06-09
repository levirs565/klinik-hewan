package staff

import (
	"errors"
	"net/http"
	"vetconnect-server/core"
	"vetconnect-server/models"

	"github.com/labstack/echo/v5"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (ctrl *Controller) RegisterRoutes(group *echo.Group) {
	group.GET("", ctrl.GetStaffList, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.GET("/doctors", ctrl.GetDoctorList, core.NewGuardRolesMiddleware(core.GuardRoleManager, core.GuardRoleReceptionist))
	group.POST("/doctor", ctrl.CreateDoctor, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.POST("/receptionist", ctrl.CreateReceptionist, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.GET("/doctor/:id", ctrl.GetDoctorDetail, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.GET("/receptionist/:id", ctrl.GetReceptionistDetail, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.PUT("/doctor/:id", ctrl.UpdateDoctor, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.PUT("/receptionist/:id", ctrl.UpdateReceptionist, core.NewGuardRoleMiddleware(core.GuardRoleManager))
}

// GetStaffList returns a list of all staff members.
// @Summary Get Staff List
// @Description Get a list of all staff members (Managers, Receptionists, Doctors).
// @Tags Staff
// @Produce json
// @Param role query string false "Filter by role"
// @Param is_active query boolean false "Filter by activity status"
// @Success 200 {array} StaffResponse
// @Security BearerAuth
// @Router /staff [get]
func (ctrl *Controller) GetStaffList(c *echo.Context) error {
	var req GetStaffListRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.GetStaffList((*c).Request().Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// GetDoctorList returns a list of all active doctors.
// @Summary Get Doctor List
// @Description Get a list of all staff members with the Doctor role.
// @Tags Staff
// @Produce json
// @Success 200 {array} StaffResponse
// @Security BearerAuth
// @Router /staff/doctors [get]
func (ctrl *Controller) GetDoctorList(c *echo.Context) error {
	req := GetStaffListRequest{
		Role: models.RoleDoctor,
	}

	res, err := ctrl.service.GetStaffList((*c).Request().Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// CreateDoctor creates a new doctor account and profile.
// @Summary Create Doctor
// @Description Create a new internal user with the Doctor role and an associated doctor profile.
// @Tags Staff
// @Accept json
// @Produce json
// @Param request body CreateDoctorRequest true "Create Request"
// @Success 201 {object} CreateDoctorResponse
// @Security BearerAuth
// @Router /staff/doctor [post]
func (ctrl *Controller) CreateDoctor(c *echo.Context) error {
	var req CreateDoctorRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.CreateDoctor((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrUsernameAlreadyExists) {
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}

// CreateReceptionist creates a new receptionist account.
// @Summary Create Receptionist
// @Description Create a new internal user with the Receptionist role.
// @Tags Staff
// @Accept json
// @Produce json
// @Param request body CreateReceptionistRequest true "Create Request"
// @Success 201 {object} CreateReceptionistResponse
// @Security BearerAuth
// @Router /staff/receptionist [post]
func (ctrl *Controller) CreateReceptionist(c *echo.Context) error {
	var req CreateReceptionistRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.CreateReceptionist((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrUsernameAlreadyExists) {
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}

// GetDoctorDetail returns the full details of a doctor.
// @Summary Get Doctor Detail
// @Description Get comprehensive information about a specific doctor, including professional profile.
// @Tags Staff
// @Produce json
// @Param id path uint true "Internal User ID"
// @Success 200 {object} DoctorDetailResponse
// @Security BearerAuth
// @Router /staff/doctor/{id} [get]
func (ctrl *Controller) GetDoctorDetail(c *echo.Context) error {
	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor id")
	}

	res, err := ctrl.service.GetDoctorDetail((*c).Request().Context(), id)
	if err != nil {
		if errors.Is(err, ErrDoctorNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// UpdateDoctor updates a doctor's account and professional profile.
// @Summary Update Doctor
// @Description Update the account details and professional profile of an existing doctor.
// @Tags Staff
// @Accept json
// @Produce json
// @Param id path uint true "Internal User ID"
// @Param request body UpdateDoctorRequest true "Update Request"
// @Success 200 {object} CreateDoctorResponse
// @Security BearerAuth
// @Router /staff/doctor/{id} [put]
func (ctrl *Controller) UpdateDoctor(c *echo.Context) error {
	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid doctor id")
	}

	var req UpdateDoctorRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.UpdateDoctor((*c).Request().Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrDoctorNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// GetReceptionistDetail returns the details of a receptionist account.
// @Summary Get Receptionist Detail
// @Description Get information about a specific receptionist account.
// @Tags Staff
// @Produce json
// @Param id path uint true "Internal User ID"
// @Success 200 {object} ReceptionistDetailResponse
// @Security BearerAuth
// @Router /staff/receptionist/{id} [get]
func (ctrl *Controller) GetReceptionistDetail(c *echo.Context) error {
	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid receptionist id")
	}

	res, err := ctrl.service.GetReceptionistDetail((*c).Request().Context(), id)
	if err != nil {
		if errors.Is(err, ErrReceptionistNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

// UpdateReceptionist updates a receptionist's account information.
// @Summary Update Receptionist
// @Description Update the account details of an existing receptionist.
// @Tags Staff
// @Accept json
// @Produce json
// @Param id path uint true "Internal User ID"
// @Param request body UpdateReceptionistRequest true "Update Request"
// @Success 200 {object} CreateReceptionistResponse
// @Security BearerAuth
// @Router /staff/receptionist/{id} [put]
func (ctrl *Controller) UpdateReceptionist(c *echo.Context) error {
	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid receptionist id")
	}

	var req UpdateReceptionistRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.UpdateReceptionist((*c).Request().Context(), id, req)
	if err != nil {
		if errors.Is(err, ErrReceptionistNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}
