package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	FirstName    string    `gorm:"size:100;not null" json:"first_name" validate:"required,min=2,max=100"`
	LastName     string    `gorm:"size:100;not null" json:"last_name" validate:"required,min=2,max=100"`
	Password     string    `gorm:"size:100;not null" json:"password" validate:"required,min=6"`
	Email        string    `gorm:"size:100;not null;uniqueIndex" json:"email" validate:"email,required"`
	Phone        string    `gorm:"size:15;not null" json:"phone" validate:"required,min=10,max=15"`
	Token        string    `gorm:"size:500" json:"token"`
	UserType     string    `gorm:"size:20;not null;default:'USER'" json:"user_type" validate:"required,eq=ADMIN|eq=USER"`
	RefreshToken string    `gorm:"size:500" json:"refresh_token"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	UserID       string    `gorm:"size:100;uniqueIndex" json:"user_id"`
}

func (user *User) BeforeCreate(tx *gorm.DB) (err error) {
	if user.UserID == "" {
		user.UserID = uuid.New().String()
	}
	return nil
}
