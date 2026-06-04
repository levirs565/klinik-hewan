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
