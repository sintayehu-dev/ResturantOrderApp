package main

import (
	"log"
	"os"

	"github.com/RestaurantApp/databases"
	"github.com/RestaurantApp/middleware"
	"github.com/RestaurantApp/models"
	routes "github.com/RestaurantApp/routes"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func InitializeDatabase(db *gorm.DB) error {
	// Skip foreign key constraint checks during migration
	// Migrate all models one by one
	if err := db.AutoMigrate(&models.User{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Table{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Menu{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Food{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Note{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Order{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.OrderItem{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Invoice{}); err != nil {
		return err
	}

	return nil
}

func main() {
	db := databases.InitDB()
	if err := InitializeDatabase(db); err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(middleware.CORSMiddleware())
	routes.AuthRoutes(router)
	router.Use(middleware.Authenticate())

	routes.UserRoutes(router)
	routes.FoodRoutes(router)
	routes.MenuRoutes(router)
	routes.TableRoutes(router)
	routes.OrderRoutes(router)
	routes.OrderItemRoutes(router)
	routes.InvoiceRoutes(router)

	router.GET("/api-1", func(c *gin.Context) {
		c.JSON(200, gin.H{"success": "Access granted for api-1"})
	})

	router.GET("/api-2", func(c *gin.Context) {
		c.JSON(200, gin.H{"success": "Access granted for api-2"})
	})

	router.Run(":" + port)
}
