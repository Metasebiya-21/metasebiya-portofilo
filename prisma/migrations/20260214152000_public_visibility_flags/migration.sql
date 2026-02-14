-- AlterTable
ALTER TABLE "public"."Project"
ADD COLUMN IF NOT EXISTS "visibleToPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Experience"
ADD COLUMN IF NOT EXISTS "visibleToPublic" BOOLEAN NOT NULL DEFAULT true;
