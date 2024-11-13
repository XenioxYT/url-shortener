package server

import (
    "crypto/rand"
    "encoding/base64"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/xenioxyt/url-shortener/internal/auth"
    "github.com/xenioxyt/url-shortener/internal/database"
    "github.com/xenioxyt/url-shortener/internal/models"
)

type LoginRequest struct {
    Email    string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type CreateLinkRequest struct {
    OriginalURL string `json:"original_url" binding:"required"`
}

func generateShortCode() string {
    b := make([]byte, 6)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)[:6]
}

func Register(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    hashedPassword, _ := auth.HashPassword(req.Password)
    user := models.User{
        Email:    req.Email,
        Password: hashedPassword,
    }

    if err := database.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
        return
    }

    token, _ := auth.GenerateToken(user.ID)
    c.JSON(http.StatusOK, gin.H{"token": token})
}

func Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var user models.User
    if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    if !auth.CheckPasswordHash(req.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    token, _ := auth.GenerateToken(user.ID)
    c.JSON(http.StatusOK, gin.H{"token": token})
}

func CreateShortLink(c *gin.Context) {
    userID := c.GetUint("user_id")
    var req CreateLinkRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    shortCode := generateShortCode()
    link := models.ShortLink{
        ShortCode:   shortCode,
        OriginalURL: req.OriginalURL,
        UserID:      userID,
        IsActive:    true,
    }

    if err := database.DB.Create(&link).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create link"})
        return
    }

    c.JSON(http.StatusOK, link)
}

func GetUserLinks(c *gin.Context) {
    userID := c.GetUint("user_id")
    var links []models.ShortLink
    
    if err := database.DB.Where("user_id = ?", userID).Find(&links).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch links"})
        return
    }

    c.JSON(http.StatusOK, links)
}

func ToggleLink(c *gin.Context) {
    userID := c.GetUint("user_id")
    linkID := c.Param("id")
    
    var link models.ShortLink
    if err := database.DB.Where("id = ? AND user_id = ?", linkID, userID).First(&link).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Link not found"})
        return
    }

    link.IsActive = !link.IsActive
    database.DB.Save(&link)

    c.JSON(http.StatusOK, link)
}

func GetLinkStats(c *gin.Context) {
    userID := c.GetUint("user_id")
    linkID := c.Param("id")

    var link models.ShortLink
    if err := database.DB.Where("id = ? AND user_id = ?", linkID, userID).First(&link).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Link not found"})
        return
    }

    // Get click events
    var clicks []models.ClickEvent
    database.DB.Where("link_id = ?", link.ID).Find(&clicks)

    // You could add more sophisticated analytics here
    stats := gin.H{
        "total_clicks": len(clicks),
        "link":         link,
        "clicks":       clicks,
    }

    c.JSON(http.StatusOK, stats)
} 