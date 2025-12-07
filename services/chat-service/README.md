# Chat Service

Real-time chat service for SuperApp using Go and Gin.

Quick start

```bash
cd services/chat-service
go mod download
go run main.go
```

Endpoints

- `GET /` - health check
- `GET /ws` - WebSocket placeholder (to be implemented)

Notes

- Uses Gin web framework for routing.
- WebSocket support coming soon.
