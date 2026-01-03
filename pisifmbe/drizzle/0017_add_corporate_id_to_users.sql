-- Add corporate_id column to app_users table
ALTER TABLE "app_users" ADD COLUMN "corporate_id" varchar(50);

-- Update existing users with random corporate IDs
UPDATE "app_users" SET "corporate_id" = 'CORP' || LPAD(CAST(FLOOR(RANDOM() * 100000) AS TEXT), 5, '0') WHERE "corporate_id" IS NULL;

-- Make corporate_id NOT NULL after populating
ALTER TABLE "app_users" ALTER COLUMN "corporate_id" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_corporate_id_unique" UNIQUE ("corporate_id");
