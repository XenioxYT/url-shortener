package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/xenioxyt/url-shortener/backend/internal/database"
    "github.com/xenioxyt/url-shortener/backend/internal/server"
)

func main() {
    // Initialize database
    database.InitDB()

    r := gin.Default()

    // CORS middleware
    r.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    })

    // Public routes
    r.POST("/register", server.Register)
    r.POST("/login", server.Login)

    // Protected routes
    protected := r.Group("/api")
    protected.Use(server.AuthMiddleware())
    {
        protected.POST("/links", server.CreateShortLink)
        protected.GET("/links", server.GetUserLinks)
        protected.PUT("/links/:id/toggle", server.ToggleLink)
        protected.GET("/links/:id/stats", server.GetLinkStats)
    }

    port := os.Getenv("API_PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("API service starting on port %s", port)
    r.Run(":" + port)
} 