package routes

import (
	"github.com/gin-gonic/gin"
	controllers "github.com/RestaurantApp/controllers"
)

func OrderRoutes(incomingRoutes *gin.Engine) {
	// Admin-only routes - restricted to restaurant staff
	incomingRoutes.GET("/orders", controllers.GetOrders())
	incomingRoutes.PATCH("/orders/:order_id", controllers.UpdateOrder())
	incomingRoutes.DELETE("/orders/:order_id", controllers.DeleteOrder())

	// Mixed access routes - permission checked inside controller
	incomingRoutes.GET("/orders/:order_id", controllers.GetOrder())
	incomingRoutes.POST("/orders", controllers.CreateOrder())

	// Customer-specific routes
	incomingRoutes.GET("/user/orders", controllers.GetUserOrders())
	incomingRoutes.POST("/orders/:order_id/items", controllers.AddItemToOrder())
}
