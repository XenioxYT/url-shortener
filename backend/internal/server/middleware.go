package server

import (
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/xenioxyt/url-shortener/backend/internal/auth"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(401, gin.H{"error": "Invalid authorization header"})
            c.Abort()
            return
        }

        userID, err := auth.ValidateToken(parts[1])
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("user_id", userID)
        c.Next()
    }
} 