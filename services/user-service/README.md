# User Service

Minimal User Service for SuperApp. Provides an in-memory CRUD API for users.

Quick start

```bash
cd services/user-service
npm install
npm start
```

Endpoints

- `GET /` - health check
- `GET /users` - list users
- `GET /users/:id` - get user
- `POST /users` - create user (JSON: `{ "name": "Alice", "email": "a@b.com" }`)
- `PUT /users/:id` - update user
- `DELETE /users/:id` - delete user

Notes

- This service uses an in-memory store; data is not persisted. We'll replace this with a database in later steps.
- Dockerfile provided for containerized runs.
