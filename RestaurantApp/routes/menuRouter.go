package routes

import (
	"github.com/gin-gonic/gin"
	controllers "github.com/RestaurantApp/controllers"
)

func MenuRoutes(incomingRoutes *gin.Engine) {
	// Public routes - accessible by all users (customers and admins)
	incomingRoutes.GET("/menus", controllers.GetMenus())
	incomingRoutes.GET("/menus/:menu_id", controllers.GetMenu())
	incomingRoutes.GET("/menu-categories", controllers.GetMenuCategories())

	// Admin-only routes - restricted to restaurant staff
	incomingRoutes.POST("/menus", controllers.CreateMenu())
	incomingRoutes.PATCH("/menus/:menu_id", controllers.UpdateMenu())
	incomingRoutes.DELETE("/menus/:menu_id", controllers.DeleteMenu())
}
