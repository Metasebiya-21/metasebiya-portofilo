import { profile as fallbackProfile } from "@/content/profile";
import { experiences as fallbackExperiences } from "@/content/experience";
import { projects as fallbackProjects } from "@/content/projects";
import { aboutContent } from "@/content/about";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCacheClient } from "@/lib/cache";

type ProfileData = typeof fallbackProfile;
type ExperienceData = (typeof fallbackExperiences)[number];
type ProjectData = {
  id: number;
  title: string;
  category: string;
  summary: string;
  description: string;
  images: string[];
  tags: string[];
  link: string;
};

const PROFILE_CACHE_KEY = "portfolio:profile";
const EXPERIENCES_CACHE_KEY = "portfolio:experiences";
const PROJECTS_CACHE_KEY = "portfolio:projects";
const SKILLS_CACHE_KEY = "portfolio:skills";
const SKILL_DETAILS_CACHE_KEY = "portfolio:skill-details";
const CACHE_TTL_SECONDS = 300;
export const PORTFOLIO_CACHE_TAG = "portfolio";

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeProfileData(profile: Partial<ProfileData>): ProfileData {
  return {
    name: profile.name || fallbackProfile.name,
    brandName: profile.brandName || fallbackProfile.brandName,
    role: profile.role || fallbackProfile.role,
    niche: profile.niche || fallbackProfile.niche,
    headline: profile.headline || fallbackProfile.headline,
    location: profile.location || fallbackProfile.location,
    email: profile.email || fallbackProfile.email,
    linkedin: profile.linkedin || fallbackProfile.linkedin,
    github: profile.github || fallbackProfile.github,
    website: profile.website || fallbackProfile.website,
    resumeUrl: profile.resumeUrl || fallbackProfile.resumeUrl,
    availability: profile.availability || fallbackProfile.availability,
    contactIntro: profile.contactIntro || fallbackProfile.contactIntro,
    summary: profile.summary || fallbackProfile.summary,
    impactMetrics: profile.impactMetrics ?? fallbackProfile.impactMetrics,
    trustSignals: profile.trustSignals ?? fallbackProfile.trustSignals,
    clientLogos: profile.clientLogos ?? fallbackProfile.clientLogos,
    testimonials: profile.testimonials ?? fallbackProfile.testimonials,
    highlights: profile.highlights ?? fallbackProfile.highlights,
  };
}

async function getProfileDataUncached(): Promise<ProfileData> {
  const cache = getCacheClient();
  if (cache) {
    try {
      const cached = await cache.get(PROFILE_CACHE_KEY);
      if (cached) return normalizeProfileData(JSON.parse(cached) as Partial<ProfileData>);
    } catch {
      // Fall through to database and static fallback.
    }
  }

  try {
    const data = await prisma.profile.findUnique({ where: { id: 1 } });
    if (!data) return fallbackProfile;

    const profile = normalizeProfileData({
      name: data.name,
      brandName: data.brandName,
      role: data.role,
      niche: fallbackProfile.niche,
      headline: data.headline,
      location: data.location,
      email: data.email,
      linkedin: data.linkedin,
      github: data.github ?? "",
      website: data.website ?? "",
      resumeUrl: fallbackProfile.resumeUrl,
      availability: fallbackProfile.availability,
      contactIntro: data.contactIntro,
      summary: data.summary,
      impactMetrics: fallbackProfile.impactMetrics,
      trustSignals: fallbackProfile.trustSignals,
      clientLogos: fallbackProfile.clientLogos,
      testimonials: fallbackProfile.testimonials,
      highlights: fallbackProfile.highlights,
    });

    if (cache) {
      try {
        await cache.set(PROFILE_CACHE_KEY, JSON.stringify(profile), CACHE_TTL_SECONDS);
      } catch {
        // Ignore cache write errors.
      }
    }
    return profile;
  } catch {
    return fallbackProfile;
  }
}

