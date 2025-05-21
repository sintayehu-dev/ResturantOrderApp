package helpers

import (
	"errors"

	"github.com/gin-gonic/gin"
)

func CheckUserType(c *gin.Context, role string) (err error) {
	userType := c.GetString("user_type")
	if userType != role {
		err = errors.New("unauthorized to access this resource")
		return err
	}
	return nil
}

func MatchUserTypeToUid(c *gin.Context, userId string) (err error) {
	userType := c.GetString("user_type")
	uid := c.GetString("uid")

	// Admin can access any user data
	if userType == "ADMIN" {
		return nil
	}

	// User can only access their own data
	if uid != userId {
		err = errors.New("unauthorized to access this resource")
		return err
	}

	return nil
}
