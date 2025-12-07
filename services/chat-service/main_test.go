package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

func setupTestHub(t *testing.T) *Hub {
	rdb := redis.NewClient(&redis.Options{
		Addr: "redis:6379",
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		t.Skipf("Redis not available: %v", err)
	}
	return NewHub(rdb)
}

func TestWebSocketConnection(t *testing.T) {
	hub := setupTestHub(t)
	go hub.run()

	// Create test server
	r := gin.Default()
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	r.GET("/ws", func(c *gin.Context) {
		user := c.DefaultQuery("user", "testuser")
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			t.Fatalf("Failed to upgrade: %v", err)
		}

		client := &Client{
			hub:  hub,
			conn: conn,
			send: make(chan Message, 256),
			user: user,
		}
		hub.register <- client
		go client.readPump()
		go client.writePump()
	})

	server := httptest.NewServer(r)
	defer server.Close()

	// Convert http://... to ws://...
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws?user=testuser"

	// Connect WebSocket client
	ws, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to dial WebSocket: %v", err)
	}
	defer ws.Close()

	// Send a message
	msg := Message{
		UserID: "testuser",
		Text:   "Hello World",
	}
	if err := ws.WriteJSON(msg); err != nil {
		t.Fatalf("Failed to write message: %v", err)
	}

	// Receive the broadcasted message
	var received Message
	if err := ws.ReadJSON(&received); err != nil {
		t.Fatalf("Failed to read message: %v", err)
	}

	if received.Text != "Hello World" {
		t.Errorf("Expected 'Hello World', got '%s'", received.Text)
	}
}

func TestBroadcasting(t *testing.T) {
	hub := setupTestHub(t)
	go hub.run()

	msg := Message{
		UserID: "user1",
		Text:   "Broadcast test",
	}

	// Simulate two clients
	client1 := &Client{
		hub:  hub,
		conn: nil,
		send: make(chan Message, 256),
		user: "user1",
	}
	client2 := &Client{
		hub:  hub,
		conn: nil,
		send: make(chan Message, 256),
		user: "user2",
	}

	hub.register <- client1
	hub.register <- client2

	// Broadcast message
	hub.broadcast <- msg

	// Both clients should receive it
	received1 := <-client1.send
	received2 := <-client2.send

	if received1.Text != "Broadcast test" || received2.Text != "Broadcast test" {
		t.Errorf("Broadcast failed for one or more clients")
	}
}
