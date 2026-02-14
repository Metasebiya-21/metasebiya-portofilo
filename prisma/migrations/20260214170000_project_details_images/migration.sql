-- AlterTable
ALTER TABLE "public"."Project"
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "images" JSONB;
