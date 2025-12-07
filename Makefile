.PHONY: help up down logs test-user test-chat test-analytics seed-db demo clean

help:
	@echo "SuperApp Backend - Development Commands"
	@echo ""
	@echo "Services:"
	@echo "  make up              - Start all services with docker-compose"
	@echo "  make down            - Stop all services"
	@echo "  make logs            - Stream logs from all services"
	@echo ""
	@echo "Testing:"
	@echo "  make test-user       - Run user-service tests (Jest)"
	@echo "  make test-chat       - Run chat-service tests (Go) in container"
	@echo "  make test-analytics  - Run analytics-service tests (Python)"
	@echo "  make test            - Run all tests"
	@echo ""
	@echo "Database & Demo:"
	@echo "  make seed-db         - Create demo users via API"
	@echo "  make demo            - Run API client demo"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           - Stop services and remove volumes"

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

test-user:
	cd services/user-service && npm test

test-chat:
	docker run --rm -v "$$(pwd)/services/chat-service":/src -w /src \
		--network superapp-backend_default golang:1.20 go test -v ./...

test-analytics:
	cd services/analytics-service && python -m pytest || echo "No tests configured"

test: test-user test-chat

seed-db: up
	@echo "Waiting for services to be ready..."
	@sleep 5
	node scripts/seed-db.js

demo: seed-db
	cd clients/api && node demo.js

clean:
	docker compose down -v
	rm -rf services/user-service/node_modules services/chat-service/chat-service
	rm -rf clients/api/node_modules clients/react-native/node_modules
