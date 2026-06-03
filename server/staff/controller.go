package staff

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
	group.GET("", ctrl.GetStaffList, core.NewGuardRoleMiddleware(core.GuardRoleManager))
	group.POST("/doctor", ctrl.CreateDoctor, core.NewGuardRoleMiddleware(core.GuardRoleManager))
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
