package auth

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

func (ctrl *Controller) RegisterRoutes(e *echo.Group) {
	e.POST("/owner/register", ctrl.RegisterOwner)
}

func (ctrl *Controller) RegisterOwner(c *echo.Context) error {
	var req RegisterOwnerRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.RegisterOwner((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrEmailAlreadyRegistered) {
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}
