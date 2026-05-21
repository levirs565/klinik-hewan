package core

import (
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

type Validator struct {
	validator *validator.Validate
}

var _ echo.Validator = (*Validator)(nil)

func NewValidator() *Validator {
	result := Validator{
		validator: validator.New(),
	}
	result.validator.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	return &result
}

func (v *Validator) Validate(i any) error {
	if err := v.validator.Struct(i); err != nil {
		// TODO: Better message
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}
