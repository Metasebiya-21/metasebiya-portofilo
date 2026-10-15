"use client";

import Icon from "@/components/Icon";

// Appearance is driven by the `.dark` class (set before paint by the inline
// script in layout.tsx), so the button never renders the wrong theme first.
export default function ThemeToggle() {
  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    } catch {
      // Storage can be blocked; the toggle still works for this page view.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-lg text-slate-700 shadow-sm transition hover:bg-gray-100 dark:border-sky-400 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <Icon name="moon" className="inline-block dark:hidden" />
      <Icon name="sun" className="hidden dark:inline-block" />
    </button>
  );
}
