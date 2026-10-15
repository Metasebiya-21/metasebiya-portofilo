import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/portfolio-store";
import type { Metadata } from "next";
import { getProjectLinkLabel } from "@/lib/link-label";

function splitCaseStudy(description: string, fallbackSummary: string) {
  const sections = description
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const defaults = {
    problem: fallbackSummary,
    approach: description || fallbackSummary,
    result: "Impact details available during a deeper project walkthrough.",
  };

  if (!sections.length) return defaults;

  return {
    problem: sections[0] || defaults.problem,
    approach: sections[1] || sections[0] || defaults.approach,
    result: sections[2] || defaults.result,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (!Number.isFinite(projectId)) return {};
  const project = await getProjectById(projectId);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: `${project.title} | Case Study`,
      description: project.summary,
      type: "article",
      url: `/projects/${project.id}`,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (!Number.isFinite(projectId)) notFound();

  const project = await getProjectById(projectId);
  if (!project) notFound();
  const caseStudy = splitCaseStudy(project.description, project.summary);

  return (
    <>
      <Header />
      <main className="mt-8 space-y-6">
        <Link href="/projects" className="text-sm text-sky-600 hover:underline">
          ← Back to Projects
        </Link>
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-wide text-slate-500">{project.category}</p>
          <h1 className="mt-1 text-3xl font-bold">{project.title}</h1>
          <p className="mt-4 text-slate-700 dark:text-slate-200">{project.summary}</p>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline"
            >
              {getProjectLinkLabel(project.link)}
            </a>
          )}
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li key={tag} className="rounded border border-slate-300 px-2 py-0.5 text-xs dark:border-slate-700">
                {tag}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Problem</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{caseStudy.problem}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Approach</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{caseStudy.approach}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Result</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{caseStudy.result}</p>
          </article>
        </section>

        {project.images.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Project Images</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.images.map((imageUrl) => (
                <div key={imageUrl} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={project.title} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
