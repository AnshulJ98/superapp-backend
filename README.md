# SuperApp Backend - Complete Project

A production-grade distributed backend for a multi-client SuperApp with microservices, real-time chat, and a unified API Gateway.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Node.js)                      │
│                   Port 8080, routes requests                    │
└──────────────┬──────────────┬──────────────┬────────────────────┘
               │              │              │
        ┌──────▼─────┐ ┌──────▼─────┐ ┌─────▼──────────┐
        │   User     │ │   Chat     │ │   Analytics    │
        │  Service   │ │  Service   │ │    Service     │
        │ (Node.js)  │ │   (Go/Gin) │ │   (Python)     │
        │ Port 3001  │ │ Port 3002  │ │   Port 3003    │
        └──────┬─────┘ └──────┬─────┘ └────────┬───────┘
               │              │                 │
        ┌──────▼──────────────▼─────┐    ┌─────▼──────┐
        │   PostgreSQL (Prisma)     │    │   Redis    │
        │   Port 5432               │    │ Port 6379  │
        └───────────────────────────┘    └────────────┘
```

## Components

### 1. **User Service** (Node.js/Express)

- CRUD API for user management
- Database-backed persistence using Prisma ORM
- RESTful endpoints: `/users`, `/users/:id`
- Tests: Jest + supertest integration tests

**Key files:**

- `services/user-service/index.js` — Express server
- `services/user-service/lib/store.js` — Prisma data access layer
- `services/user-service/tests/user.test.js` — Integration tests
- `services/user-service/prisma/schema.prisma` — Prisma schema

### 2. **Chat Service** (Go/Gin)

- Real-time messaging via WebSocket (`GET /ws?user=<username>`)
- Redis pub/sub for horizontal scaling
- Hub-based message broadcasting
- WebSocket integration tests

**Key files:**

- `services/chat-service/main.go` — WebSocket server with Hub pattern
- `services/chat-service/main_test.go` — WebSocket integration tests
- `services/chat-service/go.mod` — Go dependencies (Gin, Gorilla WebSocket, Redis client)

### 3. **Analytics Service** (Python/FastAPI)

- Placeholder for analytics endpoints
- FastAPI + Uvicorn

**Key files:**

- `services/analytics-service/main.py` — FastAPI app

### 4. **API Gateway** (Node.js)

- Single entrypoint for all clients (port 8080)
- Routes requests to backend services
- Health aggregation endpoint (`GET /`)
- Minimal dependency-free implementation using Node's built-in fetch

**Key files:**

- `services/gateway/index.js` — HTTP proxy + health aggregator

### 5. **Data Storage**

- **PostgreSQL** (Port 5432): User data persistence
- **Redis** (Port 6379): Chat pub/sub and caching

### 6. **Clients**

- **React Native** (`clients/react-native/App.js`): Expo-ready mobile app
- **Node.js API Client** (`clients/api/index.js`): Shared client library + demo

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for running API demo locally)
- Go 1.20+ (for local chat service development)

### Start the Full Stack

```bash
cd /Users/anshulj/Documents/backend-project/superapp-backend

# Build and start all services
docker compose up -d --build

# Verify all services are running
docker compose ps

# Check gateway health
curl http://localhost:8080/
```

### Verify Endpoints

**User Service:**

```bash
curl http://localhost:8080/users       # List users
curl http://localhost:8080/users/{id}  # Get user
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

**Chat Service:**

```bash
# Health check
curl http://localhost:8080/chat

# WebSocket (requires wscat or similar)
wscat -c ws://localhost:3002/ws?user=alice
```

**Analytics Service:**

```bash
curl http://localhost:8080/analytics
```

**Gateway Health:**

```bash
curl http://localhost:8080/ | jq .
```

## Testing

### API Client Demo

```bash
cd clients/api
npm install
npm run demo
```

Expected output:

```
Contacting gateway at http://localhost:8080
Health: [aggregated service statuses]
Requesting user list via gateway (/users): []
```

