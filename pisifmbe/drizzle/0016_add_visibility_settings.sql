-- Migration: Add visibility_settings table for persistent role-based UI visibility
-- This table stores visibility rules that were previously only in localStorage

CREATE TABLE IF NOT EXISTS visibility_settings (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  item_key TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint: one setting per role + scope + item combination
  CONSTRAINT unique_visibility_setting UNIQUE (role, scope_key, item_key)
);

-- Index for fast lookups by role and scope
CREATE INDEX IF NOT EXISTS idx_visibility_role_scope ON visibility_settings(role, scope_key);

-- Index for fast lookups by role only (for loading all settings for a role)
CREATE INDEX IF NOT EXISTS idx_visibility_role ON visibility_settings(role);
