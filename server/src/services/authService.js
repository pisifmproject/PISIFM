const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/database");
const { users } = require("../models/schema");
const { eq } = require("drizzle-orm");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

class AuthService {
  async register(userData) {
    const { id, name, email, password, role, ...otherFields } = userData;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        id: id || `USR-${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        ...otherFields,
      })
      .returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser[0];

    // Generate token
    const token = jwt.sign(
      {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user: userWithoutPassword, token };
  }

  async login(email, password) {
    // Find user by email
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = result[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user: userWithoutPassword, token };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async getUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    if (result.length === 0) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
