package staff

import (
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
