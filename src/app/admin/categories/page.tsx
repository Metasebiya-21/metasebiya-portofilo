import AdminShell from "@/components/AdminShell";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminCategoriesClient from "@/components/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true, techStacks: true } } },
  });

  return (
    <AdminShell>
      <AdminCategoriesClient categories={categories} />
    </AdminShell>
  );
}
