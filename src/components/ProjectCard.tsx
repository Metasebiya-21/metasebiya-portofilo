"use client";
import Link from "next/link";
import { useState } from "react";

type Project = {
  id: number;
  title: string;
  category?: string;
  summary: string;
  description?: string;
  images?: string[];
  tags: string[];
  link?: string;
  skillDetails?: Record<
    string,
    {
      description: string | null;
      howIUseIt: string | null;
      technicalUse: string | null;
    }
  >;
};

function getJustificationBullets(detail?: {
  description: string | null;
  howIUseIt: string | null;
  technicalUse: string | null;
}) {
  if (!detail) return [];
  return [detail.technicalUse, detail.howIUseIt, detail.description]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .flatMap((value) => value.split(/\r?\n/))
    .map((line) => line.replace(/^\s*[-*]\s?/, "").trim())
    .filter(Boolean);
}

const VISITOR_SESSION_KEY = "portfolio_visitor_session_id";

function getVisitorSessionId() {
  if (typeof window === "undefined") return "anonymous";
  const saved = window.localStorage.getItem(VISITOR_SESSION_KEY);
  if (saved) return saved;
  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(VISITOR_SESSION_KEY, generated);
  return generated;
}

export default function ProjectCard({ id, title, category, summary, tags, link, skillDetails }: Project) {
  const [selectedTag, setSelectedTag] = useState("");
  const trackClick = () => {
    if (!link) return;
    void fetch("/api/analytics/project-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: id,
        projectTitle: title,
        projectLink: link,
        sessionId: getVisitorSessionId(),
      }),
    });
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-slate-900/70">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          <Link href={`/projects/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>
        {category && (
          <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {category}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{summary}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map(t => (
          <li key={t}>
            <button
              type="button"
              onClick={() => setSelectedTag((prev) => (prev === t ? "" : t))}
              className={`rounded px-2 py-0.5 text-xs border dark:border-gray-700 ${
                selectedTag === t
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-gray-300 text-slate-700 dark:text-slate-200"
              }`}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
      {selectedTag && skillDetails?.[selectedTag] && getJustificationBullets(skillDetails[selectedTag]).length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white/75 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/60">
          <ul className="list-disc space-y-1 pl-4">
            {getJustificationBullets(skillDetails[selectedTag]).map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}
      {link && (
        <div className="mt-4 flex items-center gap-4">
          <Link href={`/projects/${id}`} className="text-sm font-semibold text-slate-700 hover:underline dark:text-slate-200">
            View case study
          </Link>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={trackClick}
            className="text-sm font-medium text-sky-600 hover:underline"
          >
            Open Git URL
          </a>
        </div>
      )}
      {!link && (
        <div className="mt-4">
          <Link href={`/projects/${id}`} className="text-sm font-semibold text-slate-700 hover:underline dark:text-slate-200">
            View case study
          </Link>
        </div>
      )}
    </article>
  );
}
