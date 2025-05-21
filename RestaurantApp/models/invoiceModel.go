package models

import (
	"time"
)

type Invoice struct {
	ID             uint      `json:"id" gorm:"primary_key"`
	InvoiceID      string    `json:"invoice_id" gorm:"required;uniqueIndex"`
	OrderID        string    `json:"order_id" gorm:"required"`
	PaymentStatus  string    `json:"payment_status" gorm:"required"`
	PaymentMethod  string    `json:"payment_method" gorm:"required"`
	PaymentDueDate time.Time `json:"payment_due_date" gorm:"required"`
	TotalAmount    float64   `json:"total_amount" gorm:"required"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Order          Order     `json:"-" gorm:"foreignKey:OrderID;references:OrderID"`
}
