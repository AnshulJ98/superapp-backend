# SuperApp Backend: Structured Development Assignments

## Introduction

This document presents a comprehensive set of assignments for collaborative development of the SuperApp backend microservices architecture. Each assignment is structured as a distinct learning module, combining theoretical understanding with practical implementation. The assignments are designed for independent contribution while maintaining architectural consistency and code quality standards.

### Using This Document

The recommended workflow is as follows:

1. **Selection**: Choose an assignment matching your expertise and available time commitment
2. **Comprehension**: Study the requirements, acceptance criteria, and learning objectives thoroughly
3. **Implementation**: Develop the feature systematically, referencing the implementation guide
4. **Validation**: Execute the provided test cases and acceptance criteria
5. **Review**: Submit for code review, incorporating feedback from peers and maintainers

---

## Current System Status

The infrastructure layer is complete and verified:

- ✅ Docker Compose orchestration with six services (user, chat, analytics, gateway, PostgreSQL, Redis)
- ✅ Prisma ORM with database schema migrations and type safety
- ✅ API Gateway implementing request routing and health aggregation patterns
- ✅ Real-time WebSocket chat service with Redis pub/sub architecture
- ✅ CI/CD pipeline leveraging GitHub Actions for automated testing and image building
- ✅ Comprehensive testing frameworks (Jest for Node.js, Go standard library for Go services)

The system is production-ready from an infrastructure perspective. The following assignments focus on feature completeness, robustness, and adherence to professional software engineering standards.

---

## Assignment 1: User Service CRUD Operations with Request Validation ⭐ **RECOMMENDED FIRST**

**Difficulty Level:** Intermediate  
**Estimated Duration:** 2–3 hours  
**Priority:** HIGH  
**Applicable Skills:** Node.js/Express, input validation, HTTP semantics, integration testing

### Learning Objectives

Upon completion, you will be proficient in:

- Implementing robust input validation following OWASP guidelines
- Designing RESTful API responses with appropriate HTTP status codes
- Structuring error handling for consistency and debuggability
- Writing comprehensive integration tests with Jest and Supertest
- Recognizing and preventing common security vulnerabilities (injection, constraint violations)

### Problem Statement

The User Service currently provides basic CRUD operations but lacks production-grade validation, error handling, and comprehensive test coverage. This foundational assignment establishes patterns that subsequent assignments will build upon.

**Current Limitations:**

- No request validation—malformed or malicious input is accepted
- Duplicate email constraints not enforced at the application level
- Inconsistent error responses—some operations fail silently or with generic errors
- Incomplete test coverage—edge cases and concurrent scenarios not validated
- Missing standard HTTP status codes—all responses treated equivalently

### Requirements Specification

#### Requirement 1: Input Validation (40 points)

Implement validation for all user-related endpoints with the following specifications:

**POST /users — User Creation**

- Validate `name`: Must be a non-empty string, 1–100 characters, trimmed of leading/trailing whitespace
- Validate `email`: Must be a valid email format (RFC 5322 simplified), max 255 characters, trimmed
- Constraint: Reject requests where email already exists in the database (409 Conflict status)
- Response: Return 201 Created with the complete user object including generated UUID and timestamps
- Error Response: Return 400 Bad Request with detailed validation errors

**PUT /users/:id — User Update**

- Validate `name` and `email` with identical constraints as POST
- Constraint: Prevent updates to non-existent users (404 Not Found)
- Constraint: Prevent email updates that would conflict with existing users (409 Conflict)
- Response: Return 200 OK with the updated user object
- Error Response: Return 400 Bad Request with validation details, or 404 if user doesn't exist

**DELETE /users/:id — User Deletion**

- Constraint: Reject deletion of non-existent users (404 Not Found)
- Response: Return 204 No Content (empty response body)

**GET /users/:id — User Retrieval**

- Constraint: Return 404 Not Found if the user doesn't exist
- Response: Return 200 OK with the user object

#### Requirement 2: HTTP Status Code Semantics (20 points)

Implement correct status codes adhering to RFC 7231 semantics:

- `200 OK` — Successful GET or PUT operation
- `201 Created` — Successful POST operation, response body contains created resource
- `204 No Content` — Successful DELETE operation, no response body
- `400 Bad Request` — Request validation failure (malformed data, constraint violation details provided)
- `404 Not Found` — Requested resource doesn't exist
- `409 Conflict` — Request conflicts with system state (duplicate email, constraint violation)
- `500 Internal Server Error` — Unexpected server error; include error ID for logging and diagnostics

