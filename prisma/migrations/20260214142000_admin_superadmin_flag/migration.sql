-- AlterTable
ALTER TABLE "public"."AdminUser"
ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
