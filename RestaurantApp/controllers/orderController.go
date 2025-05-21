package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/RestaurantApp/databases"
	"github.com/RestaurantApp/helpers"
	"github.com/RestaurantApp/models"
)

// GetOrders retrieves all orders in the system (admin only)
func GetOrders() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to access this resource"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var orders []models.Order
		if err := databases.DB.WithContext(ctx).Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve orders. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, orders)
	}
}

// GetOrder retrieves a specific order (customers can only access their own)
func GetOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderId := c.Param("order_id")
		var order models.Order

		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested order could not be found"})
			return
		}

		if err := helpers.MatchUserTypeToUid(c, order.UserID); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view this order"})
			return
		}

		c.JSON(http.StatusOK, order)
	}
}

// CreateOrder places a new order in the system
func CreateOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")
		userType := c.GetString("user_type")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var order models.Order
		if err := c.ShouldBindJSON(&order); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order information. Please check your input."})
			return
		}

		if userType == "USER" {
			order.UserID = userId
		}

		if order.TableID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Table ID is required"})
			return
		}

		order.OrderDate = time.Now()
		order.OrderStatus = "pending"

		if err := databases.DB.WithContext(ctx).Create(&order).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create order. Please try again later."})
			return
		}

		c.JSON(http.StatusCreated, order)
	}
}

// UpdateOrder modifies an existing order (admin only)
func UpdateOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to update an order"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderId := c.Param("order_id")
		var order models.Order

		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested order could not be found"})
			return
		}

		var updateData models.Order
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if updateData.OrderID != orderId {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The order ID in the request body does not match the URL"})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).Updates(&updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update order. Please try again later."})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).First(&order).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve updated order. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, order)
	}
}

// DeleteOrder removes an order from the system (admin only)
func DeleteOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to delete an order"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderId := c.Param("order_id")

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested order could not be found"})
			return
		}

		var invoiceCount int64
		if err := databases.DB.WithContext(ctx).Model(&models.Invoice{}).Where("order_id = ?", orderId).Count(&invoiceCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to check related invoices. Please try again later."})
			return
		}

		if invoiceCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "This order cannot be deleted because it has associated invoices"})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).Delete(&models.OrderItem{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete related order items. Please try again later."})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).Delete(&order).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete order. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order and associated items deleted successfully"})
	}
}

// GetUserOrders retrieves all orders for the current logged-in user
func GetUserOrders() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var orders []models.Order
		if err := databases.DB.WithContext(ctx).Where("user_id = ?", userId).Find(&orders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve your orders. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, orders)
	}
}

// AddItemToOrder adds a new item to an existing order
func AddItemToOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderId := c.Param("order_id")

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ? AND user_id = ?", orderId, userId).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "You don't have an order with this ID"})
			return
		}

		if order.OrderStatus != "pending" && order.OrderStatus != "draft" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot modify order once it has been processed"})
			return
		}

		var orderItem models.OrderItem
		if err := c.ShouldBindJSON(&orderItem); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item information. Please check your input."})
			return
		}

		orderItem.OrderID = orderId

		var foodExists int64
		if err := databases.DB.WithContext(ctx).Model(&models.Food{}).Where("food_id = ?", orderItem.FoodID).Count(&foodExists).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to verify food item. Please try again later."})
			return
		}

		if foodExists == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The selected food item does not exist"})
			return
		}

		if err := databases.DB.WithContext(ctx).Create(&orderItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to add item to your order. Please try again later."})
			return
		}

		c.JSON(http.StatusCreated, orderItem)
	}
}
