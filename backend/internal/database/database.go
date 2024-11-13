package database

import (
	"fmt"
	"log"
	"os"

	"github.com/xenioxyt/url-shortener/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schemas
	err = db.AutoMigrate(&models.User{}, &models.ShortLink{}, &models.ClickEvent{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
} 