package models

import (
	"time"
)

type Food struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	Name      string    `json:"name" gorm:"required"`
	Price     float64   `json:"price" gorm:"required"`
	FoodImage *string   `json:"food_image" gorm:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	FoodID    string    `json:"food_id" gorm:"required;uniqueIndex"`
	MenuID    string    `json:"menu_id" gorm:"required"`
	Menu      Menu      `json:"-" gorm:"foreignKey:MenuID;references:MenuID"`
}
