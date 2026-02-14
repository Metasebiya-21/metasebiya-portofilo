-- Add structured skill details to TechStack for admin-managed descriptions and usage notes.
ALTER TABLE "public"."TechStack"
ADD COLUMN "description" TEXT,
ADD COLUMN "howIUseIt" TEXT,
ADD COLUMN "technicalUse" TEXT;
