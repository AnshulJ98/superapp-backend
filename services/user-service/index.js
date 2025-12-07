// User Service - minimal CRUD with in-memory store
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const store = require("./lib/store");

// Health
app.get("/", (req, res) => res.send("User Service Running"));

// List users
app.get("/users", async (req, res) => {
  const list = await store.listUsers();
  res.json(list);
});

// Get user by id
app.get("/users/:id", async (req, res) => {
  const user = await store.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Create user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "name and email required" });
  try {
    const user = await store.createUser({ name, email });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal error" });
  }
});

// Update user
app.put("/users/:id", async (req, res) => {
  const { name, email } = req.body;
  const updated = await store.updateUser(req.params.id, {
    name,
    email,
  });
  if (!updated)
    return res.status(404).json({ error: "User not found" });
  res.json(updated);
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  const existed = await store.deleteUser(req.params.id);
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
