package auth

import (
	"errors"
	"net/http"
	"time"
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
	e.POST("/owner/login", ctrl.LoginOwner)
	e.POST("/internal/login", ctrl.LoginInternal)
	e.POST("/token/refresh", ctrl.RefreshToken)
	e.POST("/logout", ctrl.Logout)
	e.GET("/me", ctrl.GetMe, core.NewGuardRoleMiddleware(core.GuardRoleLoggedIn))
	e.POST("/fcm/token", ctrl.SaveFCMToken, core.NewGuardRoleMiddleware(core.GuardRoleLoggedIn))
	e.DELETE("/fcm/token", ctrl.DeleteFCMToken, core.NewGuardRoleMiddleware(core.GuardRoleLoggedIn))
}

func (ctrl *Controller) setRefreshTokenCookie(c *echo.Context, token string, expiresAt time.Time) {
	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    token,
		Expires:  expiresAt,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Set to true in production
		SameSite: http.SameSiteLaxMode,
	}
	(*c).SetCookie(cookie)
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

func (ctrl *Controller) LoginOwner(c *echo.Context) error {
	var req LoginOwnerRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.LoginOwner((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}
		return err
	}

	ctrl.setRefreshTokenCookie(c, res.RefreshToken, res.RefreshTokenExpiresAt)

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) LoginInternal(c *echo.Context) error {
	var req LoginInternalRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.LoginInternal((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}
		return err
	}

	ctrl.setRefreshTokenCookie(c, res.RefreshToken, res.RefreshTokenExpiresAt)

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) RefreshToken(c *echo.Context) error {
	var req RefreshTokenRequest
	_ = core.BindAndValidate(c, &req)

	if req.RefreshToken == "" {
		cookie, err := c.Cookie("refresh_token")
		if err == nil {
			req.RefreshToken = cookie.Value
		}
	}

	if req.RefreshToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "refresh token is required")
	}

	res, err := ctrl.service.RefreshToken((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidRefreshToken) || errors.Is(err, ErrExpiredRefreshToken) {
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}
		return err
	}

	ctrl.setRefreshTokenCookie(c, res.RefreshToken, res.RefreshTokenExpiresAt)

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) clearRefreshTokenCookie(c *echo.Context) {
	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Set to true in production
		SameSite: http.SameSiteLaxMode,
	}
	(*c).SetCookie(cookie)
}

func (ctrl *Controller) Logout(c *echo.Context) error {
	var req LogoutRequest
	_ = core.BindAndValidate(c, &req)

	if req.RefreshToken == "" {
		cookie, err := (*c).Cookie("refresh_token")
		if err == nil {
			req.RefreshToken = cookie.Value
		}
	}

	if req.RefreshToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "refresh token is required")
	}

	err := ctrl.service.Logout((*c).Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidRefreshToken) {
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}
		return err
	}

	ctrl.clearRefreshTokenCookie(c)

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

func (ctrl *Controller) GetMe(c *echo.Context) error {
	session := core.GetUserSession(c)
	res, err := ctrl.service.GetMe((*c).Request().Context(), session)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) SaveFCMToken(c *echo.Context) error {
	var req SaveFCMTokenRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	err := ctrl.service.SaveFCMToken((*c).Request().Context(), session, req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}

func (ctrl *Controller) DeleteFCMToken(c *echo.Context) error {
	var req DeleteFCMTokenRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)
	err := ctrl.service.DeleteFCMToken((*c).Request().Context(), session, req)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, core.CreateActionResponse(true))
}
