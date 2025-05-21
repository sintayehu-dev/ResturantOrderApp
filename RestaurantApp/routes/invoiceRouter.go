package routes

import (
	"github.com/gin-gonic/gin"
	controllers "github.com/RestaurantApp/controllers"
)

func InvoiceRoutes(incomingRoutes *gin.Engine) {
	// Admin-only routes - restricted to restaurant staff
	incomingRoutes.GET("/invoices", controllers.GetInvoices())                  
	incomingRoutes.POST("/invoices", controllers.CreateInvoice())               
	incomingRoutes.PATCH("/invoices/:invoice_id", controllers.UpdateInvoice())  
	incomingRoutes.DELETE("/invoices/:invoice_id", controllers.DeleteInvoice()) 

	// Mixed access routes - permission checked inside controller
	incomingRoutes.GET("/invoices/:invoice_id", controllers.GetInvoice()) 
	

	// Customer-specific routes
	incomingRoutes.GET("/user-invoices", controllers.GetUserInvoices()) 
}
