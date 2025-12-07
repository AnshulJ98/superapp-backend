# Chat Service

Real-time chat service for SuperApp using Go, Gin, WebSockets, and Redis pub/sub.

## Quick start

```bash
cd services/chat-service
go mod download
go run main.go
```

Requires Redis (automatically provided via docker-compose).

## Endpoints

- `GET /` - health check
- `GET /ws?user=<username>` - WebSocket endpoint for real-time chat

## Message Format

Messages sent and received via WebSocket are JSON objects:

```json
{
  "user_id": "username",
  "text": "message content",
  "timestamp": 1702015092
}
```

## Architecture

- **Hub**: Manages connected WebSocket clients and broadcasts messages.
- **Redis Pub/Sub**: Messages are published to Redis for horizontal scaling (multiple chat-service instances).
- **Gorilla WebSocket**: Handles WebSocket upgrades and communication.

## Testing

Run the integration tests:

```bash
go test -v
```

Tests verify:
- WebSocket connection and message receiving
- Multi-client broadcasting
- Redis pub/sub integration

## Deployment

The chat service is containerized and orchestrated via docker-compose:

```bash
docker compose up -d chat-service redis
```

Connects to Redis at `redis:6379` (internal network).

