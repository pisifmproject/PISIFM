// src/auth/auth.schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }),
  role: varchar("role", { length: 50 }).notNull(),
  plantAccess: text("plant_access").array().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