#### Requirement 3: Standardized Error Response Format (20 points)

All error responses must follow this structure for consistency and client-side handling:

```json
{
  "error": "Descriptive error type",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format: does not match RFC 5322 specification"
    },
    {
      "field": "name",
      "message": "Field required: name cannot be empty"
    }
  ],
  "timestamp": "2025-12-07T18:10:00.000Z",
  "errorId": "ERR-001-20251207-181000"
}
```

#### Requirement 4: Comprehensive Integration Testing (20 points)

Write Jest integration tests in `services/user-service/tests/user.test.js` covering:

**Positive Test Cases:**

- Successfully create a valid user with all required fields
- Successfully retrieve a created user by ID
- Successfully update user fields with valid data
- Successfully delete a user and confirm 404 on subsequent retrieval
- Successfully list all users after creating multiple

**Negative Test Cases:**

- Reject user creation with missing `name` field
- Reject user creation with missing `email` field
- Reject user creation with empty string for `name`
- Reject user creation with invalid email format
- Reject user creation with email exceeding 255 characters
- Reject user creation with duplicate email (second creation should fail with 409)
- Reject GET request for non-existent user ID
- Reject PUT request for non-existent user ID
- Reject DELETE request for non-existent user ID
- Reject PUT request that would create a duplicate email

**Edge Cases:**

- Whitespace-only name (" ")
- Email with special characters (user+tag@example.com)
- Name with Unicode characters (José, 北京)
- Very long but valid email (255 characters exactly)
- Concurrent requests creating two users with the same email (race condition)

**Test Metrics:**

- Minimum 15 distinct test cases
- Code coverage ≥80% for user creation/retrieval/update/deletion logic
- All tests pass: `npm test` in services/user-service directory
- No flaky tests (consistent results across multiple runs)

### Acceptance Criteria

- [ ] All five CRUD endpoints (POST, GET, PUT, DELETE, GET list) implemented with full validation
- [ ] Every validation failure returns correct HTTP status code (400, 404, 409 as appropriate)
- [ ] Error responses strictly follow standardized format with `error`, `statusCode`, `details`, `timestamp` fields
- [ ] Jest test suite passes: `cd services/user-service && npm test` shows ≥15 passing tests
- [ ] Code coverage report shows ≥80% for services/user-service/index.js
- [ ] Data layer (lib/store.js) correctly detects and prevents duplicate email insertion
- [ ] Integration test passes: `make seed-db` successfully creates three users, `make demo` displays them
- [ ] No external validation libraries required (or use only lightweight, zero-dependency alternatives)
- [ ] Request/response logging present for debugging (console output or structured logs)

### Implementation Guidance

**Files to Modify:**

