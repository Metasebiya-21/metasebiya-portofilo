"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Question = {
  id: string;
  content: string;
  createdAt: string;
};

export default function AdminRecentQuestionsClient({
  questions,
  currentPage,
  totalPages,
}: {
  questions: Question[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasQuestions = useMemo(() => questions.length > 0, [questions]);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    const params = new URLSearchParams(searchParams.toString());
    params.set("chatPage", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const deleteQuestion = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/chat-questions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to delete question.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/chat-questions?all=1", { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to clear questions.");
        return;
      }
      goToPage(1);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Recent Chat Questions</h2>
        <button
          type="button"
          onClick={() => void clearAll()}
          disabled={!hasQuestions || loading}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
        >
          Clear All
        </button>
      </div>

      <ul className="mt-3 space-y-2 text-sm">
        {questions.map((question) => (
          <li
            key={question.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            <div>
              <p>{question.content}</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(question.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void deleteQuestion(question.id)}
              disabled={loading}
              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          </li>
        ))}
        {!hasQuestions && (
          <li className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No questions found.
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => goToPage(currentPage - 1)}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => goToPage(currentPage + 1)}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
