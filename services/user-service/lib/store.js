// Data access layer for users. Uses Prisma when USE_DB=1, otherwise in-memory.
let useDb = process.env.USE_DB === "1" || false;
let prisma;
try {
  if (useDb) {
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  }
} catch (err) {
  // If Prisma client isn't available, fallback to in-memory
  useDb = false;
}

const inMemory = new Map();

async function listUsers() {
  if (useDb) {
    return prisma.user.findMany();
  }
  return Array.from(inMemory.values());
}

async function getUser(id) {
  if (useDb) {
    return prisma.user.findUnique({ where: { id } });
  }
  return inMemory.get(id);
}

async function createUser({ name, email }) {
  if (useDb) {
    return prisma.user.create({ data: { name, email } });
  }
  const id = require("uuid").v4();
  const user = {
    id,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  inMemory.set(id, user);
  return user;
}

async function updateUser(id, { name, email }) {
  if (useDb) {
    return prisma.user.update({
      where: { id },
      data: { name, email },
    });
  }
  const user = inMemory.get(id);
  if (!user) return null;
  if (name) user.name = name;
  if (email) user.email = email;
  user.updatedAt = new Date().toISOString();
  inMemory.set(id, user);
  return user;
}

async function deleteUser(id) {
  if (useDb) {
    await prisma.user.delete({ where: { id } });
    return true;
  }
  return inMemory.delete(id);
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
