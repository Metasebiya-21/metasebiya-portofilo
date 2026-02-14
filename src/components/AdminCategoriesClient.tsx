"use client";

import { useState } from "react";

type Category = {
  id: number;
  name: string;
  _count: { projects: number; techStacks: number };
};

export default function AdminCategoriesClient({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renamingCategoryId, setRenamingCategoryId] = useState<number | null>(null);
  const [renameCategoryName, setRenameCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/categories");
    if (!response.ok) return;
    const data = (await response.json()) as { categories: Category[] };
    setCategories(data.categories);
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to add category.");
        return;
      }
      setNewCategoryName("");
      setMessage("Category added.");
      await refreshCategories();
    } catch {
      setError("Failed to add category. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const renameCategory = async () => {
    if (!renamingCategoryId || !renameCategoryName.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: renamingCategoryId, name: renameCategoryName }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to rename category.");
        return;
      }
      setRenamingCategoryId(null);
      setRenameCategoryName("");
      setMessage("Category renamed.");
      await refreshCategories();
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to delete category.");
        return;
      }
      setMessage("Category deleted.");
      await refreshCategories();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="mt-1 text-sm text-slate-500">Manage project categories used in dropdowns and public grouping.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd((prev) => !prev)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          >
            {showAdd ? "Close Form" : "Add New Category"}
          </button>
        </div>
        {showAdd && (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void addCategory();
            }}
          >
            <input
              placeholder="New category"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              Add
            </button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        {categories.map((category) => (
          <article
            key={category.id}
            onClick={renamingCategoryId === category.id ? undefined : () => {
              setRenamingCategoryId(category.id);
              setRenameCategoryName(category.name);
            }}
            className={`rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${
              renamingCategoryId === category.id
                ? ""
                : "cursor-pointer transition hover:border-sky-300 hover:shadow-md dark:hover:border-sky-700"
            }`}
          >
            {renamingCategoryId === category.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={renameCategoryName}
                  onChange={(event) => setRenameCategoryName(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void renameCategory();
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setRenamingCategoryId(null);
                  }}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {category.name}{" "}
                  <span className="text-slate-500">
                    ({category._count.projects} projects, {category._count.techStacks} skills)
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setRenamingCategoryId(category.id);
                      setRenameCategoryName(category.name);
                    }}
                    className="rounded-lg border border-sky-300 px-3 py-1.5 text-sm text-sky-600"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteCategory(category.id);
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
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
    </main>
  );
}
