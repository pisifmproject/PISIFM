-- Migration: Add plants and machines tables for multi-plant support
-- This migration adds the core tables needed for dynamic multi-plant architecture

-- Plants table: stores the four plants (semarang, cikokol, cikupa, agro)
CREATE TABLE IF NOT EXISTS "plants" (
  "plant_id" text PRIMARY KEY NOT NULL,
  "display_name" text NOT NULL,
  "location" text,
  "status" text DEFAULT 'active' NOT NULL,
  "has_real_data" boolean DEFAULT false NOT NULL,
  "installed_capacity_kva" double precision DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Machines table: stores all machines across all plants
CREATE TABLE IF NOT EXISTS "machines" (
  "machine_id" text PRIMARY KEY NOT NULL,
  "plant_id" text NOT NULL REFERENCES "plants"("plant_id") ON DELETE CASCADE,
  "machine_name" text NOT NULL,
  "machine_type" text, -- 'production', 'packing', etc.
  "line_category" text, -- optional grouping
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_machines_plant_id" ON "machines"("plant_id");
CREATE INDEX IF NOT EXISTS "idx_machines_status" ON "machines"("status");
CREATE INDEX IF NOT EXISTS "idx_plants_status" ON "plants"("status");
