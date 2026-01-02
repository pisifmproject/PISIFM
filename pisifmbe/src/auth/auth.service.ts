// src/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { appUsers, AppUser } from "./auth.schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "pisifm-secret-key-2025";
const JWT_EXPIRES_IN = "24h";

export interface LoginResult {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    name: string | null;
    role: string;
    plantAccess: string[] | null;
  };
  token?: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  plantAccess: string[] | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.username, username))
    .limit(1);

  if (users.length === 0) {
    return { success: false, message: "User not found" };
  }

  const user = users[0];

  if (!user.isActive) {
    return { success: false, message: "User account is inactive" };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, message: "User not found" };
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    plantAccess: user.plantAccess,
  });

  return {
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      plantAccess: user.plantAccess,
    },
    token,
  };
}

export async function getUserById(id: number): Promise<AppUser | null> {
  const users = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.id, id))
    .limit(1);

  return users[0] || null;
}

export async function getAllUsers(): Promise<Omit<AppUser, "passwordHash">[]> {
  const users = await db.select().from(appUsers);
  return users.map(({ passwordHash, ...user }) => user);
}
