package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Message struct {
	UserID    string `json:"user_id"`
	Text      string `json:"text"`
	Timestamp int64  `json:"timestamp"`
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex
	redis      *redis.Client
	ctx        context.Context
}

type Client struct {
	hub   *Hub
	conn  *websocket.Conn
	send  chan Message
	user  string
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func NewHub(redisClient *redis.Client) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		redis:      redisClient,
		ctx:        context.Background(),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			log.Printf("Client registered. Total: %d", len(h.clients))
			h.mutex.Unlock()
		case client := <-h.unregister:
			h.mutex.Lock()
			delete(h.clients, client)
			close(client.send)
			log.Printf("Client unregistered. Total: %d", len(h.clients))
			h.mutex.Unlock()
		case msg := <-h.broadcast:
			// Publish to Redis for other instances
			data, _ := json.Marshal(msg)
			h.redis.Publish(h.ctx, "chat", string(data))

			// Broadcast locally
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- msg:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		var msg Message
		if err := c.conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		msg.UserID = c.user
		c.hub.broadcast <- msg
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()
	for msg := range c.send {
		if err := c.conn.WriteJSON(msg); err != nil {
			return
		}
	}
}

func main() {
	// Init Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: "redis:6379",
	})
	defer rdb.Close()

	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Redis connection failed: %v", err)
	}
	log.Println("Connected to Redis")

	// Init Hub
	hub := NewHub(rdb)
	go hub.run()

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Chat Service Running"})
	})

	r.GET("/ws", func(c *gin.Context) {
		user := c.DefaultQuery("user", "anonymous")
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "upgrade failed"})
			return
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

	log.Println("Chat Service listening on :3002")
	r.Run(":3002")
}
