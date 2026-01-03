// src/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { appUsers, AppUser } from "./auth.schema";
import { eq, or } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "pisifm-secret-key-2025";
const JWT_EXPIRES_IN = "24h";

export interface LoginResult {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    corporateId: string;
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

export async function login(usernameOrCorporateId: string, password: string): Promise<LoginResult> {
  // Cari user berdasarkan username ATAU corporate_id
  const users = await db
    .select()
    .from(appUsers)
    .where(
      or(
        eq(appUsers.username, usernameOrCorporateId),
        eq(appUsers.corporateId, usernameOrCorporateId)
      )
    )
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
    return { success: false, message: "Invalid credentials" };
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
      corporateId: user.corporateId,
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

export interface CreateUserInput {
  username: string;
  corporateId: string;
  password: string;
  name: string;
  role: string;
  plantAccess: string[];
}

export async function createUserInDb(input: CreateUserInput): Promise<Omit<AppUser, "passwordHash">> {
  const passwordHash = await hashPassword(input.password);
  
  const result = await db
    .insert(appUsers)
    .values({
      username: input.username,
      corporateId: input.corporateId,
      passwordHash,
      name: input.name,
      role: input.role,
      plantAccess: input.plantAccess,
      isActive: true,
    })
    .returning();

  const { passwordHash: _, ...user } = result[0];
  return user;
}

export interface UpdateUserInput {
  name?: string;
  corporateId?: string;
  password?: string;
  role?: string;
  plantAccess?: string[];
  isActive?: boolean;
}

export async function updateUserInDb(id: number, input: UpdateUserInput): Promise<Omit<AppUser, "passwordHash"> | null> {
  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.corporateId !== undefined) updateData.corporateId = input.corporateId;
  if (input.role !== undefined) updateData.role = input.role;
  if (input.plantAccess !== undefined) updateData.plantAccess = input.plantAccess;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.password) {
    updateData.passwordHash = await hashPassword(input.password);
  }

  const result = await db
    .update(appUsers)
    .set(updateData)
    .where(eq(appUsers.id, id))
    .returning();

  if (result.length === 0) return null;

  const { passwordHash: _, ...user } = result[0];
  return user;
}

export async function deleteUserFromDb(id: number): Promise<boolean> {
  const result = await db
    .delete(appUsers)
    .where(eq(appUsers.id, id))
    .returning();

  return result.length > 0;
}
