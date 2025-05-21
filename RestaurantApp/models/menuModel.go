package models

import (
	"time"
)

type Menu struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	Name      string     `json:"name" gorm:"required"`
	Category  string     `json:"category" gorm:"required"`
	StartDate *time.Time `json:"start_date" gorm:"required"`
	EndDate   *time.Time `json:"end_date" gorm:"required"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	MenuID    string     `json:"menu_id" gorm:"required;uniqueIndex"`
}