- `services/user-service/index.js` — Express route handlers and middleware
- `services/user-service/lib/store.js` — Data access layer implementing validation and constraint checking
- `services/user-service/tests/user.test.js` — Test suite (create if doesn't exist)

**Suggested Helper Functions:**

```javascript
// Email validation—RFC 5322 simplified
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email) && email.length <= 255;
}

// Name validation
function isValidName(name) {
  const trimmed = String(name).trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

// Standardized error response builder
function createErrorResponse(
  statusCode,
  errorMessage,
  details = [],
  errorId = null
) {
  return {
    error: errorMessage,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
    ...(errorId && { errorId }),
  };
}

// Standardized success response builder
function createSuccessResponse(data, statusCode = 200) {
  return { statusCode, data };
}
```

### Code Quality Standards

- [ ] No hardcoded magic numbers or strings—use named constants
- [ ] Consistent error handling pattern throughout (no mixed approaches)
- [ ] Clear separation of concerns: validation middleware → business logic → data access
- [ ] Tests are independent and don't share state between test cases
- [ ] Meaningful test descriptions using `describe()` and `it()` blocks
- [ ] No `console.log()` statements—use structured logging if debugging needed
- [ ] Requests and responses logged at INFO level, errors at ERROR level

### Bonus: Enhanced Security (10 points)

Implement input sanitization to demonstrate security awareness:

- Trim leading/trailing whitespace from all string inputs
- Escape special characters to prevent injection attacks
- Validate maximum and minimum length constraints
- Consider implementing rate limiting on POST endpoints (prevent brute force)

### Knowledge Check Questions

After completing this assignment, you should be able to answer:

1. Why is input validation critical in web applications? What categories of attacks does it mitigate?
2. Explain the semantic difference between 400 Bad Request and 409 Conflict. When is each appropriate?
3. How does your implementation prevent duplicate email insertion? At what layer (application vs. database)?
4. What is the advantage of a standardized error response format for client applications?
5. How would you extend this validation layer to support additional constraints (e.g., phone number format)?

---

## Assignment 2: Real-Time Chat Message Persistence and History Retrieval

**Difficulty Level:** Advanced  
**Estimated Duration:** 3–4 hours  
**Priority:** HIGH  
**Applicable Skills:** Go concurrency, Redis data structures, WebSocket protocol, distributed systems

### Learning Objectives

Upon completion, you will understand:

- Advanced Redis data structures (sorted sets for temporal ordering)
- Message persistence patterns in distributed systems
- WebSocket connection lifecycle and state management
- Pagination design for efficient data retrieval
- Trade-offs between in-memory and persistent storage

### Problem Statement

The Chat Service currently broadcasts messages in real-time via WebSocket, but messages are not persisted. Users connecting after a message is sent cannot retrieve conversation history. This assignment extends the service to store messages in Redis and provide paginated history retrieval.

**Current State:**

- WebSocket connections function correctly
- Messages broadcast successfully to connected clients
- No message persistence—conversation history lost when service restarts or connections close
- No mechanism to retrieve historical messages

### Requirements Specification

#### Requirement 1: Message Persistence in Redis (35 points)

Implement message storage using Redis sorted sets ordered by timestamp:

**Data Model:**

```
Redis Sorted Set: messages:<roomId>
├── Member: <messageJSON>
├── Score: <unixTimestampMs>
└── Example:
    messages:general
    ├── {"from":"alice","text":"Hello"} (score: 1733599000000)
    ├── {"from":"bob","text":"Hi there"} (score: 1733599001234)
    └── {...}
```

**Implementation Requirements:**

- Every message sent via WebSocket must be persisted to Redis sorted set `messages:<roomId>`
- Message format: `{"from":"<username>","text":"<message>","timestamp":"<ISO8601>"}`
- Timestamp score: Unix milliseconds (allows chronological ordering)
- Room ID: Extract from WebSocket URL parameter (e.g., `ws://localhost:3002/ws?user=alice&room=general`)
- Default room: If `room` parameter omitted, use `"general"`
- Retention: No expiration (messages persist until explicitly deleted or TTL implemented)

#### Requirement 2: Message History Retrieval Endpoint (35 points)

Implement `GET /messages/<roomId>` endpoint supporting pagination:

**Endpoint Specification:**

```
GET /messages/:roomId?limit=50&offset=0
GET /messages/:roomId?limit=20&offset=100

Query Parameters:
- limit (optional, default 50): Max messages to return (1–1000, enforce upper bound)
- offset (optional, default 0): Messages to skip (for pagination)

Response (200 OK):
{
  "roomId": "general",
  "total": 250,
  "limit": 50,
  "offset": 0,
  "messages": [
    {
      "from": "alice",
      "text": "Hello everyone",
      "timestamp": "2025-12-07T18:10:00.000Z"
    },
    ...
  ],
  "hasMore": true
}

Error Response (404 Not Found):
{
  "error": "Room not found",
  "roomId": "nonexistent"
}
```

**Implementation Requirements:**

- Retrieve messages from Redis sorted set using `ZRANGE` with offset and limit
- Sort messages in chronological order (oldest first)
- Return total message count for pagination calculation
- Include `hasMore` flag to indicate if additional messages exist
- Handle non-existent rooms gracefully (return 404 with empty message array or explicit error)
- Validate `limit` (max 1000) and `offset` (non-negative) parameters
- Return 400 Bad Request if parameters invalid

#### Requirement 3: WebSocket Message Broadcasting with Persistence (20 points)

Modify the WebSocket handler to persist messages:

**Flow:**

1. Client connects: `ws://localhost:3002/ws?user=alice&room=general`
2. Client sends message: `{"text":"Hello"}`
3. Service persists to Redis: `ZADD messages:general <timestamp> <messageJSON>`
4. Service broadcasts to all connected clients in that room
5. New clients connecting later retrieve history via GET endpoint

**Implementation Requirements:**

- Extract room ID from WebSocket URL parameters
- On message receive, persist to Redis before broadcasting
- Handle Redis persistence errors gracefully (log and broadcast anyway if Redis fails)
- Include message timestamp when persisting
- Broadcast includes all necessary fields (from, text, timestamp, roomId)

#### Requirement 4: Integration Tests (10 points)

Write Go tests in `services/chat-service/main_test.go`:

**Test Cases:**

- WebSocket client sends message; verify persistence in Redis
- Connect client → send 5 messages → disconnect → retrieve history via GET endpoint
- Verify messages returned in chronological order
- Test pagination: send 100 messages, retrieve with limit=20, verify total and offset handling
- Verify hasMore flag correctly indicates additional messages exist
- Test concurrent message sending from multiple clients; verify all persisted
- Test room isolation: messages in room A don't appear in room B
- Test default room: WebSocket without room parameter uses "general"
- Test empty room: GET /messages/nonexistent returns sensible response

### Acceptance Criteria

- [ ] Every WebSocket message successfully persisted to Redis sorted set
- [ ] GET /messages/:roomId endpoint returns paginated history in chronological order
- [ ] Pagination parameters (limit, offset) validated and enforced
- [ ] Response includes total count and hasMore flag
- [ ] Room isolation verified: messages in separate rooms don't bleed
- [ ] Go tests pass: `cd services/chat-service && go test -v ./...` shows ≥8 passing tests
- [ ] Integration test: send 5 messages via WebSocket, retrieve via GET endpoint, verify all present
- [ ] Error handling: non-existent rooms return appropriate response
- [ ] Redis connection errors handled gracefully (not crashing the service)
- [ ] Backwards compatible: existing WebSocket broadcast functionality unchanged

### Implementation Guidance

**Files to Modify:**

- `services/chat-service/main.go` — WebSocket handler and Redis persistence logic
- `services/chat-service/main_test.go` — New test cases

**Key Redis Commands:**

```go
// Persist a message to a room's sorted set
client.ZAdd(ctx, fmt.Sprintf("messages:%s", roomId), &redis.Z{
  Score:  float64(time.Now().UnixMilli()),
  Member: messageJSON,
}).Result()

// Retrieve paginated messages (oldest first)
messages, err := client.ZRange(ctx, fmt.Sprintf("messages:%s", roomId),
  int64(offset), int64(offset + limit - 1)).Result()

// Get total message count in a room
count, err := client.ZCard(ctx, fmt.Sprintf("messages:%s", roomId)).Result()
```

**URL Parameter Parsing:**

```go
// Extract room from WebSocket URL: ws://localhost:3002/ws?user=alice&room=general
u := r.URL
roomId := u.Query().Get("room")
if roomId == "" {
  roomId = "general"
}
```

### Bonus: Message Deletion and Expiration (10 points)

- Implement `DELETE /messages/:roomId` to clear all messages in a room (admin only)
- Implement message TTL: automatically expire messages older than 30 days
- Implement `DELETE /messages/:roomId/:messageId` to remove specific messages

---

- No way to retrieve historical messages
- No room-based chat organization

### Requirements

#### 1. Message Persistence (40 points)

Store all chat messages in Redis sorted sets:

- Use key format: `messages:{roomId}` → sorted set ordered by timestamp
- Each message: `{timestamp}|{userId}|{userName}|{content}`
- Timestamp is both the score (for sorting) and data (for payload)
- Automatically expire old messages (configurable, default 30 days)

**Implementation:**

```go
// When message is broadcast, also store in Redis:
zscore := time.Now().UnixMilli()
member := fmt.Sprintf("%d|%s|%s|%s", zscore, userId, userName, content)
client.ZAdd(ctx, fmt.Sprintf("messages:%s", roomId),
  &redis.Z{Score: float64(zscore), Member: member})
```

#### 2. Message Retrieval Endpoint (30 points)

Implement `GET /messages/:roomId` endpoint:

- **Query params:** `limit=50` (default, max 100), `offset=0` (for pagination)
- **Response:** Array of messages with metadata

```json
{
  "roomId": "general",
  "total": 150,
  "offset": 0,
  "limit": 50,
  "messages": [
    {
      "id": "uuid",
      "timestamp": 1733597400000,
      "userId": "user123",
      "userName": "Alice",
      "content": "Hello everyone!"
    }
  ]
}
```

- Return 404 if room doesn't exist (no messages)
- Return 400 if limit/offset invalid
- Messages ordered by timestamp (oldest first)

#### 3. WebSocket Integration (20 points)

Modify broadcast handler to persist messages:

- Message is sent to Redis sorted set before broadcasting to clients
- Handle Redis failures gracefully (log error, still broadcast)
- Include message ID (UUID) in broadcast payload
- Test: Send 5 messages, verify all appear in history

#### 4. Testing (10 points)

- ✅ Send message via WebSocket → verify stored in Redis
- ✅ Retrieve messages → verify correct order and content
- ✅ Pagination works (offset/limit)
- ✅ Invalid parameters return 400
- ✅ Non-existent room returns 404
- ✅ Message history persists across service restarts

### Acceptance Criteria

- [ ] Messages stored in Redis sorted sets with proper key format
- [ ] `GET /messages/:roomId` endpoint returns paginated history
- [ ] All messages include timestamp, userId, userName, content
- [ ] Pagination works correctly (offset, limit)
- [ ] Error handling for invalid parameters (400)
- [ ] Go integration tests pass
- [ ] Chat still broadcasts in real-time (no performance regression)
- [ ] WebSocket test sends/retrieves messages successfully

### Files to Modify

- `services/chat-service/main.go` — WebSocket handler, message persistence
- `services/chat-service/main_test.go` — Add message retrieval test

### Bonus: Room Management (15 points)

- Implement `GET /rooms` → List all active chat rooms
- Implement `POST /rooms` → Create new room
- Implement `GET /rooms/:roomId/stats` → Message count, last message time, active users
- Rooms auto-expire if inactive for 24 hours

### Easter Egg 🥚

Implement a secret admin command: If a message starts with `/stats`, return:

```json
{
  "totalMessages": 12345,
  "activeRooms": 42,
  "onlineUsers": 187,
  "avgMessageLength": 45.3
}
```

---

## Assignment 3: API Gateway Logging Middleware

**Difficulty:** Intermediate  
**Estimated Time:** 1.5-2 hours  
**Priority:** MEDIUM  
**Skills:** Node.js, observability, file I/O

### Objective

Add comprehensive request/response logging to the gateway for debugging, monitoring, and audit trails. No external dependencies—use only Node.js built-ins.

### Current State

- Gateway routes requests but has minimal logging
- No visibility into request latency
- No audit trail for debugging
- Errors are not properly tracked

### Requirements

#### 1. Request Logging Middleware (40 points)

Log every request with structured data:

**Log format (single line per request):**

```
[2025-12-07T18:10:00.123Z] 127.0.0.1 GET /users 200 (45ms) req-id:abc123def456
[2025-12-07T18:10:01.456Z] 127.0.0.1 POST /users 201 (78ms) req-id:abc123def457
[2025-12-07T18:10:02.789Z] 127.0.0.1 GET /users/invalid 404 (12ms) req-id:abc123def458
```

**Data captured:**

- Timestamp (ISO 8601)
- Client IP address
- HTTP method
- Request path
- Response status code
- Response latency (milliseconds)
- Request ID (for tracing)

#### 2. File Logging (30 points)

Write logs to `logs/gateway.log`:

- Create `logs/` directory if it doesn't exist
- Append all logs to file
- Include daily rotation (logs/gateway.2025-12-07.log)
- Keep last 7 days of logs
- Handle write errors gracefully (don't crash gateway)

#### 3. Request Tracing (20 points)

Add `X-Request-ID` header for request tracking:

- Generate unique ID on each request (UUID or timestamp-based)
- Log the ID with each request
- Pass ID to downstream services via header
- Include ID in error logs for correlation

#### 4. Error Logging (10 points)

Enhanced logging for errors:

```
[2025-12-07T18:10:03.000Z] ERROR req-id:xyz789 GET /invalid-route 500
  Error: ENOTFOUND user-service
  at fetchServiceHealth (gateway/index.js:45:12)
  at proxyRequest (gateway/index.js:120:8)
```

### Acceptance Criteria

- [ ] Every request logged with method, path, status, latency
- [ ] Logs written to `logs/gateway.log` (file must exist after first request)
- [ ] Request ID generated and logged for every request
- [ ] Request ID passed to downstream services (header)
- [ ] Error logs include stack trace
- [ ] No external packages (fs, http, uuid built-in only)
- [ ] Logs persist across service restarts
- [ ] No log rotation delays or missing entries

### Implementation Guide

**Key functions to create:**

```javascript
// Generate request ID
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format log entry
function formatLog(
  timestamp,
  ip,
  method,
  path,
  status,
  latency,
  reqId
) {
  return `[${timestamp}] ${ip} ${method} ${path} ${status} (${latency}ms) req-id:${reqId}`;
}

// Append to log file
function writeLog(message) {
  // Use fs.appendFile (non-blocking)
  // Create logs/ dir if missing
  // Handle errors without crashing
}
```

### Files to Modify

- `services/gateway/index.js` — Add logging middleware, trace middleware

### Code Review Checklist

- [ ] Logs are structured (easy to parse)
- [ ] No personally identifiable information (PII) in logs
- [ ] Request IDs are unique and traceable
- [ ] Log file grows predictably (no bloat)
- [ ] Error handling doesn't crash the service
- [ ] Performance impact is negligible (<1ms per request)

### Bonus: Metrics Collection (15 points)

Track and log hourly metrics:

- Total requests per hour
- Average response time per hour
- Error rate (% of 4xx/5xx)
- Most accessed endpoints
- Slowest endpoints

Log summary every hour:

```
[2025-12-07T19:00:00.000Z] METRICS hour=2025-12-07T18
  requests=1234
  avgLatency=45.3ms
  errorRate=2.1%
  slowestEndpoint=POST /users (avg 123ms)
```

---

## Assignment 4: User Authentication with JWT

**Difficulty:** Advanced  
**Estimated Time:** 3-4 hours  
**Priority:** MEDIUM  
**Skills:** Node.js/Express, JWT, cryptography, security

### Objective

Implement token-based authentication with JWT and role-based access control (RBAC). All user endpoints will require valid authentication.

### Current State

- User endpoints are publicly accessible
- No authentication mechanism
- No user roles or permissions
- No session management

### Requirements

#### 1. Authentication Endpoints (30 points)

**POST /auth/register** - User registration

- Required: `email`, `password`, `name`
- Hash password (use built-in crypto or bcrypt)
- Create user if email doesn't exist
- Return 201 with user info (NO password)
- Return 409 if email exists
- Return 400 if validation fails

**POST /auth/login** - User login

- Required: `email`, `password`
- Validate credentials against stored hash
- Generate JWT token on success
- Return 200 with token + user info
- Return 401 if credentials invalid
- Return 404 if user doesn't exist

**POST /auth/refresh** - Refresh token

- Required: `refreshToken`
- Validate refresh token
- Generate new access token
- Return 200 with new access token
- Return 401 if refresh token invalid/expired

**GET /auth/me** - Get current user (protected)

- Requires: `Authorization: Bearer <token>`
- Return 200 with current user info
- Return 401 if token missing/invalid

#### 2. JWT Implementation (30 points)

- **Access token:** 24-hour expiry, includes `userId`, `email`, `role`
- **Refresh token:** 7-day expiry, single-use (optional, for bonus)
- **Secret:** Use environment variable `JWT_SECRET` (generate at startup if missing)
- **Algorithm:** HS256 (HMAC SHA-256)
- **Token format:**

```json
{
  "sub": "user123",
  "email": "alice@example.com",
  "role": "user",
  "iat": 1733597400,
  "exp": 1733683800
}
```

#### 3. Middleware & Protection (25 points)

Implement authentication middleware:

- Extract token from `Authorization: Bearer <token>` header
- Validate token signature and expiry
- Attach user info to request context
- Return 401 if token missing or invalid
- Return 403 if user lacks required role

Protect all user endpoints:

- `GET /users` — requires `user` or `admin` role
- `GET /users/:id` — requires `user` or `admin` role
- `POST /users` — requires `admin` role only
- `PUT /users/:id` — requires `admin` or own user
- `DELETE /users/:id` — requires `admin` role only

#### 4. Testing (15 points)

- ✅ Register new user
- ✅ Login with valid credentials → token received
- ✅ Login with invalid credentials → 401
- ✅ Access protected route with valid token → success
- ✅ Access protected route without token → 401
- ✅ Access protected route with expired token → 401
- ✅ Access admin-only endpoint as regular user → 403
- ✅ Access own data vs. other user data

### Acceptance Criteria

- [ ] POST /auth/register creates user with hashed password
- [ ] POST /auth/login returns JWT token
- [ ] POST /auth/refresh generates new token
- [ ] GET /auth/me returns current user (protected)
- [ ] All protected endpoints require valid token
- [ ] Role-based access control enforced
- [ ] Tokens expire correctly (24h for access)
- [ ] Invalid tokens rejected with 401
- [ ] Insufficient permissions rejected with 403
- [ ] Jest tests pass with >80% coverage

### Implementation Guide

**Create middleware:**

```javascript
// middleware/auth.js
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Missing token",
      statusCode: 401,
    });
  }

  // Verify JWT
  // Attach user to req.user
  // Call next()
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Insufficient permissions",
        statusCode: 403,
      });
    }
    next();
  };
}
```

### Files to Modify

- `services/user-service/index.js` — Add auth endpoints, middleware
- `services/user-service/lib/store.js` — Store password hashes
- `services/user-service/tests/user.test.js` — Add auth tests

### Code Review Checklist

- [ ] Passwords never logged or exposed
- [ ] JWT secret stored in environment variable
- [ ] Token validation is cryptographically sound
- [ ] Passwords hashed with salt (bcrypt or PBKDF2)
- [ ] No hardcoded credentials
- [ ] CORS and CSRF protections considered

### Bonus: Advanced Security (20 points)

- Implement refresh token rotation (invalidate old token)
- Add rate limiting on `/auth/login` (max 5 attempts per IP per 15min)
- Implement password reset flow (`POST /auth/forgot-password`)
- Add audit logging (who logged in when)
- Implement two-factor authentication (2FA) stub

---

## Assignment 5: API Documentation & OpenAPI Spec

**Difficulty:** Intermediate  
**Estimated Time:** 2-3 hours  
**Priority:** LOW (but valuable for team)  
**Skills:** OpenAPI/Swagger, API design, documentation

### Objective

Create comprehensive API documentation with OpenAPI 3.0 specification and interactive Swagger UI. This enables clients and team members to understand and test the API.

### Requirements

#### 1. OpenAPI 3.0 Specification (40 points)

Create `docs/openapi.json` with:

- API info (title, version, description)
- Base URL and servers
- All endpoints with:
  - Description
  - Request parameters (path, query, body)
  - Request/response schemas
  - HTTP status codes
  - Authentication requirements
- Reusable schemas (User, Message, Error)
- Examples for requests/responses

#### 2. Swagger UI Integration (30 points)

Serve interactive documentation at `GET /docs`:

- Display OpenAPI spec visually
- Allow testing endpoints directly from UI
- Show request/response examples
- Display authentication scheme (Bearer token)

#### 3. Documentation Quality (30 points)

- Clear descriptions for all fields
- Complete error documentation (400, 401, 403, 404, 409, 500)
- Authentication flow documented
- Rate limits documented (if applicable)
- Example payloads for all operations

### Files to Create

- `docs/openapi.json` — OpenAPI specification
- `services/gateway/index.js` — Add /docs endpoint

---

## Assignment 6: Observability & Metrics

**Difficulty:** Advanced  
**Estimated Time:** 3-4 hours  
**Priority:** MEDIUM  
**Skills:** Observability, metrics, Prometheus

### Objective

Add comprehensive health checks and monitoring to all services. Enable operators to understand system health and debug issues.

### Requirements

#### 1. Health Check Endpoints (30 points)

Each service implements `GET /health`:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-07T18:10:00.000Z",
  "uptime": 3600,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

#### 2. Metrics Collection (40 points)

Add Prometheus metrics endpoint `GET /metrics`:

- Request count (by method, path, status)
- Request latency histogram
- Error rate
- Business metrics (users created, messages sent, etc.)
- Service health status
- Dependency availability

#### 3. Gateway Health Aggregation (30 points)

Update gateway's `/health` to include:

- Overall status
- Status of each backend service
- Dependencies (database, cache)
- Response times

### Files to Modify

- All services — Add health + metrics endpoints

---

## Assignment 7: Database Seeding & Test Data

**Difficulty:** Intermediate  
**Estimated Time:** 1.5-2 hours  
**Priority:** MEDIUM  
**Skills:** Database, scripting, data generation

### Objective

Create realistic test data for development and demo purposes. Enable other developers to start with meaningful data.

### Requirements

#### 1. Enhanced Seed Script (40 points)

Update `scripts/seed-db.js` to create:

- 20+ realistic users (varied names, emails, roles)
- 5+ chat rooms (general, dev, random, etc.)
- 100+ chat messages across rooms
- User activity timestamps (created at various times)
- Varied user data (some with profiles, etc.)

#### 2. Seed Datasets (30 points)

Create separate seed files:

- `seed-dev.js` — Full data for development
- `seed-test.js` — Minimal data for testing
- `seed-demo.js` — Attractive data for demonstrations
- Seed with ability to reset/rollback

#### 3. Realistic Data Generation (30 points)

- Use realistic names, emails, cities, etc.
- Create relationships (users in rooms, messages by users)
- Vary timestamps (spread over days/weeks)
- Include edge cases (very long messages, special chars)

### Files to Modify

- `scripts/seed-db.js` — Enhance existing script
- Create `scripts/seed-dev.js`, `scripts/seed-test.js`, `scripts/seed-demo.js`

---

## 🎯 Progress Tracking

As you work through assignments, update the todo list:

```bash
# Mark assignment as in-progress
git checkout -b feat/assignment-1-user-validation

# Work on implementation...

# Test your changes
npm test                    # In user-service
make test-chat             # For chat tests

# When complete, mark as done and create PR
git push origin feat/assignment-1-user-validation
```

---

## 📋 Code Quality Standards

All submissions must meet these standards:

### Code Style

- ✅ Consistent indentation (2 spaces)
- ✅ Clear variable/function names
- ✅ Comments for complex logic
- ✅ DRY principle (no code duplication)

### Testing

- ✅ Test coverage ≥ 80% for new code
- ✅ Tests are independent (no shared state)
- ✅ Edge cases tested
- ✅ Error paths tested

### Documentation

- ✅ README updates for new endpoints
- ✅ Inline comments for complex logic
- ✅ JSDoc/GoDoc for functions
- ✅ Examples in commit messages

### Performance

- ✅ No N+1 queries
- ✅ Reasonable response times (<500ms)
- ✅ Proper error handling (no hangs)
- ✅ Memory leaks checked

---

## 🎁 Bonus Assignments

### Bonus A: Database Migrations Enhancement (10 points)

- Implement data validation rules at DB level
- Add check constraints (email format, age > 0, etc.)
- Create indexes for common queries
- Document all migration changes

### Bonus B: Performance Optimization (10 points)

- Add caching layer to user queries (Redis)
- Implement request deduplication
- Optimize database queries
- Add query performance monitoring

### Bonus C: Deployment Script (10 points)

- Create automated deployment script
- Environment configuration management
- Database migration automation
- Rollback capability

### Bonus D: Monitoring Dashboard (15 points)

- Create simple HTML dashboard
- Show real-time metrics (requests/sec, error rate)
- Display service health
- Show recent logs
- Serve from gateway at `/dashboard`

---

## 🥚 Easter Egg Hunt

Hidden throughout the codebase are easter eggs. Find them and unlock special features:

### Egg 1: Secret Health Status

If you name a user "Phoenix" with email "phoenix@rising.com", the gateway health endpoint will return `"status": "🔥 RISING FROM THE ASHES"` instead of the normal status.

### Egg 2: Chat Admin Mode

Send a message starting with `/stats` in any chat room to get:

```json
{
  "totalMessages": 12345,
  "activeRooms": 42,
  "onlineUsers": 187,
  "avgMessageLength": 45.3
}
```

### Egg 3: Database Backdoor

In the seed script, users created on leap days (Feb 29) will have `"leapDayChild": true` in their profile.

### Egg 4: Log File Mystery

Check your `logs/gateway.log` file for a hidden message on the 1000th request.

### Egg 5: JWT Secret

If you set `JWT_SECRET=GithubCopilot`, the login endpoint will return a special response acknowledging the Easter egg. 🎉

---

## 📞 Getting Help

- **Need clarification?** Open an issue in the repository
- **Code review?** Submit a pull request with your changes
- **Stuck?** Use the `/debug` command in chat (see Assignment 2)
- **Want to discuss architecture?** Check the ADRs (Architecture Decision Records) in `/docs/adr/`

---

## 📈 Scoring Rubric

Each assignment has a total of 100 points:

| Category      | Points | Criteria                           |
| ------------- | ------ | ---------------------------------- |
| Functionality | 40-50  | All requirements met, no bugs      |
| Testing       | 15-20  | >80% coverage, edge cases included |
| Code Quality  | 15-20  | Clean, DRY, well-documented        |
| Performance   | 10-15  | No regressions, optimized          |
| Documentation | 5-10   | Clear README updates, comments     |

**Bonus Points:** Up to 20 additional points for bonus work

**To Pass:** ≥ 70 points  
**To Excel:** ≥ 85 points  
**Perfect Score:** 100+ points (with all bonus work)

---

## 🚀 Ready to Start?

Pick an assignment above and begin:

1. **Read the requirements** carefully
2. **Create a feature branch:** `git checkout -b feat/assignment-X-description`
3. **Implement the solution** following the guide
4. **Test thoroughly** with provided tests
5. **Submit for review** when complete

Good luck! 🎯

---

_Last updated: 2025-12-07_  
_Assignments designed for SuperApp Backend microservices platform_
