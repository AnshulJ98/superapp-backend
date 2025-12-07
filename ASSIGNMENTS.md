# SuperApp Backend: Development Assignments

This document contains structured assignments for developing and enhancing the SuperApp backend microservices platform. Each assignment is designed to be completed independently while maintaining code quality and architectural consistency.

**How to use this guide:**
1. Pick an assignment from the list below
2. Read the requirements and acceptance criteria carefully
3. Work through the implementation systematically
4. Run tests and verify all acceptance criteria are met
5. Submit for code review and feedback

---

## Current Project Status

✅ **Infrastructure Complete**
- Docker Compose stack with 6 services (user, chat, analytics, gateway, postgres, redis)
- Prisma ORM with database migrations
- API Gateway with request routing and health aggregation
- Real-time WebSocket chat service with Redis pub/sub
- CI/CD pipeline with GitHub Actions
- Comprehensive testing framework (Jest, Go tests)

---

## Assignment 1: User Service CRUD with Validation ⭐ **START HERE**

**Difficulty:** Intermediate  
**Estimated Time:** 2-3 hours  
**Priority:** HIGH  
**Skills:** Node.js/Express, validation, error handling, testing

### Objective
Make the user API production-ready by implementing proper request validation, comprehensive error handling, and correct HTTP status codes. This is the foundation for subsequent security and persistence work.

### Current State
- Basic CRUD endpoints exist but lack validation
- No duplicate email detection
- Missing error handling for edge cases
- Incomplete test coverage

### Requirements

#### 1. Request Validation (40 points)
Implement input validation for all user-related endpoints:

**POST /users** - Create user
- ✅ Validate `name`: non-empty string, max 100 chars
- ✅ Validate `email`: valid email format (regex or library), max 255 chars
- ✅ Reject duplicate emails (409 Conflict)
- ✅ Return 201 Created with created user object
- ✅ Return 400 Bad Request with validation error details

**PUT /users/:id** - Update user
- ✅ Validate same fields as POST
- ✅ Check if user exists (404 if not)
- ✅ Prevent email updates that conflict with existing users
- ✅ Return 200 OK with updated user

**DELETE /users/:id** - Delete user
- ✅ Check if user exists (404 if not)
- ✅ Return 204 No Content on success

**GET /users/:id** - Get single user
- ✅ Return 404 if user doesn't exist
- ✅ Return 200 OK with user data

#### 2. HTTP Status Codes (20 points)
Implement correct status codes across all endpoints:
- `200 OK` — GET successful, PUT successful
- `201 Created` — POST successful
- `204 No Content` — DELETE successful
- `400 Bad Request` — Validation failure (missing/invalid fields)
- `404 Not Found` — Resource not found
- `409 Conflict` — Duplicate email or constraint violation
- `500 Internal Server Error` — Unexpected errors (with error ID for logging)

#### 3. Error Response Format (20 points)
Standardize error responses:
```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "timestamp": "2025-12-07T18:10:00.000Z"
}
```

#### 4. Comprehensive Testing (20 points)
Add Jest tests covering:
- ✅ Valid user creation with different data
- ✅ Duplicate email rejection
- ✅ Invalid input handling (empty name, malformed email, missing fields)
- ✅ GET non-existent user (404)
- ✅ UPDATE non-existent user (404)
- ✅ DELETE non-existent user (404)
- ✅ All HTTP status codes verified
- ✅ Edge cases (very long names, special characters in email)
- ✅ Concurrent requests (race conditions)

**Test file:** `services/user-service/tests/user.test.js`

### Acceptance Criteria
- [ ] All 5 CRUD endpoints implemented with validation
- [ ] All error cases return correct HTTP status codes
- [ ] Error responses follow standard format
- [ ] Jest tests pass: `npm test` in user-service directory
- [ ] Test coverage ≥ 80% for CRUD operations
- [ ] No external validation libraries required (or use lightweight alternatives)
- [ ] Integration test passes: `make seed-db && make demo`

### Implementation Guide

**Files to modify:**
- `services/user-service/index.js` — Main service logic
- `services/user-service/lib/store.js` — Data access layer (handle duplicate email detection)
- `services/user-service/tests/user.test.js` — Test suite

**Helper function to create:**
```javascript
// Validate email format
function isValidEmail(email) {
  // Implement RFC 5322 basic validation
}

// Validate name
function isValidName(name) {
  // Non-empty, 1-100 chars, no leading/trailing spaces
}

// Standardized error response
function errorResponse(statusCode, message, details = []) {
  return {
    error: message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}
```

### Code Review Checklist
- [ ] No hardcoded values (use constants)
- [ ] Consistent error handling (no mixed patterns)
- [ ] Proper separation of concerns (validation ≠ business logic ≠ data access)
- [ ] Tests are independent and don't share state
- [ ] Request/response logging for debugging
- [ ] No console.log() — use structured logging

### Bonus: Input Sanitization (10 points)
- Trim whitespace from name and email
- Escape special characters to prevent injection attacks
- Validate and sanitize any other input fields

---

## Assignment 2: Chat Message Persistence & History

**Difficulty:** Advanced  
**Estimated Time:** 3-4 hours  
**Priority:** HIGH  
**Skills:** Go, Redis, WebSocket, distributed systems

### Objective
Extend the real-time chat service to store message history in Redis and provide a paginated message retrieval endpoint. Users can now see conversation history when they join.

### Current State
- WebSocket connections work (client can send/receive messages)
- Messages are broadcast in real-time but not persisted
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
function formatLog(timestamp, ip, method, path, status, latency, reqId) {
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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Missing token',
      statusCode: 401
    });
  }
  
  // Verify JWT
  // Attach user to req.user
  // Call next()
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions',
        statusCode: 403
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

| Category | Points | Criteria |
|----------|--------|----------|
| Functionality | 40-50 | All requirements met, no bugs |
| Testing | 15-20 | >80% coverage, edge cases included |
| Code Quality | 15-20 | Clean, DRY, well-documented |
| Performance | 10-15 | No regressions, optimized |
| Documentation | 5-10 | Clear README updates, comments |

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

*Last updated: 2025-12-07*  
*Assignments designed for SuperApp Backend microservices platform*
