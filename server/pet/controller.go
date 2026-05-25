package pet

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
	petGroup := group.Group("/pets")
	petGroup.Use(core.NewGuardRoleMiddleware(core.GuardRoleOwner))
	petGroup.GET("", ctrl.GetMyPets)
	petGroup.GET("/:id", ctrl.GetPetDetail)
	petGroup.POST("", ctrl.CreatePet)
	petGroup.POST("/avatar/presigned-url", ctrl.GetPresignedURL)
}

func (ctrl *Controller) GetMyPets(c *echo.Context) error {
	session := core.GetUserSession(c)

	res, err := ctrl.service.GetMyPets((*c).Request().Context(), session.ID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) GetPetDetail(c *echo.Context) error {
	session := core.GetUserSession(c)

	id, err := echo.PathParam[uint](c, "id")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid pet id")
	}

	res, err := ctrl.service.GetPetDetail((*c).Request().Context(), session.ID, id)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusOK, res)
}

func (ctrl *Controller) CreatePet(c *echo.Context) error {
	session := core.GetUserSession(c)

	var req CreatePetRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	res, err := ctrl.service.CreatePet((*c).Request().Context(), session.ID, req)
	if err != nil {
		if errors.Is(err, ErrAvatarNotFound) {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		return err
	}

	return c.JSON(http.StatusCreated, res)
}

func (ctrl *Controller) GetPresignedURL(c *echo.Context) error {
	var req GetPresignedURLRequest
	if err := core.BindAndValidate(c, &req); err != nil {
		return err
	}

	session := core.GetUserSession(c)

	res, err := ctrl.service.GetPresignedURL((*c).Request().Context(), session.ID, req.ContentType, req.FileSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, res)
}
