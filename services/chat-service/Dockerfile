FROM golang:1.20-alpine AS builder
WORKDIR /src
COPY . .
RUN apk add --no-cache git build-base && \
    go mod init chat-service 2>/dev/null || true && \
    go mod tidy && \
    go build -o /bin/chat-service ./...

FROM alpine:3.18
COPY --from=builder /bin/chat-service /usr/local/bin/chat-service
EXPOSE 3002
CMD ["/usr/local/bin/chat-service"]
