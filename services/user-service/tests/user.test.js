const request = require("supertest");
const app = require("../index");

describe("User Service CRUD", () => {
  let created;

  test("GET / returns 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/User Service/);
  });

  test("POST /users creates a user", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: "Test User", email: "test@example.com" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@example.com");
    created = res.body;
  });

  test("GET /users returns array", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /users/:id returns created user", async () => {
    const res = await request(app).get(`/users/${created.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(created.id);
  });

  test("PUT /users/:id updates user", async () => {
    const res = await request(app)
      .put(`/users/${created.id}`)
      .send({ name: "Updated Name" });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  test("DELETE /users/:id deletes user", async () => {
    const res = await request(app).delete(`/users/${created.id}`);
    expect(res.statusCode).toBe(204);
  });
});
