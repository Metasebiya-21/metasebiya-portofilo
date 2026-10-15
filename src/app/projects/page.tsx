import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { getProjectsData, getSkillDetailsData } from "@/lib/portfolio-store";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies across backend engineering, data platforms, fintech systems, and AI projects.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [projects, skillDetails] = await Promise.all([getProjectsData(), getSkillDetailsData()]);
  const skillDetailsMap = Object.fromEntries(
    skillDetails.map((item) => [
      item.name,
      {
        description: item.description,
        howIUseIt: item.howIUseIt,
        technicalUse: item.technicalUse,
      },
    ]),
  );
  const params = await searchParams;
  const categoryFilter = params.category?.trim() || "";
  const filteredProjects = categoryFilter
    ? projects.filter((project) => project.category.toLowerCase() === categoryFilter.toLowerCase())
    : projects;
  const grouped = filteredProjects.reduce<Record<string, typeof filteredProjects>>((acc, project) => {
    if (!acc[project.category]) acc[project.category] = [];
    acc[project.category].push(project);
    return acc;
  }, {});
  const groupedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  // Filter chips list every category so visitors can switch directly between them.
  const categories = Array.from(new Set(projects.map((project) => project.category))).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="mb-2 text-3xl font-bold">{siteContent.projects.title}</h1>
        <p className="mb-6 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Project case studies with focus on problem framing, implementation approach, and measurable outcomes.
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/projects"
            className={`rounded-full border px-3 py-1 text-xs ${
              !categoryFilter
                ? "border-sky-600 bg-sky-600 text-white"
                : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/projects?category=${encodeURIComponent(category)}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                categoryFilter.toLowerCase() === category.toLowerCase()
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
        {categoryFilter && (
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Showing category: <span className="font-semibold">{categoryFilter}</span>
          </p>
        )}
        <div className="space-y-8">
          {groupedCategories.map((category) => (
            <section key={category}>
              <h2 className="mb-3 text-xl font-semibold">{category}</h2>
              <div className="project-grid grid sm:grid-cols-2 gap-4">
                {grouped[category].map((project) => (
                  <ProjectCard key={project.id} {...project} skillDetails={skillDetailsMap} />
                ))}
              </div>
            </section>
          ))}
          {!groupedCategories.length && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No projects available for this filter.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
