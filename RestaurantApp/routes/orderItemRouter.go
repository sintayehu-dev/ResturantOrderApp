package routes

import (
	controllers "github.com/RestaurantApp/controllers"
	"github.com/gin-gonic/gin"
)

func OrderItemRoutes(incomingRoutes *gin.Engine) {
	// Admin-only routes - restricted to restaurant staff
	incomingRoutes.GET("/orderItems", controllers.GetOrderItems())

	// Mixed access routes - permission checked inside controller
	incomingRoutes.GET("/orderItems/:order_item_id", controllers.GetOrderItem())
	incomingRoutes.POST("/orderItems", controllers.CreateOrderItem())
	incomingRoutes.PATCH("/orderItems/:order_item_id", controllers.UpdateOrderItem())
	incomingRoutes.DELETE("/orderItems/:order_item_id", controllers.DeleteOrderItem())

	// Customer-friendly routes
	incomingRoutes.GET("/orders/:order_id/items", controllers.GetOrderItemsByOrder())
}
