import AdminShell from "@/components/AdminShell";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminContentClient from "@/components/AdminContentClient";

export default async function AdminContentPage() {
  await requireAdminPage();

  const [profile, experiences] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.experience.findMany({
      include: {
        techStackLinks: { include: { techStack: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const mappedExperiences = experiences.map((experience) => ({
    id: experience.id,
    title: experience.title,
    role: experience.role,
    period: experience.period,
    bullets: experience.bullets,
    techStacks: experience.techStackLinks.map((link) => link.techStack.name),
    visibleToPublic: experience.visibleToPublic,
  }));

  return (
    <AdminShell>
      <AdminContentClient profile={profile} experiences={mappedExperiences} />
    </AdminShell>
  );
}
