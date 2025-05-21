package helpers

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/RestaurantApp/databases"
	"github.com/RestaurantApp/models"
	"github.com/golang-jwt/jwt/v4"
)

type SignedDetails struct {
	Email      string
	First_name string
	Last_name  string
	Uid        string
	User_type  string
	jwt.StandardClaims
}

var SECRET_KEY string = os.Getenv("SECRET_KEY")

func GenerateAllTokens(email, first_name, last_name, user_type, uid string) (signedToken string, signedRefreshToken string, err error) {
	claims := &SignedDetails{
		Email:      email,
		First_name: first_name,
		Last_name:  last_name,
		Uid:        uid,
		User_type:  user_type,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(24)).Unix(),
		},
	}

	refreshClaims := &SignedDetails{
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(168)).Unix(),
		},
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(SECRET_KEY))
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(SECRET_KEY))
	if err != nil {
		log.Panic(err)
		return
	}
	return token, refreshToken, err
}

func ValidateToken(signedToken string) (claims *SignedDetails, err error) {
	token, err := jwt.ParseWithClaims(signedToken, &SignedDetails{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(SECRET_KEY), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*SignedDetails)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}
	if claims.ExpiresAt < time.Now().Local().Unix() {
		return nil, fmt.Errorf("token is expired")
	}
	return claims, nil
}

func UpdateAllTokens(signedToken string, signedRefreshToken string, userId string) {
	var user models.User
	if err := databases.DB.Where("user_id = ?", userId).First(&user).Error; err != nil {
		log.Printf("Error finding user: %v", err)
		return
	}

	user.Token = signedToken
	user.RefreshToken = signedRefreshToken
	user.UpdatedAt = time.Now()

	if err := databases.DB.Save(&user).Error; err != nil {
		log.Printf("Error updating tokens: %v", err)
		return
	}
}
