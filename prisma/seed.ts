import { PrismaClient } from "@prisma/client";
import { profile } from "../src/content/profile";
import { experiences } from "../src/content/experience";
import { projects } from "../src/content/projects";
import { aboutContent } from "../src/content/about";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const techJustifications: Record<
  string,
  { description: string; howIUseIt: string; technicalUse: string }
> = {
  FastAPI: {
    description: "Modern Python framework for high-performance APIs.",
    howIUseIt:
      "I use FastAPI for async endpoints, dependency injection, and clean API contracts with request/response schemas.",
    technicalUse:
      "Async I/O improves throughput for I/O-bound workloads while pydantic validation enforces strong boundary contracts.",
  },
  Django: {
    description: "Batteries-included Python framework for rapid product delivery.",
    howIUseIt:
      "I use Django for ORM-based business workflows, admin operations, and secure auth/authorization in production apps.",
    technicalUse:
      "Mature ORM and migrations reduce maintenance risk and speed up delivery on relational-data-heavy applications.",
  },
  PostgreSQL: {
    description: "Relational database for transactional systems and analytical querying.",
    howIUseIt:
      "I use PostgreSQL for core transactional data, relational modeling, indexing strategies, and reporting queries.",
    technicalUse:
      "ACID transactions, strong indexing support, and a capable query planner provide consistency and predictable performance.",
  },
};

async function main() {
  const superAdminEmail = (
    process.env.SUPERADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@example.com"
  )
    .trim()
    .toLowerCase();
  const superAdminPassword = (
    process.env.SUPERADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    "change_me"
  ).trim();

  const existingProfile = await prisma.profile.findUnique({ where: { id: 1 } });
  const [experienceCount, projectCount, categoryCount, techCount, mappedSkillCount, superAdmin] = await Promise.all([
    prisma.experience.count(),
    prisma.project.count(),
    prisma.category.count(),
    prisma.techStack.count(),
    prisma.techStack.count({ where: { categoryId: { not: null } } }),
    prisma.adminUser.findUnique({ where: { email: superAdminEmail } }),
  ]);

  if (
    existingProfile &&
    experienceCount > 0 &&
    projectCount > 0 &&
    categoryCount > 0 &&
    techCount > 0 &&
    mappedSkillCount > 0 &&
    superAdmin
  ) {
    console.log("Seed skipped: data already exists.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: 1 },
      update: {
        name: profile.name,
        brandName: profile.brandName,
        role: profile.role,
        headline: profile.headline,
        location: profile.location,
        email: profile.email,
        linkedin: profile.linkedin,
        github: profile.github,
        website: profile.website,
        contactIntro: profile.contactIntro,
        summary: profile.summary,
      },
      create: {
        id: 1,
        name: profile.name,
        brandName: profile.brandName,
        role: profile.role,
        headline: profile.headline,
        location: profile.location,
        email: profile.email,
        linkedin: profile.linkedin,
        github: profile.github,
        website: profile.website,
        contactIntro: profile.contactIntro,
        summary: profile.summary,
      },
    });

    const allCategories = Array.from(
      new Set([
        ...projects.map((project) => ("category" in project && project.category ? project.category : "General")),
        ...aboutContent.skillGroups.map((group) => group.label),
      ]),
    );
    if (categoryCount === 0) {
      await tx.category.createMany({
        data: allCategories.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }

    const allTechs = Array.from(
      new Set([
        ...projects.flatMap((project) => project.tags),
        ...experiences.flatMap((experience) => ("techStacks" in experience ? experience.techStacks : [])),
      ]),
    );
    if (techCount === 0) {
      await tx.techStack.createMany({
        data: allTechs.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }

    const categoryRows = await tx.category.findMany();
    const categoryIdByName = new Map(categoryRows.map((category) => [category.name, category.id]));
    const techRows = await tx.techStack.findMany();
    const techIdByName = new Map(techRows.map((tech) => [tech.name, tech.id]));

    for (const [name, details] of Object.entries(techJustifications)) {
      await tx.techStack.updateMany({
        where: { name },
        data: details,
      });
    }

    if (mappedSkillCount === 0) {
      for (const group of aboutContent.skillGroups) {
        const categoryId = categoryIdByName.get(group.label);
        if (!categoryId) continue;
        for (const skill of group.skills) {
          await tx.techStack.upsert({
            where: { name: skill },
            update: { categoryId },
            create: { name: skill, categoryId },
          });
        }
      }
    }

    if (experienceCount === 0) {
      for (let index = 0; index < experiences.length; index += 1) {
        const item = experiences[index];
        const createdExperience = await tx.experience.create({
          data: {
            title: item.title,
            role: item.role,
            period: item.period,
            bullets: item.bullets,
            sortOrder: index,
          },
        });

        const experienceTechs = ("techStacks" in item ? item.techStacks : []).filter((name) => techIdByName.has(name));
        if (experienceTechs.length) {
          const data = experienceTechs
            .map((name) => techIdByName.get(name))
            .filter((id): id is number => typeof id === "number")
            .map((techStackId) => ({
              experienceId: createdExperience.id,
              techStackId,
            }));
          await tx.experienceTech.createMany({
            data,
            skipDuplicates: true,
          });
        }
      }
    }

    if (projectCount === 0) {
      for (let index = 0; index < projects.length; index += 1) {
        const item = projects[index];
        const categoryName = "category" in item && item.category ? item.category : "General";
        const categoryId = categoryIdByName.get(categoryName);
        if (!categoryId) continue;

        const createdProject = await tx.project.create({
          data: {
            title: item.title,
            categoryId,
            summary: item.summary,
            description: "description" in item && typeof item.description === "string" ? item.description : item.summary,
            images:
              "images" in item && Array.isArray(item.images)
                ? item.images.filter((image): image is string => typeof image === "string")
                : [],
            link: item.link || null,
            sortOrder: index,
          },
        });

        const projectTechs = item.tags.filter((name) => techIdByName.has(name));
        if (projectTechs.length) {
          const data = projectTechs
            .map((name) => techIdByName.get(name))
            .filter((id): id is number => typeof id === "number")
            .map((techStackId) => ({
              projectId: createdProject.id,
              techStackId,
            }));
          await tx.projectTech.createMany({
            data,
            skipDuplicates: true,
          });
        }
      }
    }

    if (!superAdmin) {
      const password = await hashPassword(superAdminPassword);
      await tx.adminUser.create({
        data: {
          email: superAdminEmail,
          passwordHash: password.hash,
          passwordSalt: password.salt,
          isSuperAdmin: true,
          isActive: true,
        },
      });
      console.log(`Seed created superadmin user: ${superAdminEmail}`);
    } else {
      await tx.adminUser.update({
        where: { email: superAdminEmail },
        data: {
          isSuperAdmin: true,
          isActive: true,
        },
      });
    }
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
