package pet

import (
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

func (ctrl *Controller) RegisterRoutes(group *echo.Group) {
	petGroup := group.Group("/pets")
	petGroup.Use(core.NewGuardRoleMiddleware(core.GuardRoleOwner))
	petGroup.POST("/avatar/presigned-url", ctrl.GetPresignedURL)
}

func (ctrl *Controller) GetPresignedURL(c *echo.Context) error {
	var req GetPresignedURLRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)

	res, err := ctrl.service.GetPresignedURL(c.Request().Context(), session.ID, req.ContentType)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}
