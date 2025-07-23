package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/RestaurantApp/databases"
	"github.com/RestaurantApp/helpers"
	"github.com/RestaurantApp/models"
	"github.com/gin-gonic/gin"
	"os"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// GetFoods retrieves all food items, with optional menu_id filtering
func GetFoods() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		menuId := c.Query("menu_id")

		var foods []models.Food
		var err error

		if menuId != "" {
			err = databases.DB.WithContext(ctx).Where("menu_id = ?", menuId).Find(&foods).Error
		} else {
			err = databases.DB.WithContext(ctx).Find(&foods).Error
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve food items. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, foods)
	}
}

// GetFood retrieves a specific food item by ID
func GetFood() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		foodId := c.Param("food_id")
		var food models.Food

		err := databases.DB.WithContext(ctx).Where("food_id = ?", foodId).First(&food).Error
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The requested food item could not be found"})
			return
		}

		c.JSON(http.StatusOK, food)
	}
}

// GetFoodsByCategory retrieves food items filtered by menu category
func GetFoodsByCategory() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		category := c.Param("category")

		var foods []models.Food
		if err := databases.DB.WithContext(ctx).
			Joins("JOIN menus ON foods.menu_id = menus.menu_id").
			Where("menus.category = ?", category).
			Find(&foods).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to retrieve food items. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, foods)
	}
}

// SearchFoods searches for food items by name
func SearchFoods() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		query := c.Query("q")
		if query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
			return
		}

		var foods []models.Food
		if err := databases.DB.WithContext(ctx).
			Where("name LIKE ?", "%"+query+"%").
			Find(&foods).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to search food items. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, foods)
	}
}

// CreateFood adds a new food item to the menu (admin only)
func CreateFood() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to add food items to the menu"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var food models.Food
		if err := c.ShouldBindJSON(&food); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food data provided. Please check your input."})
			return
		}

		var menuExists int64
		if err := databases.DB.WithContext(ctx).Model(&models.Menu{}).Where("menu_id = ?", food.MenuID).Count(&menuExists).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to verify menu information. Please try again later."})
			return
		}

		if menuExists == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The menu referenced does not exist"})
			return
		}

		err := databases.DB.WithContext(ctx).Create(&food).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to add food item to the menu. Please try again later."})
			return
		}

		c.JSON(http.StatusCreated, food)
	}
}

// UpdateFood modifies an existing food item (admin only)
func UpdateFood() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to update food items"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		foodId := c.Param("food_id")
		var existingFood models.Food

		if err := databases.DB.WithContext(ctx).Where("food_id = ?", foodId).First(&existingFood).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "The food item you're trying to update could not be found"})
			return
		}

		var food models.Food
		if err := c.ShouldBindJSON(&food); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food data provided. Please check your input."})
			return
		}

		if food.FoodID != foodId {
			c.JSON(http.StatusBadRequest, gin.H{"error": "The food ID in the request does not match the URL"})
			return
		}

		if food.MenuID != existingFood.MenuID {
			var menuExists int64
			if err := databases.DB.WithContext(ctx).Model(&models.Menu{}).Where("menu_id = ?", food.MenuID).Count(&menuExists).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to verify menu information. Please try again later."})
				return
			}

			if menuExists == 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "The menu referenced does not exist"})
				return
			}
		}

		// Preserve the primary key ID to ensure GORM performs an UPDATE, not an INSERT
		food.ID = existingFood.ID

		err := databases.DB.WithContext(ctx).Save(&food).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update food item. Please try again later."})
			return
		}

		c.JSON(http.StatusOK, food)
	}
}

// DeleteFood removes a food item from the menu (admin only)
func DeleteFood() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helpers.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to remove food items from the menu"})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		foodId := c.Param("food_id")

		var orderItemCount int64
		if err := databases.DB.WithContext(ctx).Model(&models.OrderItem{}).Where("food_id = ?", foodId).Count(&orderItemCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to check if this food item is used in orders. Please try again later."})
			return
		}

		if orderItemCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "This food item cannot be deleted because it is used in orders"})
			return
		}

		result := databases.DB.WithContext(ctx).Where("food_id = ?", foodId).Delete(&models.Food{})

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to remove food item. Please try again later."})
			return
		}

		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "The food item you're trying to delete could not be found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Food item has been successfully removed from the menu"})
	}
}

// UploadFoodImage uploads a food image to Cloudinary and returns the image URL
func UploadFoodImage(c *gin.Context) {
	file, err := c.FormFile("food_image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary config error"})
		return
	}

	uploadResult, err := cld.Upload.Upload(c, src, uploader.UploadParams{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to Cloudinary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"image_url": uploadResult.SecureURL})
}
