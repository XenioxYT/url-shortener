package models

import (
	"time"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"unique"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type ShortLink struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ShortCode   string    `json:"short_code" gorm:"unique"`
	OriginalURL string    `json:"original_url"`
	UserID      uint      `json:"user_id"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	Clicks      int64     `json:"clicks" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
}

type ClickEvent struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	LinkID    uint      `json:"link_id"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	Referer   string    `json:"referer"`
	CreatedAt time.Time `json:"created_at"`
}
