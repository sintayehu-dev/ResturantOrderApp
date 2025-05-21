package models

import (
	"time"
)

type Table struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	TableID   string    `json:"table_id" gorm:"required;uniqueIndex"`
	TableName string    `json:"table_name" gorm:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

