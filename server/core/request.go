package core

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func BindAndValidate(c *echo.Context, payload any) error {
	if err := c.Bind(payload); err != nil {
		// TODO: Better message
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(payload); err != nil {
		return err
	}

	return nil
}
