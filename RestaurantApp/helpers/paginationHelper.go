package helpers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// PaginationParams holds pagination parameters
type PaginationParams struct {
	Page  int
	Limit int
}

// GetPaginationParams extracts pagination parameters from gin context
func GetPaginationParams(c *gin.Context) PaginationParams {
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	// Convert to integers
	pageInt, err := strconv.Atoi(page)
	if err != nil || pageInt < 1 {
		pageInt = 1
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil || limitInt < 1 {
		limitInt = 10
	}
	if limitInt > 100 {
		limitInt = 100 // Max limit to prevent abuse
	}

	return PaginationParams{
		Page:  pageInt,
		Limit: limitInt,
	}
}

// GetOffset calculates the offset for pagination
func GetOffset(page, limit int) int {
	return (page - 1) * limit
}

// PaginationResponse represents the pagination metadata
type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
	NextPage   int   `json:"next_page"`
	PrevPage   int   `json:"prev_page"`
}

// CreatePaginationResponse creates pagination metadata
func CreatePaginationResponse(page, limit int, total int64) PaginationResponse {
	totalPages := int((total + int64(limit) - 1) / int64(limit)) // Ceiling division
	hasNext := page < totalPages
	hasPrev := page > 1

	return PaginationResponse{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    hasNext,
		HasPrev:    hasPrev,
		NextPage:   page + 1,
		PrevPage:   page - 1,
	}
}
