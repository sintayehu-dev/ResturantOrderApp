package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/RestaurantApp/databases"
	"github.com/RestaurantApp/helpers"
	"github.com/RestaurantApp/models"
	"github.com/gin-gonic/gin"
)

// GetInvoices retrieves all invoices (admin only)
func GetInvoices() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view all invoices"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Pagination params
		pagination := helpers.GetPaginationParams(c)
		offset := helpers.GetOffset(pagination.Page, pagination.Limit)

		var invoices []models.Invoice
		var total int64

		if err := databases.DB.WithContext(ctx).Model(&models.Invoice{}).Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to count invoices"})
			return
		}

		if err := databases.DB.WithContext(ctx).
			Offset(offset).
			Limit(pagination.Limit).
			Find(&invoices).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve invoices. Please try again later."})
			return
		}

		paginationInfo := helpers.CreatePaginationResponse(pagination.Page, pagination.Limit, total)

		c.JSON(http.StatusOK, gin.H{
			"data":       invoices,
			"pagination": paginationInfo,
		})
	}
}

// GetInvoice retrieves a specific invoice (customers can only view their own)
func GetInvoice() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		invoiceId := c.Param("invoice_id")
		var invoice models.Invoice

		if err := databases.DB.WithContext(ctx).Where("invoice_id = ?", invoiceId).First(&invoice).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested invoice could not be found"})
			return
		}

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", invoice.OrderID).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The related order information could not be found"})
			return
		}

		if err := helpers.MatchUserTypeToUid(c, order.UserID); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view this invoice"})
			return
		}

		c.JSON(http.StatusOK, invoice)
	}
}

// GetUserInvoices retrieves all invoices for the current logged-in user
func GetUserInvoices() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var orders []models.Order
		if err := databases.DB.WithContext(ctx).Where("user_id = ?", userId).Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve your orders. Please try again later."})
			return
		}

		if len(orders) == 0 {
			c.JSON(http.StatusOK, []models.Invoice{})
			return
		}

		var orderIds []string
		for _, order := range orders {
			orderIds = append(orderIds, order.OrderID)
		}

		var invoices []models.Invoice
		if err := databases.DB.WithContext(ctx).Where("order_id IN ?", orderIds).Find(&invoices).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve your invoices. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, invoices)
	}
}

// CreateInvoice generates a new invoice for an order (admin only)
func CreateInvoice() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to create invoices"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var invoice models.Invoice
		if err := c.ShouldBindJSON(&invoice); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice data provided. Please check your input."})
			return
		}

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", invoice.OrderID).First(&order).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The order referenced in this invoice could not be found"})
			return
		}

		if invoice.PaymentStatus == "" {
			invoice.PaymentStatus = "pending"
		}

		if invoice.TotalAmount == 0 {
			invoice.TotalAmount = order.OrderTotal
		}

		if invoice.PaymentDueDate.IsZero() {
			invoice.PaymentDueDate = time.Now().AddDate(0, 0, 7)
		}

		if err := databases.DB.WithContext(ctx).Create(&invoice).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create invoice. Please try again later."})
			return
		}

		databases.DB.WithContext(ctx).Model(&order).Update("order_status", "invoiced")

		c.JSON(http.StatusCreated, invoice)
	}
}

// UpdateInvoice modifies an existing invoice (admin only)
func UpdateInvoice() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to update invoices"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		invoiceId := c.Param("invoice_id")
		var invoice models.Invoice

		if err := databases.DB.WithContext(ctx).Where("invoice_id = ?", invoiceId).First(&invoice).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The invoice you're trying to update could not be found"})
			return
		}

		var updateData models.Invoice
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice data provided. Please check your input."})
			return
		}

		if updateData.InvoiceID != invoiceId {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The invoice ID in the request does not match the URL"})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("invoice_id = ?", invoiceId).Updates(&updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update invoice. Please try again later."})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("invoice_id = ?", invoiceId).First(&invoice).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invoice was updated but could not be retrieved"})
			return
		}

		c.JSON(http.StatusOK, invoice)
	}
}

// DeleteInvoice removes an invoice from the system (admin only)
func DeleteInvoice() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to delete invoices"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		invoiceId := c.Param("invoice_id")

		var invoice models.Invoice
		if err := databases.DB.WithContext(ctx).Where("invoice_id = ?", invoiceId).First(&invoice).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The invoice you're trying to delete could not be found"})
			return
		}

		if invoice.PaymentStatus == "paid" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Paid invoices cannot be deleted"})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("invoice_id = ?", invoiceId).Delete(&invoice).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete invoice. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Invoice has been successfully deleted"})
	}
}
