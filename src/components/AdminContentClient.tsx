"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const EXPERIENCES_PER_PAGE = 6;

type Profile = {
  name: string;
  brandName: string;
  role: string;
  headline: string;
  location: string;
  email: string;
  linkedin: string;
  github: string | null;
  website: string | null;
  contactIntro: string;
  summary: string;
} | null;

type Experience = {
  id: number;
  title: string;
  role: string;
  period: string;
  bullets: unknown;
  techStacks: string[];
  visibleToPublic: boolean;
};

function normalizeBullets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default function AdminContentClient({ profile, experiences }: { profile: Profile; experiences: Experience[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || "",
    brandName: profile?.brandName || "",
    role: profile?.role || "",
    headline: profile?.headline || "",
    location: profile?.location || "",
    email: profile?.email || "",
    linkedin: profile?.linkedin || "",
    github: profile?.github || "",
    website: profile?.website || "",
    contactIntro: profile?.contactIntro || "",
    summary: profile?.summary || "",
  });

  const [experienceForm, setExperienceForm] = useState({
    title: "",
    role: "",
    period: "",
    bullets: "",
    techStacks: "",
    visibleToPublic: true,
  });

  const [editExperienceForm, setEditExperienceForm] = useState({
    title: "",
    role: "",
    period: "",
    bullets: "",
    techStacks: "",
    visibleToPublic: true,
  });

  const totalPages = Math.max(1, Math.ceil(experiences.length / EXPERIENCES_PER_PAGE));
  const pageStart = (currentPage - 1) * EXPERIENCES_PER_PAGE;
  const pageExperiences = useMemo(
    () => experiences.slice(pageStart, pageStart + EXPERIENCES_PER_PAGE),
    [experiences, pageStart],
  );

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get("page") || "1");
    const normalizedPage = Number.isFinite(pageFromUrl)
      ? Math.min(totalPages, Math.max(1, pageFromUrl))
      : 1;
    setCurrentPage(normalizedPage);
  }, [searchParams, totalPages]);

  const updatePageInUrl = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCurrentPage(nextPage);
  };

  const saveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to save profile.");
        return;
      }
      setMessage("Profile saved.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const addExperience = async () => {
    if (!experienceForm.title.trim() || !experienceForm.role.trim()) {
      setError("Company and role are required.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...experienceForm,
          bullets: experienceForm.bullets.split("\n").map((line) => line.trim()).filter(Boolean),
          techStacks: experienceForm.techStacks.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to add experience.");
        return;
      }
      setMessage("Experience added.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const startEditExperience = (experience: Experience) => {
    setEditingExperienceId(experience.id);
    setEditExperienceForm({
      title: experience.title,
      role: experience.role,
      period: experience.period,
      bullets: normalizeBullets(experience.bullets).join("\n"),
      techStacks: experience.techStacks.join(", "),
      visibleToPublic: experience.visibleToPublic,
    });
  };

  const saveExperience = async () => {
    if (!editingExperienceId) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingExperienceId,
          ...editExperienceForm,
          bullets: editExperienceForm.bullets.split("\n").map((line) => line.trim()).filter(Boolean),
          techStacks: editExperienceForm.techStacks.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to update experience.");
        return;
      }
      setMessage("Experience updated.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (id: number) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to delete experience.");
        return;
      }
      setMessage("Experience deleted.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-2xl font-semibold">Profile & Contact</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Name</span>
            <input
              value={profileForm.name}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Brand</span>
            <input
              value={profileForm.brandName}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, brandName: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Role</span>
            <input
              value={profileForm.role}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, role: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Headline</span>
            <input
              value={profileForm.headline}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, headline: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Location</span>
            <input
              value={profileForm.location}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Email</span>
            <input
              value={profileForm.email}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">LinkedIn</span>
            <input
              value={profileForm.linkedin}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, linkedin: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">GitHub</span>
            <input
              value={profileForm.github}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, github: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Website</span>
            <input
              value={profileForm.website}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, website: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Contact Intro</span>
            <input
              value={profileForm.contactIntro}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, contactIntro: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Summary</span>
            <textarea
              rows={5}
              value={profileForm.summary}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, summary: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={saveProfile}
          disabled={loading}
          className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold">Experiences</h2>
        <div className="mt-4 space-y-3">
          {pageExperiences.map((exp) => (
            <article
              key={exp.id}
              onClick={editingExperienceId === exp.id ? undefined : () => startEditExperience(exp)}
              className={`rounded-lg border border-slate-200 p-3 dark:border-slate-700 ${
                editingExperienceId === exp.id
                  ? ""
                  : "cursor-pointer transition hover:border-sky-300 hover:shadow-sm dark:hover:border-sky-700"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {exp.title} — {exp.role}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <span
                      aria-hidden
                      className={`inline-block h-2.5 w-2.5 rounded-full ${exp.visibleToPublic ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span>{exp.visibleToPublic ? "Public" : "Hidden"}</span>
                    <span>· {exp.period}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      startEditExperience(exp);
                    }}
                    className="rounded-lg border border-sky-300 px-3 py-1.5 text-sm text-sky-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteExperience(exp.id);
                    }}
                    disabled={loading}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {exp.techStacks.length > 0 && <p className="mt-1 text-xs text-slate-500">Stack: {exp.techStacks.join(", ")}</p>}
              {editingExperienceId === exp.id && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Company"
                    value={editExperienceForm.title}
                    onChange={(event) => setEditExperienceForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <input
                    placeholder="Role"
                    value={editExperienceForm.role}
                    onChange={(event) => setEditExperienceForm((prev) => ({ ...prev, role: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <input
                    placeholder="Period"
                    value={editExperienceForm.period}
                    onChange={(event) => setEditExperienceForm((prev) => ({ ...prev, period: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <textarea
                    placeholder="Bullets (one per line)"
                    value={editExperienceForm.bullets}
                    onChange={(event) => setEditExperienceForm((prev) => ({ ...prev, bullets: event.target.value }))}
                    rows={4}
                    className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <input
                    placeholder="Tech stack (comma separated)"
                    value={editExperienceForm.techStacks}
                    onChange={(event) => setEditExperienceForm((prev) => ({ ...prev, techStacks: event.target.value }))}
                    className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <div className="flex items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
                    <span className="text-xs uppercase tracking-wide text-slate-500">Visible: {editExperienceForm.visibleToPublic ? "On" : "Off"}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editExperienceForm.visibleToPublic}
                      onClick={() => setEditExperienceForm((prev) => ({ ...prev, visibleToPublic: !prev.visibleToPublic }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${editExperienceForm.visibleToPublic ? "bg-emerald-500" : "bg-slate-400"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${editExperienceForm.visibleToPublic ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveExperience}
                      disabled={loading}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingExperienceId(null);
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
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updatePageInUrl(Math.max(1, currentPage - 1))}
              className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updatePageInUrl(Math.min(totalPages, currentPage + 1))}
              className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Add Experience</h2>
          <button
            type="button"
            onClick={() => setShowAddExperience((prev) => !prev)}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          >
            {showAddExperience ? "Close Form" : "Add New Experience"}
          </button>
        </div>
        {showAddExperience && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Company"
              value={experienceForm.title}
              onChange={(event) => setExperienceForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              placeholder="Role"
              value={experienceForm.role}
              onChange={(event) => setExperienceForm((prev) => ({ ...prev, role: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              placeholder="Period"
              value={experienceForm.period}
              onChange={(event) => setExperienceForm((prev) => ({ ...prev, period: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <textarea
              placeholder="Bullets (one per line)"
              value={experienceForm.bullets}
              onChange={(event) => setExperienceForm((prev) => ({ ...prev, bullets: event.target.value }))}
              rows={4}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              placeholder="Tech stack (comma separated)"
              value={experienceForm.techStacks}
              onChange={(event) => setExperienceForm((prev) => ({ ...prev, techStacks: event.target.value }))}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <div className="flex items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
              <span className="text-xs uppercase tracking-wide text-slate-500">Visible: {experienceForm.visibleToPublic ? "On" : "Off"}</span>
              <button
                type="button"
                role="switch"
                aria-checked={experienceForm.visibleToPublic}
                onClick={() => setExperienceForm((prev) => ({ ...prev, visibleToPublic: !prev.visibleToPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${experienceForm.visibleToPublic ? "bg-emerald-500" : "bg-slate-400"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${experienceForm.visibleToPublic ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <button
              type="button"
              onClick={addExperience}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Experience"}
            </button>
          </div>
        )}
      </section>

      {(error || message) && (
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
        </section>
      )}
    </main>
  );
}