### User Service Tests

```bash
cd services/user-service
npm test
```

Expected: 6 tests passing (health, create, list, get, update, delete).

### Chat Service Tests (with Redis running)

```bash
cd services/chat-service
go test -v
```

Expected: WebSocket connection tests passing.

## Development Workflow

### Add a User (via Gateway)

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

### Connect to Chat (WebSocket)

Use a WebSocket client library (e.g., `wscat`, `socat`, or a custom client):

```bash
# Install wscat
npm install -g wscat

# Connect to chat
wscat -c ws://localhost:3002/ws?user=alice

# Send a message (JSON):
> {"text":"Hello from Alice"}

# Messages broadcast to all connected clients
```

### Run User Service Locally (with Database)

```bash
cd services/user-service
npm install
export USE_DB=1 DATABASE_URL="postgresql://superapp:superapp_dev@localhost:5432/superapp_db"
npm start
```

### Run Chat Service Locally (with Redis)

```bash
cd services/chat-service
go mod download
export REDIS_ADDR=localhost:6379
go run main.go
```

## Docker Services

All services are containerized. Manage the stack with:

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [service-name]

# Rebuild a specific service
docker compose build [service-name]
docker compose up -d [service-name]
```

**Service Ports:**

- Gateway: `http://localhost:8080`
- User Service: `http://localhost:3011` (mapped from 3001)
- Chat Service: `http://localhost:3002`
- Analytics Service: `http://localhost:3003`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Project Structure

```
superapp-backend/
├── clients/
│   ├── api/
│   │   ├── package.json
│   │   ├── index.js              (API client class)
│   │   └── demo.js               (Demo script)
│   ├── react-native/
│   │   ├── package.json
│   │   └── App.js                (Expo app)
│   └── README.md
├── services/
│   ├── user-service/
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── lib/store.js          (Prisma data access)
│   │   ├── tests/user.test.js
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── .env
│   ├── chat-service/
│   │   ├── main.go               (WebSocket + Redis)
│   │   ├── main_test.go
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── analytics-service/
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── README.md
│   └── gateway/
│       ├── index.js              (HTTP proxy)
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── docker-postgres-init.sql
└── README.md (this file)
```

## Deployment Notes

### Local Development

- All services run in Docker containers.
- Database and Redis run as services.
- No local service installation needed (Docker handles everything).

### Production Considerations

- Add proper authentication/authorization in gateway.
- Enable HTTPS/TLS.
- Implement rate limiting and request validation.
- Use managed PostgreSQL and Redis (e.g., AWS RDS, ElastiCache).
- Set up CI/CD with GitHub Actions (run tests, build images, deploy).
- Add monitoring (e.g., Prometheus, Grafana) and logging (e.g., ELK stack).
- Implement graceful shutdown and health checks.

## Git Workflow

```bash
# View commit history
git log --oneline

# Create a branch for a feature
git checkout -b feature/new-endpoint

# Make changes and commit
git add .
git commit -m "feat(service): description"

# Push to remote
git push origin feature/new-endpoint
```

## Future Enhancements

1. **Authentication & Authorization**: Add JWT-based auth in gateway + service validation.
2. **CI/CD**: GitHub Actions workflow for testing, linting, and building Docker images.
3. **Monitoring**: Add Prometheus metrics and Grafana dashboards.
4. **API Documentation**: OpenAPI/Swagger specs for all services.
5. **Mobile Clients**: Complete iOS/Android apps using React Native.
6. **Message Persistence**: Store chat messages in PostgreSQL or MongoDB.
7. **Notifications**: Push notifications for chat messages.
8. **Rate Limiting**: Implement request throttling in gateway.

## License

MIT

---

**Built with**: Node.js, Go, Python, Docker, PostgreSQL, Redis, Prisma, Gin, FastAPI, Expo

**Contact & Support**: For questions or issues, refer to individual service READMEs.
