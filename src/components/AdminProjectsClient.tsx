"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PROJECTS_PER_PAGE = 5;

type Project = {
  id: number;
  title: string;
  category: string;
  summary: string;
  description: string;
  images: string[];
  tags: string[];
  link: string | null;
  visibleToPublic: boolean;
  createdAt: Date;
};

type Category = {
  id: number;
  name: string;
  _count: { projects: number };
};

export default function AdminProjectsClient({ projects, categories: initialCategories }: { projects: Project[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const categories = initialCategories;

  const [form, setForm] = useState({
    title: "",
    category: initialCategories[0]?.name || "General",
    summary: "",
    description: "",
    images: "",
    tags: "",
    link: "",
    visibleToPublic: true,
  });
  const [editForm, setEditForm] = useState({
    title: "",
    category: initialCategories[0]?.name || "General",
    summary: "",
    description: "",
    images: "",
    tags: "",
    link: "",
    visibleToPublic: true,
  });

  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get("page") || "1");
    const normalizedPage = Number.isFinite(pageFromUrl)
      ? Math.min(totalPages, Math.max(1, pageFromUrl))
      : 1;
    setCurrentPage(normalizedPage);
  }, [searchParams, totalPages]);

  const pageStart = (currentPage - 1) * PROJECTS_PER_PAGE;
  const pageProjects = useMemo(
    () => projects.slice(pageStart, pageStart + PROJECTS_PER_PAGE),
    [projects, pageStart],
  );

  const updatePageInUrl = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCurrentPage(nextPage);
  };


  const addProject = async () => {
    if (!form.title.trim() || !form.summary.trim() || !form.category.trim()) {
      setError("Title, category and summary are required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images: form.images.split("\n").map((url) => url.trim()).filter(Boolean),
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to add project.");
        return;
      }
      setMessage("Project added.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditForm({
      title: project.title,
      category: project.category,
      summary: project.summary,
      description: project.description,
      images: project.images.join("\n"),
      tags: project.tags.join(", "),
      link: project.link ?? "",
      visibleToPublic: project.visibleToPublic,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editForm.title.trim() || !editForm.summary.trim() || !editForm.category.trim()) {
      setError("Title, category and summary are required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          ...editForm,
          images: editForm.images.split("\n").map((url) => url.trim()).filter(Boolean),
          tags: editForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to update project.");
        return;
      }
      setMessage("Project updated.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to delete project.");
        return;
      }
      setMessage("Project deleted.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <button type="button" onClick={() => setShowAdd((prev) => !prev)} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white">
            {showAdd ? "Close Form" : "Add New Project"}
          </button>
        </div>

        {showAdd && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input placeholder="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              {!categories.length && <option value={form.category}>{form.category}</option>}
              {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            <textarea placeholder="Summary" value={form.summary} onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))} rows={3} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <textarea placeholder="Full Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={6} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <textarea placeholder="Image URLs (one per line)" value={form.images} onChange={(event) => setForm((prev) => ({ ...prev, images: event.target.value }))} rows={4} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <input placeholder="Tech Tags (comma separated)" value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <input placeholder="Git URL" value={form.link} onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <div className="flex items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
              <span className="text-xs uppercase tracking-wide text-slate-500">Visible: {form.visibleToPublic ? "On" : "Off"}</span>
              <button type="button" role="switch" aria-checked={form.visibleToPublic} onClick={() => setForm((prev) => ({ ...prev, visibleToPublic: !prev.visibleToPublic }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.visibleToPublic ? "bg-emerald-500" : "bg-slate-400"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.visibleToPublic ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <button type="button" onClick={addProject} disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {loading ? "Saving..." : "Save Project"}
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
      </section>

      <section className="space-y-3">
        {pageProjects.map((project) => (
          <article
            key={project.id}
            onClick={editingId === project.id ? undefined : () => startEdit(project)}
            className={`rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${
              editingId === project.id
                ? ""
                : "cursor-pointer transition hover:border-sky-300 hover:shadow-md dark:hover:border-sky-700"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-full ${project.visibleToPublic ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span>{project.visibleToPublic ? "Public" : "Hidden"}</span>
                  <span>· {project.category}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    startEdit(project);
                  }}
                  className="rounded-lg border border-sky-300 px-3 py-1.5 text-sm text-sky-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void deleteProject(project.id);
                  }}
                  disabled={loading}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm">{project.summary}</p>
            {editingId === project.id && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input placeholder="Title" value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <select value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
                  {!categories.length && <option value={editForm.category}>{editForm.category}</option>}
                  {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                </select>
                <textarea placeholder="Summary" value={editForm.summary} onChange={(event) => setEditForm((prev) => ({ ...prev, summary: event.target.value }))} rows={3} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <textarea placeholder="Full Description" value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} rows={6} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <textarea placeholder="Image URLs (one per line)" value={editForm.images} onChange={(event) => setEditForm((prev) => ({ ...prev, images: event.target.value }))} rows={4} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <input placeholder="Tags (comma separated)" value={editForm.tags} onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <input placeholder="Git URL" value={editForm.link} onChange={(event) => setEditForm((prev) => ({ ...prev, link: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                <div className="flex items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Visible: {editForm.visibleToPublic ? "On" : "Off"}</span>
                  <button type="button" role="switch" aria-checked={editForm.visibleToPublic} onClick={() => setEditForm((prev) => ({ ...prev, visibleToPublic: !prev.visibleToPublic }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${editForm.visibleToPublic ? "bg-emerald-500" : "bg-slate-400"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${editForm.visibleToPublic ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={saveEdit} disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingId(null);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p>Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage <= 1} onClick={() => updatePageInUrl(Math.max(1, currentPage - 1))} className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40">Prev</button>
            <button type="button" disabled={currentPage >= totalPages} onClick={() => updatePageInUrl(Math.min(totalPages, currentPage + 1))} className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>
    </main>
  );
}
