package routes

import (
	"github.com/gin-gonic/gin"
	controllers "github.com/RestaurantApp/controllers"
)

func FoodRoutes(incomingRoutes *gin.Engine) {
	// Public routes - accessible by all users (customers and admins)
	incomingRoutes.GET("/foods", controllers.GetFoods())                              
	incomingRoutes.GET("/foods/:food_id", controllers.GetFood())                      
	incomingRoutes.GET("/foods/category/:category", controllers.GetFoodsByCategory()) 
	incomingRoutes.GET("/foods/search", controllers.SearchFoods())                   

	// Admin-only routes - restricted to restaurant staff
	incomingRoutes.POST("/foods", controllers.CreateFood())            
	incomingRoutes.PATCH("/foods/:food_id", controllers.UpdateFood()) 
	incomingRoutes.DELETE("/foods/:food_id", controllers.DeleteFood())
}
