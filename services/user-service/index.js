// User Service - minimal CRUD with in-memory store
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory users store (replace with DB in later steps)
const users = new Map();

// Health
app.get("/", (req, res) => res.send("User Service Running"));

// List users
app.get("/users", (req, res) => {
  const list = Array.from(users.values());
  res.json(list);
});

// Get user by id
app.get("/users/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Create user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "name and email required" });
  const id = uuidv4();
  const user = {
    id,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  res.status(201).json(user);
});

// Update user
app.put("/users/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  user.updatedAt = new Date().toISOString();
  users.set(user.id, user);
  res.json(user);
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const existed = users.delete(req.params.id);
  if (!existed)
    return res.status(404).json({ error: "User not found" });
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`User Service listening on port ${PORT}`)
  );
}

module.exports = app;
