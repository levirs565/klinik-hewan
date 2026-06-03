package core

import (
	"net/http"
	"strconv"
	"strings"
	"vetconnect-server/models"

	"github.com/labstack/echo/v5"
)

const (
	userSessionKey string = "user_session"
)

func NewSessionMiddleware(tokenHelper *TokenHelper) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			authorization := c.Request().Header.Get("Authorization")

			session := UserSession{
				IsLoggedIn: false,
				ID:         0,
			}
			if after, ok := strings.CutPrefix(authorization, "Bearer "); ok {
				token := after
				claims, err := tokenHelper.VerifyAccessToken(token)

				if err != nil {
					return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
				}

				id, err := strconv.ParseUint(claims.Subject, 10, 64)
				if err == nil {
					session.IsLoggedIn = true
					session.ID = uint(id)
					session.Role = claims.Role
				}

			}

			c.Set(userSessionKey, session)

			return next(c)
		}
	}
}

func GetUserSession(c *echo.Context) UserSession {
	session, err := echo.ContextGet[UserSession](c, userSessionKey)
	if err != nil {
		panic("SessionMiddleware is not registerd")
	}
	return session
}

type UserSession struct {
	IsLoggedIn bool
	ID         uint
	Role       models.AccountRole
}

type GuardRoleRule string

const (
	GuardRoleNotLoggedIn  GuardRoleRule = ""
	GuardRoleLoggedIn     GuardRoleRule = "logged-in"
	GuardRoleManager      GuardRoleRule = "manager"
	GuardRoleReceptionist GuardRoleRule = "receptionist"
	GuardRoleDoctor       GuardRoleRule = "doctor"
	GuardRoleOwner        GuardRoleRule = "owner"
	GuardRoleInternal     GuardRoleRule = "internal"
)

func GuardRole(session UserSession, rule GuardRoleRule) error {
	if rule == GuardRoleNotLoggedIn {
		if session.IsLoggedIn {
			return echo.NewHTTPError(http.StatusForbidden, "you are logged in")
		}
		return nil
	}

	if !session.IsLoggedIn {
		return echo.NewHTTPError(http.StatusForbidden, "you are not logged in")
	}

	if rule == GuardRoleLoggedIn {
		return nil
	}

	if rule == GuardRoleInternal {
		if session.Role == models.RoleManager || session.Role == models.RoleReceptionist || session.Role == models.RoleDoctor {
			return nil
		}
		return echo.NewHTTPError(http.StatusForbidden, "this resource is for internal staff only")
	}

	if session.Role == models.AccountRole(rule) {
		return nil
	}

	return echo.NewHTTPError(http.StatusForbidden, "role do not match")
}

func NewGuardRoleMiddleware(rule GuardRoleRule) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			session := GetUserSession(c)
			err := GuardRole(session, rule)
			if err != nil {
				return err
			}

			return next(c)
		}
	}
}
