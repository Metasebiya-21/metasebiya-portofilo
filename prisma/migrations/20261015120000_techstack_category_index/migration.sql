-- Restore the foreign-key index dropped by 20260501083935_init (now declared in schema.prisma).
CREATE INDEX IF NOT EXISTS "TechStack_categoryId_idx" ON "TechStack"("categoryId");
