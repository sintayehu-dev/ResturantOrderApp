package controllers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/RestaurantApp/databases"
	"github.com/RestaurantApp/helpers"
	"github.com/RestaurantApp/models"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var validate = validator.New()

func HashPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Panic(err)
	}
	return string(hashedPassword)
}

func VerifyPassword(userPassword string, providedPassword string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(userPassword), []byte(providedPassword))
	check := true
	msg := ""
	if err != nil {
		msg = "invalid credentials"
		check = false
	}
	return check, msg
}

func Signup() gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		validationErr := validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		var existingUser models.User
		if err := databases.DB.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user with this email already exists"})
			return
		}

		if err := databases.DB.Where("phone = ?", user.Phone).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user with this phone already exists"})
			return
		}

		hashedPassword := HashPassword(user.Password)
		user.Password = hashedPassword

		now := time.Now()
		user.CreatedAt = now
		user.UpdatedAt = now
		user.UserID = uuid.New().String()

		token, refreshToken, _ := helpers.GenerateAllTokens(user.Email, user.FirstName, user.LastName, user.UserType, user.UserID)
		user.Token = token
		user.RefreshToken = refreshToken

		result := databases.DB.Create(&user)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":      user.ID,
			"user_id": user.UserID,
			"email":   user.Email,
		})
	}
}

func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		var foundUser models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := databases.DB.Where("email = ?", user.Email).First(&foundUser).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}

		passwordValid, msg := VerifyPassword(foundUser.Password, user.Password)
		if !passwordValid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": msg})
			return
		}

		token, refreshToken, _ := helpers.GenerateAllTokens(
			foundUser.Email,
			foundUser.FirstName,
			foundUser.LastName,
			foundUser.UserType,
			foundUser.UserID,
		)

		helpers.UpdateAllTokens(token, refreshToken, foundUser.UserID)
		databases.DB.Where("user_id = ?", foundUser.UserID).First(&foundUser)

		c.JSON(http.StatusOK, foundUser)
	}
}

// RefreshToken exchanges a valid refresh token for new access and refresh tokens
func RefreshToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Expect JSON: { "refresh_token": "..." }
		var payload struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := c.BindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}
		if payload.RefreshToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token is required"})
			return
		}

		// Validate refresh token signature and expiry
		if _, err := helpers.ValidateToken(payload.RefreshToken); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
			return
		}

		// Find user by refresh token
		var user models.User
		if err := databases.DB.Where("refresh_token = ?", payload.RefreshToken).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token not recognized"})
			return
		}

		// Generate new tokens
		token, newRefreshToken, _ := helpers.GenerateAllTokens(
			user.Email,
			user.FirstName,
			user.LastName,
			user.UserType,
			user.UserID,
		)

		helpers.UpdateAllTokens(token, newRefreshToken, user.UserID)

		// Re-fetch updated user to include new tokens
		if err := databases.DB.Where("user_id = ?", user.UserID).First(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load updated user"})
			return
		}

		// Return user with new tokens (matches Login response shape)
		c.JSON(http.StatusOK, user)
	}
}

func GetUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil || recordPerPage < 1 {
			recordPerPage = 10
		}

		page, err := strconv.Atoi(c.Query("page"))
		if err != nil || page < 1 {
			page = 1
		}

		offset := (page - 1) * recordPerPage

		var users []models.User
		var totalCount int64

		databases.DB.Model(&models.User{}).Where("user_type = ?", "USER").Count(&totalCount)

		result := databases.DB.Where("user_type = ?", "USER").
			Offset(offset).
			Limit(recordPerPage).
			Find(&users)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occurred while fetching users"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"total_count": totalCount,
			"user_items":  users,
		})
	}
}

func GetUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("user_id")

		if err := helpers.MatchUserTypeToUid(c, userId); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		if err := databases.DB.Where("user_id = ?", userId).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
