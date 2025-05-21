package models

import (
	"time"
)

type OrderItem struct {
	ID          uint      `json:"id" gorm:"primary_key"`
	OrderID     string    `json:"order_id" gorm:"required"`
	FoodID      string    `json:"food_id" gorm:"required"`
	Quantity    int       `json:"quantity" gorm:"required"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Food        Food      `json:"-" gorm:"foreignKey:FoodID;references:FoodID"`
	OrderItemID string    `json:"order_item_id" gorm:"required;uniqueIndex"`
}
