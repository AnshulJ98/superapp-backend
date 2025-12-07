# Quick Start: Assignment Selection Guide

## 🎯 Choose Your Assignment

Pick **ONE** assignment based on your interests and skill level.

### 🌟 For Beginners → Start with Assignment 3
**API Gateway Logging** — Low risk, immediate feedback, improves observability
- Duration: 1.5-2 hours
- Skills: Node.js, file I/O, basic middleware
- Impact: All requests now trackable and debuggable

### 🚀 For Backend Developers → Start with Assignment 1
**User Service CRUD with Validation** — Foundation for all other work
- Duration: 2-3 hours
- Skills: Node.js/Express, validation, testing
- Impact: Production-ready user API with proper error handling
- **Recommended:** Do this first, unlock Assignment 4

### 🔧 For Advanced Developers → Start with Assignment 2
**Chat Message Persistence** — Complex distributed systems
- Duration: 3-4 hours
- Skills: Go, Redis, WebSocket
- Impact: Users can see chat history, messages persist

### 🔐 For Security-Focused → Start with Assignment 4
**Authentication & JWT** — Secure the API
- Duration: 3-4 hours
- Skills: Cryptography, JWT, RBAC
- Impact: Protected endpoints, user roles, token management
- **Prerequisite:** Complete Assignment 1 first

---

## 📋 Assignment Summary

| # | Title | Difficulty | Time | Priority | Skills |
|---|-------|-----------|------|----------|--------|
| 1 | User CRUD Validation | Medium | 2-3h | HIGH | Node/Express, testing |
| 2 | Chat Persistence | Advanced | 3-4h | HIGH | Go, Redis, WebSocket |
| 3 | Gateway Logging | Medium | 1.5-2h | MEDIUM | Node.js, observability |
| 4 | Authentication JWT | Advanced | 3-4h | MEDIUM | Crypto, JWT, RBAC |
| 5 | API Documentation | Medium | 2-3h | LOW | OpenAPI, Swagger |
| 6 | Metrics & Health | Advanced | 3-4h | MEDIUM | Observability |
| 7 | Database Seeding | Medium | 1.5-2h | MEDIUM | Databases, scripting |

---

## 🚦 Recommended Learning Path

```
START HERE ↓
Assignment 1: User CRUD Validation (2-3h)
    ↓
Assignment 3: Gateway Logging (1.5-2h)
    ↓
Assignment 4: Authentication (3-4h)
    ↓
Assignment 2: Chat Persistence (3-4h)
    ↓
Assignment 5: API Documentation (2-3h)
    ↓
Assignment 6: Metrics (3-4h)
    ↓
Assignment 7: Database Seeding (1.5-2h)
```

**Total Time:** ~18 hours to complete all assignments  
**With Bonus Work:** ~30+ hours

---

## ✅ Before You Start

### Setup Checklist
- [ ] Repository cloned: `superapp-backend/`
- [ ] Docker installed and running
- [ ] Node.js 18+ installed
- [ ] Go 1.20+ installed (for chat service)
- [ ] Stack running: `docker compose up -d`
- [ ] Tests passing: `make test-chat`

### Knowledge Check
- [ ] Understand how microservices communicate
- [ ] Know basic HTTP status codes
- [ ] Familiar with git workflow (branches, PRs)
- [ ] Understand JSON request/response format
- [ ] Know how to read test files

### Files You'll Need
- `ASSIGNMENTS.md` — Full assignment details
- `README.md` — Project architecture
- `Makefile` — Useful commands
- `docker-compose.yml` — Service definitions

---

## 🔥 Quick Commands

```bash
# Check if stack is running
docker ps | grep superapp

# Run tests
make test-chat              # Go tests for chat
npm test                    # Jest for user-service

# Seed database
make seed-db

# View logs
docker logs superapp-backend-gateway-1 -f
docker logs superapp-backend-user-service-1 -f

# Start feature branch
git checkout -b feat/assignment-1-user-validation

# After changes, commit
git add -A
git commit -m "feat: implement user validation

- Add email validation
- Add name validation
- Return 409 on duplicate email"

git push origin feat/assignment-1-user-validation
```

---

## 🎯 Assignment 1 Quick Start

**File:** `services/user-service/index.js`

```javascript
// Add validation helper
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidName(name) {
  return name && typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
}

// Add error response helper
function errorResponse(statusCode, message, details = []) {
  return {
    error: message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}

// Update POST /users
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  // Validate
  const errors = [];
  if (!isValidName(name)) errors.push({ field: 'name', message: 'Invalid name' });
  if (!isValidEmail(email)) errors.push({ field: 'email', message: 'Invalid email' });
  
  if (errors.length > 0) {
    return res.status(400).json(errorResponse(400, 'Validation failed', errors));
  }
  
  // Check duplicate
  // Create user
  // Return 201
});
```

---

## 🧪 Running Tests

```bash
cd services/user-service
npm install
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 📞 Stuck? Here's Help

### Common Issues

**"User service not starting"**
```bash
docker logs superapp-backend-user-service-1
# Check for Prisma errors, fix schema, rebuild:
docker compose up -d --build user-service
```

**"Tests failing after changes"**
```bash
cd services/user-service
npm test -- --verbose
# Read error message carefully, fix code, re-run
```

**"Can't reach gateway"**
```bash
# Verify all services are running
docker compose ps

# Check gateway logs
docker logs superapp-backend-gateway-1 | tail -20

# Restart stack
docker compose restart
```

---

## 🏆 Success Criteria

When you finish an assignment:
- [ ] All acceptance criteria met
- [ ] Tests passing (>80% coverage)
- [ ] Code follows style guide
- [ ] No console.log() in production code
- [ ] Error handling implemented
- [ ] PR created with clear description
- [ ] Ready for code review

---

## 🎁 Bonus Features

Each assignment has bonus points available:

- **+10 points** — Input sanitization, metrics, etc.
- **+15 points** — Advanced features (room mgmt, 2FA, dashboard)
- **+20 points** — Complete bonus work

Max possible score: **100+ points per assignment**

---

## 🥚 Easter Eggs

While you work, try to find these hidden surprises:

1. **Phoenix User** — Create user "Phoenix" (email: phoenix@rising.com)
2. **Chat Stats** — Send `/stats` message in chat room
3. **Leap Day Child** — Seed users on Feb 29
4. **Log Mystery** — Check logs for hidden message at request 1000
5. **JWT Secret** — Set JWT_SECRET to a special value

---

**Ready? Open `ASSIGNMENTS.md` and pick your first assignment!** 🚀

*Last updated: 2025-12-07*
