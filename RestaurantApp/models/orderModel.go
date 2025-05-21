package models

import (
	"time"
)

type Order struct {
	ID          uint        `json:"id" gorm:"primary_key"`
	OrderID     string      `json:"order_id" gorm:"required;uniqueIndex"`
	OrderDate   time.Time   `json:"order_date" gorm:"required"`
	OrderStatus string      `json:"order_status" gorm:"required"`
	OrderTotal  float64     `json:"order_total" gorm:"required"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	OrderItems  []OrderItem `json:"order_items" gorm:"foreignKey:OrderID;references:OrderID"`
	UserID      string      `json:"user_id" gorm:"required"`
	User        User        `json:"-" gorm:"foreignKey:UserID;references:UserID"`
	TableID     string      `json:"table_id" gorm:"required"`
	Table       Table       `json:"-" gorm:"foreignKey:TableID;references:TableID"`
}
