package routes

import (
	controllers "github.com/RestaurantApp/controllers"
	"github.com/gin-gonic/gin"
)

func TableRoutes(incomingRoutes *gin.Engine) {
	// Public routes - accessible by all users (customers and admins)
	incomingRoutes.GET("/tables", controllers.GetTables())
	incomingRoutes.GET("/tables/:table_id", controllers.GetTable())
	incomingRoutes.GET("/available-tables", controllers.GetAvailableTables())

	// Admin-only routes - restricted to restaurant staff
	incomingRoutes.POST("/tables", controllers.CreateTable())
	incomingRoutes.PATCH("/tables/:table_id", controllers.UpdateTable())
	incomingRoutes.DELETE("/tables/:table_id", controllers.DeleteTable())
}
