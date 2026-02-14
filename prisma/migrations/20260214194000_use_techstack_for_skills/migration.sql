-- Drop old Skill table if it exists
DROP TABLE IF EXISTS "public"."Skill";

-- Add category on TechStack
ALTER TABLE "public"."TechStack"
ADD COLUMN IF NOT EXISTS "categoryId" INTEGER;

-- Add index
CREATE INDEX IF NOT EXISTS "TechStack_categoryId_idx" ON "public"."TechStack"("categoryId");

-- Add foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'TechStack_categoryId_fkey'
  ) THEN
    ALTER TABLE "public"."TechStack"
    ADD CONSTRAINT "TechStack_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
