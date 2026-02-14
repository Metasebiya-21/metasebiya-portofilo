import AdminShell from "@/components/AdminShell";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminProjectsClient from "@/components/AdminProjectsClient";

export default async function AdminProjectsPage() {
  await requireAdminPage();
  const [projects, categories] = await Promise.all([
    prisma.project.findMany({
      include: {
        category: true,
        techStackLinks: { include: { techStack: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true } } },
    }),
  ]);
  const mappedProjects = projects.map((project) => ({
    id: project.id,
    title: project.title,
    category: project.category.name,
    summary: project.summary,
    description: project.description ?? "",
    images: Array.isArray(project.images) ? project.images.filter((v): v is string => typeof v === "string") : [],
    tags: project.techStackLinks.map((link) => link.techStack.name),
    link: project.link,
    visibleToPublic: project.visibleToPublic,
    createdAt: project.createdAt,
  }));
  return (
    <AdminShell>
      <AdminProjectsClient projects={mappedProjects} categories={categories} />
    </AdminShell>
  );
}
