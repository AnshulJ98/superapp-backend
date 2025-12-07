package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Chat Service Running"})
	})
	// WebSocket placeholder
	r.GET("/ws", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "WebSocket endpoint placeholder"})
	})
	r.Run(":3002")
}
