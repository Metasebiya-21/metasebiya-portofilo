import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { getProjectsData } from "@/lib/portfolio-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = profile.website?.replace(/\/$/, "") || "https://example.com";
  const projects = await getProjectsData();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/experience", "/projects", "/contact"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
    lastModified: new Date(),
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/projects/${project.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes];
}