async function getExperiencesDataUncached(): Promise<ExperienceData[]> {
  const cache = getCacheClient();
  if (cache) {
    try {
      const cached = await cache.get(EXPERIENCES_CACHE_KEY);
      if (cached) return JSON.parse(cached) as ExperienceData[];
    } catch {
      // Fall through to database and static fallback.
    }
  }

  try {
    const rows = await prisma.experience.findMany({
      where: { visibleToPublic: true },
      include: {
        techStackLinks: {
          include: { techStack: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    if (!rows.length) {
      const totalRows = await prisma.experience.count();
      if (totalRows > 0) return [];
      return fallbackExperiences;
    }

    const experiences = rows.map((row) => ({
      title: row.title,
      role: row.role,
      period: row.period,
      bullets: asStringArray(row.bullets),
      techStacks: row.techStackLinks.map((link) => link.techStack.name),
    }));

    if (cache) {
      try {
        await cache.set(EXPERIENCES_CACHE_KEY, JSON.stringify(experiences), CACHE_TTL_SECONDS);
      } catch {
        // Ignore cache write errors.
      }
    }
    return experiences;
  } catch {
    return fallbackExperiences;
  }
}

async function getProjectsDataUncached(): Promise<ProjectData[]> {
  const cache = getCacheClient();
  if (cache) {
    try {
      const cached = await cache.get(PROJECTS_CACHE_KEY);
      if (cached) return JSON.parse(cached) as ProjectData[];
    } catch {
      // Fall through to database and static fallback.
    }
  }

  try {
    const rows = await prisma.project.findMany({
      where: { visibleToPublic: true },
      include: {
        category: true,
        techStackLinks: {
          include: { techStack: true },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    if (!rows.length) {
      const totalRows = await prisma.project.count();
      if (totalRows > 0) return [];
      return fallbackProjects.map((project, index) => ({
        id: index + 1,
        title: project.title,
        category: project.category,
        summary: project.summary,
        description: project.summary,
        images: [],
        tags: project.tags,
        link: project.link || "",
      }));
    }

    const projects = rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category.name,
      summary: row.summary,
      description: row.description ?? "",
      images: asStringArray(row.images),
      tags: row.techStackLinks.map((link) => link.techStack.name),
      link: row.link ?? "",
    }));

    if (cache) {
      try {
        await cache.set(PROJECTS_CACHE_KEY, JSON.stringify(projects), CACHE_TTL_SECONDS);
      } catch {
        // Ignore cache write errors.
      }
    }
    return projects;
  } catch {
    return fallbackProjects.map((project, index) => ({
      id: index + 1,
      title: project.title,
      category: project.category,
      summary: project.summary,
      description: project.summary,
      images: [],
      tags: project.tags,
      link: project.link || "",
    }));
  }
}

type SkillGroupData = {
  label: string;
  skills: string[];
};

export type SkillDetailData = {
  name: string;
  category: string | null;
  description: string | null;
  howIUseIt: string | null;
  technicalUse: string | null;
};

async function getSkillGroupsDataUncached(): Promise<SkillGroupData[]> {
  const cache = getCacheClient();
  if (cache) {
    try {
      const cached = await cache.get(SKILLS_CACHE_KEY);
      if (cached) return JSON.parse(cached) as SkillGroupData[];
    } catch {
      // Fall through.
    }
  }

  try {
    const rows = await prisma.techStack.findMany({
      where: { categoryId: { not: null } },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    });
    if (!rows.length) return aboutContent.skillGroups;

    const grouped = rows.reduce<Record<string, string[]>>((acc, row) => {
      if (!row.category) return acc;
      if (!acc[row.category.name]) acc[row.category.name] = [];
      acc[row.category.name].push(row.name);
      return acc;
    }, {});
    const groups = Object.entries(grouped).map(([label, skills]) => ({ label, skills }));

    if (cache) {
      try {
        await cache.set(SKILLS_CACHE_KEY, JSON.stringify(groups), CACHE_TTL_SECONDS);
      } catch {
        // Ignore cache write errors.
      }
    }
    return groups;
  } catch {
    return aboutContent.skillGroups;
  }
}

async function getSkillDetailsDataUncached(): Promise<SkillDetailData[]> {
  const cache = getCacheClient();
  if (cache) {
    try {
      const cached = await cache.get(SKILL_DETAILS_CACHE_KEY);
      if (cached) return JSON.parse(cached) as SkillDetailData[];
    } catch {
      // Fall through.
    }
  }

  try {
    const rows = await prisma.techStack.findMany({
      include: { category: true },
      orderBy: [{ name: "asc" }],
    });

    const details = rows.map((row) => ({
      name: row.name,
      category: row.category?.name ?? null,
      description: row.description ?? null,
      howIUseIt: row.howIUseIt ?? null,
      technicalUse: row.technicalUse ?? null,
    }));

    if (cache) {
      try {
        await cache.set(SKILL_DETAILS_CACHE_KEY, JSON.stringify(details), CACHE_TTL_SECONDS);
      } catch {
        // Ignore cache write errors.
      }
    }
    return details;
  } catch {
    return [];
  }
}

export const getProfileData = unstable_cache(getProfileDataUncached, ["portfolio:profile"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PORTFOLIO_CACHE_TAG],
});

export const getExperiencesData = unstable_cache(getExperiencesDataUncached, ["portfolio:experiences"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PORTFOLIO_CACHE_TAG],
});

export const getProjectsData = unstable_cache(getProjectsDataUncached, ["portfolio:projects"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PORTFOLIO_CACHE_TAG],
});

export const getSkillGroupsData = unstable_cache(getSkillGroupsDataUncached, ["portfolio:skills"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PORTFOLIO_CACHE_TAG],
});

export const getSkillDetailsData = unstable_cache(getSkillDetailsDataUncached, ["portfolio:skill-details"], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PORTFOLIO_CACHE_TAG],
});

export async function getProjectById(id: number) {
  const projects = await getProjectsData();
  return projects.find((project) => project.id === id) ?? null;
}
