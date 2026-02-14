-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Skill_categoryId_name_key" ON "public"."Skill"("categoryId", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Skill_name_idx" ON "public"."Skill"("name");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Skill_categoryId_fkey'
  ) THEN
    ALTER TABLE "public"."Skill"
    ADD CONSTRAINT "Skill_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
