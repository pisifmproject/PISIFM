const { db } = require("../config/database");
const { users } = require("../models/schema");
const { eq } = require("drizzle-orm");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

class UserService {
  async getAllUsers() {
    const result = await db.select().from(users);
    return result.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async getUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    if (result.length === 0) {
      return null;
    }
    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  }

  async createUser(userData) {
    const { password, ...otherData } = userData;
    const hashedPassword = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : null;

    const newUser = await db
      .insert(users)
      .values({
        ...otherData,
        password: hashedPassword,
        id: otherData.id || `USR-${Date.now()}`,
      })
      .returning();

    const { password: _, ...userWithoutPassword } = newUser[0];
    return userWithoutPassword;
  }

  async updateUser(id, userData) {
    const { password, ...otherData } = userData;

    const updateData = { ...otherData, updatedAt: new Date() };

    if (password) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (result.length === 0) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  }

  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}

module.exports = new UserService();
