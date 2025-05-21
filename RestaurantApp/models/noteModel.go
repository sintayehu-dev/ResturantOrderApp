package models

import (
	"time"
)

type Note struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	Title     string    `json:"title" gorm:"required"`
	Content   string    `json:"content" gorm:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	NoteID    string    `json:"note_id" gorm:"required;uniqueIndex"`
	UserID    string    `json:"user_id" gorm:"required"`
	User      User      `json:"-" gorm:"foreignKey:UserID;references:UserID"`
}
