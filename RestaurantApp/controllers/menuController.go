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

// GetMenus retrieves all restaurant menus
func GetMenus() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var menus []models.Menu
		if err := databases.DB.WithContext(ctx).Find(&menus).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve menus. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, menus)
	}
}

// GetMenu retrieves a specific menu by ID
func GetMenu() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		menuId := c.Param("menu_id")
		var menu models.Menu

		if err := databases.DB.WithContext(ctx).Where("menu_id = ?", menuId).First(&menu).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested menu could not be found"})
			return
		}

		c.JSON(http.StatusOK, menu)
	}
}

// CreateMenu adds a new menu to the restaurant (admin only)
func CreateMenu() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to create menus"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var menu models.Menu
		if err := c.ShouldBindJSON(&menu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid menu data provided. Please check your input."})
			return
		}

		if err := databases.DB.WithContext(ctx).Create(&menu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create menu. Please try again later."})
			return
		}

		c.JSON(http.StatusCreated, menu)
	}
}

// UpdateMenu modifies an existing menu (admin only)
func UpdateMenu() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to update menus"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		menuId := c.Param("menu_id")
		var menu models.Menu

		if err := databases.DB.WithContext(ctx).Where("menu_id = ?", menuId).First(&menu).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The menu you're trying to update could not be found"})
			return
		}

		var updateData models.Menu
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid menu data provided. Please check your input."})
			return
		}

		if updateData.MenuID != menuId {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The menu ID in the request does not match the URL"})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("menu_id = ?", menuId).Updates(&updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update menu. Please try again later."})
			return
		}

		if err := databases.DB.WithContext(ctx).Where("menu_id = ?", menuId).First(&menu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Menu was updated but could not be retrieved"})
			return
		}

		c.JSON(http.StatusOK, menu)
	}
}

// GetMenuCategories retrieves all unique menu categories
func GetMenuCategories() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var categories []string
		if err := databases.DB.WithContext(ctx).Model(&models.Menu{}).Distinct().Pluck("category", &categories).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve menu categories. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, categories)
	}
}

// DeleteMenu removes a menu from the restaurant (admin only)
func DeleteMenu() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to delete menus"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		menuId := c.Param("menu_id")

		var foodCount int64
		if err := databases.DB.WithContext(ctx).Model(&models.Food{}).Where("menu_id = ?", menuId).Count(&foodCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to check if this menu has food items. Please try again later."})
			return
		}

		if foodCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "This menu cannot be deleted because it contains food items"})
			return
		}

		result := databases.DB.WithContext(ctx).Where("menu_id = ?", menuId).Delete(&models.Menu{})
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete menu. Please try again later."})
			return
		}

		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "The menu you're trying to delete could not be found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Menu has been successfully deleted"})
	}
}
