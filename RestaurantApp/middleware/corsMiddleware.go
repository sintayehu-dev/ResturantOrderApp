package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Debug logging
		log.Printf("Request Origin: %s", origin)
		log.Printf("Request Method: %s", c.Request.Method)

		// Get allowed origins based on environment
		allowedOrigins := getAllowedOrigins()
		log.Printf("Allowed Origins: %v", allowedOrigins)

		// Check if origin is allowed
		if isOriginAllowed(origin, allowedOrigins) {
			if origin != "" {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				// For requests without origin header (Postman, mobile apps)
				c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
			}
			log.Printf("Origin allowed: %s", origin)
		} else {
			log.Printf("Origin not allowed: %s", origin)
			// Still set CORS headers but with restricted origin
			if origin != "" {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, token, postman-token")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// getAllowedOrigins returns allowed origins based on environment
func getAllowedOrigins() []string {
	// Check if we're in development mode
	env := os.Getenv("ENV")
	if env == "" {
		env = "development" // Default to development
	}

	// Get custom allowed origins from environment variable
	customOrigins := os.Getenv("ALLOWED_ORIGINS")

	if customOrigins != "" {
		// Use custom origins if provided
		return strings.Split(customOrigins, ",")
	}

	// Default origins based on environment
	switch strings.ToLower(env) {
	case "production":
		return []string{
			"https://kebar.netlify.app", // Web admin panel
			// Mobile apps don't need domains - they make direct API calls
		}
	case "staging":
		return []string{
			"https://staging.kebar.netlify.app",
			// Mobile apps don't need domains - they make direct API calls
		}
	default: // development
		return []string{
			"https://kebar.netlify.app",                 // Production web admin
			"http://localhost:3000",                     // Local React development
			"http://localhost:3001",                     // Alternative local port
			"http://localhost:8080",                     // Local Go server
			"chrome-extension://*",                      // Postman Chrome extension
			"moz-extension://*",                         // Postman Firefox extension
			"https://galactic-crater-913321.postman.co", // Postman web app
			"*", // Allow all origins for development (remove in production)
		}
	}
}

// isOriginAllowed checks if the given origin is in the allowed list
func isOriginAllowed(origin string, allowedOrigins []string) bool {
	// If origin is empty, allow it (for Postman, mobile apps, etc.)
	if origin == "" {
		return true
	}

	for _, allowed := range allowedOrigins {
		allowed = strings.TrimSpace(allowed)

		// Exact match
		if allowed == "*" || allowed == origin {
			return true
		}

		// Wildcard pattern matching
		if strings.HasSuffix(allowed, "*") {
			prefix := strings.TrimSuffix(allowed, "*")
			if strings.HasPrefix(origin, prefix) {
				return true
			}
		}

		// Handle chrome-extension and moz-extension patterns
		if allowed == "chrome-extension://*" && strings.HasPrefix(origin, "chrome-extension://") {
			return true
		}
		if allowed == "moz-extension://*" && strings.HasPrefix(origin, "moz-extension://") {
			return true
		}
	}
	return false
}
