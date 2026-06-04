package reminder

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
	reminderGroup := group.Group("/reminders")
	reminderGroup.Use(core.NewGuardRoleMiddleware(core.GuardRoleOwner))
	reminderGroup.GET("", ctrl.GetMyReminders)
}

func (ctrl *Controller) GetMyReminders(c *echo.Context) error {
	session := core.GetUserSession(c)

	res, err := ctrl.service.GetMyUnfulfilledReminders((*c).Request().Context(), session.ID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}
