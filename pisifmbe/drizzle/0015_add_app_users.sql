-- Migration: Add app_users table for authentication
CREATE TABLE IF NOT EXISTS "app_users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "name" VARCHAR(100),
  "role" VARCHAR(50) NOT NULL,
  "plant_access" TEXT[] DEFAULT '{}',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS "idx_app_users_username" ON "app_users" ("username");
CREATE INDEX IF NOT EXISTS "idx_app_users_role" ON "app_users" ("role");
