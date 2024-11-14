package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xenioxyt/url-shortener/backend/internal/database"
	"github.com/xenioxyt/url-shortener/backend/internal/models"
)

func handleRedirect(c *gin.Context) {
	shortCode := c.Param("code")

	var link models.ShortLink
	if err := database.DB.Where("short_code = ? AND is_active = ?", shortCode, true).First(&link).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Link not found"})
		return
	}

	// Record click event
	clickEvent := models.ClickEvent{
		LinkID:    link.ID,
		IPAddress: c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		Referer:   c.Request.Referer(),
		Timestamp: time.Now(),
	}
	database.DB.Create(&clickEvent)

	// Update click count
	database.DB.Model(&link).Update("clicks", link.Clicks+1)

	c.Redirect(http.StatusMovedPermanently, link.OriginalURL)
}

func main() {
	// Initialize database
	database.InitDB()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/:code", handleRedirect)

	port := os.Getenv("REDIRECT_PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Redirect service starting on port %s", port)
	r.Run(":" + port)
}
