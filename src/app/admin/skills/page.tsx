import AdminShell from "@/components/AdminShell";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminSkillsClient from "@/components/AdminSkillsClient";

export default async function AdminSkillsPage() {
  await requireAdminPage();
  const [skills, categories] = await Promise.all([
    prisma.techStack.findMany({
      include: { category: true },
      orderBy: [{ categoryId: "asc" }, { category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminShell>
      <AdminSkillsClient skills={skills} categories={categories} />
    </AdminShell>
  );
}
