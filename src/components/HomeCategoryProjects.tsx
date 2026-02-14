"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";

type Project = {
  id: number;
  title: string;
  category: string;
  summary: string;
  description: string;
  images: string[];
  tags: string[];
  link: string;
};

type SkillDetail = {
  description: string | null;
  howIUseIt: string | null;
  technicalUse: string | null;
};

function getJustificationBullets(detail?: SkillDetail) {
  if (!detail) return [];
  return [detail.technicalUse, detail.howIUseIt, detail.description]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .flatMap((value) => value.split(/\r?\n/))
    .map((line) => line.replace(/^\s*[-*]\s?/, "").trim())
    .filter(Boolean);
}

export default function HomeCategoryProjects({
  projects,
  skillDetails,
}: {
  projects: Project[];
  skillDetails?: Record<string, SkillDetail>;
}) {
  const groupedByCategory = useMemo(() => {
    return projects.reduce<Record<string, Project[]>>((acc, project) => {
      const normalized = project.category.trim();
      if (!acc[normalized]) acc[normalized] = [];
      acc[normalized].push(project);
      return acc;
    }, {});
  }, [projects]);

  const categories = useMemo(
    () => Object.keys(groupedByCategory).sort((a, b) => a.localeCompare(b)),
    [groupedByCategory],
  );

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  const [selectedStack, setSelectedStack] = useState("");

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory("");
      return;
    }
    if (!selectedCategory || !groupedByCategory[selectedCategory]) {
      setSelectedCategory(categories[0]);
      setSelectedStack("");
    }
  }, [categories, groupedByCategory, selectedCategory]);

  const latestProjects = useMemo(
    () => (groupedByCategory[selectedCategory] ?? []).slice(0, 3),
    [groupedByCategory, selectedCategory],
  );
  const stacksForSelectedCategory = useMemo(() => {
    const categoryProjects = groupedByCategory[selectedCategory] ?? [];
    const counts = categoryProjects
      .flatMap((project) => project.tags)
      .reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
        return acc;
      }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [groupedByCategory, selectedCategory]);

  if (!categories.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          What I Work With (by Category)
        </h3>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-3 py-1 text-sm ${
              selectedCategory === category
                ? "bg-sky-600 text-white"
                : "border border-slate-300 bg-white/70 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory && stacksForSelectedCategory.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            Tech Stacks in {selectedCategory}
          </p>
          <div className="flex flex-wrap gap-2">
            {stacksForSelectedCategory.map((stack) => (
              <button
                key={stack}
                type="button"
                onClick={() => setSelectedStack((prev) => (prev === stack ? "" : stack))}
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  selectedStack === stack
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                }`}
              >
                {stack}
              </button>
            ))}
          </div>
          {selectedStack && skillDetails?.[selectedStack] && getJustificationBullets(skillDetails[selectedStack]).length > 0 && (
            <article className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/60">
              <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                {getJustificationBullets(skillDetails[selectedStack]).map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {latestProjects.map((project) => (
          <ProjectCard key={project.id} {...project} skillDetails={skillDetails} />
        ))}
      </div>

      <div className="mt-4">
        <Link
          href={`/projects?category=${encodeURIComponent(selectedCategory)}`}
          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          View More in {selectedCategory}
        </Link>
      </div>
    </section>
  );
}
