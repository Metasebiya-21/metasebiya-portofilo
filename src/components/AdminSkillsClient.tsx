"use client";

import { useState } from "react";

type Category = {
  id: number;
  name: string;
};

type Skill = {
  id: number;
  name: string;
  categoryId: number | null;
  category: { name: string } | null;
  description: string | null;
  howIUseIt: string | null;
  technicalUse: string | null;
};

function parseBulletsFromSkill(skill: Skill) {
  const combined = [skill.technicalUse, skill.howIUseIt, skill.description]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  return combined
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s?/, "").trim())
    .filter(Boolean);
}

function parseBulletsFromText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s?/, "").trim())
    .filter(Boolean);
}

export default function AdminSkillsClient({
  skills: initialSkills,
  categories,
}: {
  skills: Skill[];
  categories: Category[];
}) {
  const [skills, setSkills] = useState(initialSkills);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: categories[0]?.id ?? 0,
    justifications: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: categories[0]?.id ?? 0,
    justifications: "",
  });
  const [filter, setFilter] = useState<"all" | "uncategorized" | "categorized">("all");

  const filteredSkills = skills.filter((skill) => {
    if (filter === "uncategorized") return skill.categoryId === null;
    if (filter === "categorized") return skill.categoryId !== null;
    return true;
  });

  const refreshSkills = async () => {
    const response = await fetch("/api/admin/skills");
    if (!response.ok) return;
    const data = (await response.json()) as { skills: Skill[] };
    setSkills(data.skills);
  };

  const addSkill = async () => {
    if (!form.name.trim() || !form.categoryId) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          justifications: parseBulletsFromText(form.justifications),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to add skill.");
        return;
      }
      setForm((prev) => ({ ...prev, name: "", justifications: "" }));
      setMessage("Skill added.");
      await refreshSkills();
    } finally {
      setLoading(false);
    }
  };

  const saveSkill = async () => {
    if (!editingId || !editForm.name.trim() || !editForm.categoryId) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name,
          categoryId: editForm.categoryId,
          justifications: parseBulletsFromText(editForm.justifications),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to update skill.");
        return;
      }
      setEditingId(null);
      setMessage("Skill updated.");
      await refreshSkills();
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id: number) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to delete skill.");
        return;
      }
      setMessage("Skill deleted.");
      await refreshSkills();
    } finally {
      setLoading(false);
    }
  };

  const startEditSkill = (skill: Skill) => {
    setEditingId(skill.id);
    setEditForm({
      name: skill.name,
      categoryId: skill.categoryId ?? categories[0]?.id ?? 0,
      justifications: parseBulletsFromSkill(skill).join("\n"),
    });
  };

  return (
    <main className="space-y-6 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Skills</h1>
            <p className="mt-1 text-sm text-slate-500">Add/edit/delete skills and assign each skill to a category.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd((prev) => !prev)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          >
            {showAdd ? "Close Form" : "Add New Skill"}
          </button>
        </div>
        {showAdd && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Skill name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <select
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: Number(event.target.value) }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder={"Justifications (one bullet per line)\n- Async programming\n- Dependency injection"}
              value={form.justifications}
              onChange={(event) => setForm((prev) => ({ ...prev, justifications: event.target.value }))}
              rows={4}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={addSkill}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Add Skill
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === "all" ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            All ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("uncategorized")}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === "uncategorized" ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            Uncategorized ({skills.filter((skill) => skill.categoryId === null).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("categorized")}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === "categorized" ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            Categorized ({skills.filter((skill) => skill.categoryId !== null).length})
          </button>
        </div>

        {filteredSkills.map((skill) => (
          <article
            key={skill.id}
            onClick={editingId === skill.id ? undefined : () => startEditSkill(skill)}
            className={`rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${
              editingId === skill.id
                ? ""
                : "cursor-pointer transition hover:border-sky-300 hover:shadow-md dark:hover:border-sky-700"
            }`}
          >
            {editingId === skill.id ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <select
                  value={editForm.categoryId}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, categoryId: Number(event.target.value) }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <textarea
                  value={editForm.justifications}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, justifications: event.target.value }))}
                  rows={4}
                  className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={saveSkill} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingId(null);
                    }}
                    className="rounded-lg border px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {skill.name} <span className="text-slate-500">· {skill.category?.name ?? "Uncategorized"}</span>
                  </p>
                  {parseBulletsFromSkill(skill).length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-xs text-slate-600 dark:text-slate-300">
                      {parseBulletsFromSkill(skill).map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      startEditSkill(skill);
                    }}
                    className="rounded-lg border border-sky-300 px-3 py-1.5 text-sm text-sky-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteSkill(skill.id);
                    }}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
        {filteredSkills.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No skills found for this filter.
          </p>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
    </main>
  );
}
