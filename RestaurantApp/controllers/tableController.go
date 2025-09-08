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

// GetTables retrieves tables with pagination (similar to foods)
func GetTables() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Pagination params
		pagination := helpers.GetPaginationParams(c)
		offset := helpers.GetOffset(pagination.Page, pagination.Limit)

		var tables []models.Table
		var total int64

		// Get total count
		if err := databases.DB.WithContext(ctx).Model(&models.Table{}).Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to count tables"})
			return
		}

		// Get paginated results
		if err := databases.DB.WithContext(ctx).
			Offset(offset).
			Limit(pagination.Limit).
			Find(&tables).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve tables. Please try again later."})
			return
		}

		// Create pagination response
		paginationInfo := helpers.CreatePaginationResponse(pagination.Page, pagination.Limit, total)

		c.JSON(http.StatusOK, gin.H{
			"data":       tables,
			"pagination": paginationInfo,
		})
	}
}

// GetTable retrieves a specific table by ID
func GetTable() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		tableId := c.Param("table_id")
		var table models.Table

		if err := databases.DB.WithContext(ctx).Where("table_id = ?", tableId).First(&table).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested table could not be found"})
			return
		}

		c.JSON(http.StatusOK, table)
	}
}

// CreateTable adds a new table to the restaurant (admin only)
func CreateTable() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to create tables"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var table models.Table
		if err := c.ShouldBindJSON(&table); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table data provided. Please check your input."})
			return
		}

		if err := databases.DB.WithContext(ctx).Create(&table).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create table. Please try again later."})
			return
		}

		c.JSON(http.StatusCreated, table)
	}
}

// UpdateTable modifies an existing table (admin only)
func UpdateTable() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to update tables"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		tableId := c.Param("table_id")
		var table models.Table

		if err := databases.DB.WithContext(ctx).Where("table_id = ?", tableId).First(&table).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The table you're trying to update could not be found"})
			return
		}

		var updateData models.Table
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table data provided. Please check your input."})
			return
		}

		if updateData.TableID != tableId {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The table ID in the request does not match the URL"})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("table_id = ?", tableId).Updates(&updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update table. Please try again later."})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("table_id = ?", tableId).First(&table).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Table was updated but could not be retrieved"})
			return
		}

		c.JSON(http.StatusOK, table)
	}
}

// DeleteTable removes a table from the restaurant (admin only)
func DeleteTable() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to delete tables"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		tableId := c.Param("table_id")

		var orderCount int64
		if err := databases.DB.WithContext(ctx).Model(&models.Order{}).Where("table_id = ?", tableId).Count(&orderCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to check if this table is used in orders. Please try again later."})
			return
		}

		if orderCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "This table cannot be deleted because it is used in orders"})
			return
		}

		result := databases.DB.WithContext(ctx).Where("table_id = ?", tableId).Delete(&models.Table{})
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete table. Please try again later."})
			return
		}

		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "The table you're trying to delete could not be found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Table has been successfully deleted"})
	}
}

// GetAvailableTables retrieves tables not currently in use in active orders
func GetAvailableTables() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var activeTableIds []string
		if err := databases.DB.WithContext(ctx).Model(&models.Order{}).
			Where("order_status NOT IN ?", []string{"completed", "cancelled"}).
			Distinct().Pluck("table_id", &activeTableIds).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to determine available tables. Please try again later."})
			return
		}

		var tables []models.Table
		query := databases.DB.WithContext(ctx)

		if len(activeTableIds) > 0 {
			query = query.Where("table_id NOT IN ?", activeTableIds)
		}

		if err := query.Find(&tables).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve available tables. Please try again later."})
			return
		}

		// Check if no tables are available
		if len(tables) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "No available tables at the moment. All tables are currently occupied."})
			return
		}

		c.JSON(http.StatusOK, tables)
	}
}
