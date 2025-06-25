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

// GetOrderItems retrieves all order items in the system (admin only)
func GetOrderItems() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view all order items"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var orderItems []models.OrderItem
		if err := databases.DB.WithContext(ctx).Find(&orderItems).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve order items. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, orderItems)
	}
}

// GetOrderItem retrieves a specific order item (customers can only access their own)
func GetOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderItemId := c.Param("order_item_id")
		var orderItem models.OrderItem

		if err := databases.DB.WithContext(ctx).Where("order_item_id = ?", orderItemId).First(&orderItem).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested order item could not be found"})
			return
		}

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderItem.OrderID).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The related order information could not be found"})
			return
		}

		if err := helpers.MatchUserTypeToUid(c, order.UserID); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to view this order item"})
			return
		}

		c.JSON(http.StatusOK, orderItem)
	}
}

// CreateOrderItem adds a new item to an order with permission checking
func CreateOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")
		userType := c.GetString("user_type")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var orderItem models.OrderItem
		if err := c.ShouldBindJSON(&orderItem); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order item data. Please check your input."})
			return
		}

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderItem.OrderID).First(&order).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The order referenced does not exist"})
			return
		}

		if userType == "USER" {
			if order.UserID != userId {
				c.JSON(http.StatusForbidden, gin.H{"error": "You can only add items to your own orders"})
				return
			}

			if order.OrderStatus != "pending" && order.OrderStatus != "draft" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "This order cannot be modified in its current state"})
				return
			}
		}

		var foodExists int64
		if err := databases.DB.WithContext(ctx).Model(&models.Food{}).Where("food_id = ?", orderItem.FoodID).Count(&foodExists).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to verify food item information. Please try again later."})
			return
		}

		if foodExists == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The food item referenced does not exist"})
			return
		}

		// Check if an order item with the same order_id and food_id already exists
		var existingOrderItem models.OrderItem
		result := databases.DB.WithContext(ctx).Where("order_id = ? AND food_id = ?", orderItem.OrderID, orderItem.FoodID).First(&existingOrderItem)

		if result.Error == nil {
			// If item exists, update the quantity instead of creating a new one
			existingOrderItem.Quantity += orderItem.Quantity
			if err := databases.DB.WithContext(ctx).Save(&existingOrderItem).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update the existing order item. Please try again later."})
				return
			}
			orderItem = existingOrderItem
		} else {
			// If item doesn't exist, create a new one
		if err := databases.DB.WithContext(ctx).Create(&orderItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to add item to the order. Please try again later."})
			return
			}
		}

		var totalAmount float64
		if err := databases.DB.WithContext(ctx).Model(&models.OrderItem{}).
			Select("COALESCE(SUM(quantity * (SELECT price FROM foods WHERE food_id = order_items.food_id)), 0)").
			Where("order_id = ?", orderItem.OrderID).
			Scan(&totalAmount).Error; err != nil {
		} else {
			databases.DB.WithContext(ctx).Model(&models.Order{}).
				Where("order_id = ?", orderItem.OrderID).
				Update("order_total", totalAmount)
		}

		c.JSON(http.StatusCreated, orderItem)
	}
}

// UpdateOrderItem modifies an existing order item with permission checking
func UpdateOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")
		userType := c.GetString("user_type")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderItemId := c.Param("order_item_id")
		var orderItem models.OrderItem

		if err := databases.DB.WithContext(ctx).Where("order_item_id = ?", orderItemId).First(&orderItem).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The order item you're trying to update could not be found"})
			return
		}

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderItem.OrderID).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The related order information could not be found"})
			return
		}

		if userType == "USER" {
			if order.UserID != userId {
				c.JSON(http.StatusForbidden, gin.H{"error": "You can only update items in your own orders"})
				return
			}

			if order.OrderStatus != "pending" && order.OrderStatus != "draft" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "This order cannot be modified in its current state"})
				return
			}
		}

		var updateData models.OrderItem
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order item data. Please check your input."})
			return
		}

		if updateData.OrderItemID != orderItemId {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The order item ID in the request does not match the URL"})
			return
		}

		if userType == "USER" {
			updates := map[string]interface{}{
				"quantity": updateData.Quantity,
			}

			if err := databases.DB.WithContext(ctx).Model(&orderItem).Updates(updates).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update the order item. Please try again later."})
				return
			}
		} else {
			if err := databases.DB.WithContext(ctx).Where("order_item_id = ?", orderItemId).Updates(&updateData).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update the order item. Please try again later."})
				return
			}
		}

		if err := databases.DB.WithContext(ctx).Where("order_item_id = ?", orderItemId).First(&orderItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Order item was updated but could not be retrieved"})
			return
		}

		var totalAmount float64
		if err := databases.DB.WithContext(ctx).Model(&models.OrderItem{}).
			Select("COALESCE(SUM(quantity * (SELECT price FROM foods WHERE food_id = order_items.food_id)), 0)").
			Where("order_id = ?", orderItem.OrderID).
			Scan(&totalAmount).Error; err != nil {
		} else {
			databases.DB.WithContext(ctx).Model(&models.Order{}).
				Where("order_id = ?", orderItem.OrderID).
				Update("order_total", totalAmount)
		}

		c.JSON(http.StatusOK, orderItem)
	}
}

// DeleteOrderItem removes an item from an order with permission checking
func DeleteOrderItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetString("uid")
		userType := c.GetString("user_type")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		orderItemId := c.Param("order_item_id")

		var orderItem models.OrderItem
		if err := databases.DB.WithContext(ctx).Where("order_item_id = ?", orderItemId).First(&orderItem).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The order item you're trying to remove could not be found"})
			return
		}

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderItem.OrderID).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The related order information could not be found"})
			return
		}

		if userType == "USER" {
			if order.UserID != userId {
				c.JSON(http.StatusForbidden, gin.H{"error": "You can only remove items from your own orders"})
				return
			}

			if order.OrderStatus != "pending" && order.OrderStatus != "draft" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "This order cannot be modified in its current state"})
				return
			}
		}

		orderId := orderItem.OrderID

		if err := databases.DB.WithContext(ctx).Where("order_item_id = ?", orderItemId).Delete(&orderItem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to remove the item from the order. Please try again later."})
			return
		}

		var totalAmount float64
		if err := databases.DB.WithContext(ctx).Model(&models.OrderItem{}).
			Select("COALESCE(SUM(quantity * (SELECT price FROM foods WHERE food_id = order_items.food_id)), 0)").
			Where("order_id = ?", orderId).
			Scan(&totalAmount).Error; err != nil {
		} else {
			databases.DB.WithContext(ctx).Model(&models.Order{}).
				Where("order_id = ?", orderId).
				Update("order_total", totalAmount)
		}

		c.JSON(http.StatusOK, gin.H{"message": "Item has been successfully removed from the order"})
	}
}

// GetOrderItemsByOrder retrieves all items for a specific order with permission checking
func GetOrderItemsByOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		orderId := c.Param("order_id")
		userId := c.GetString("uid")
		userType := c.GetString("user_type")

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var order models.Order
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested order could not be found"})
			return
		}

		if userType == "USER" && order.UserID != userId {
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only view items in your own orders"})
			return
		}

		var orderItems []models.OrderItem
		if err := databases.DB.WithContext(ctx).Where("order_id = ?", orderId).Find(&orderItems).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve order items. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, orderItems)
	}
}
