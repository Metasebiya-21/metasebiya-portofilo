"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className={`fixed bottom-6 left-6 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border text-lg shadow-sm transition ${
        isDark
          ? "border-sky-400 bg-slate-900 text-amber-300 hover:bg-slate-800"
          : "border-gray-300 bg-white text-slate-700 hover:bg-gray-100"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="sr-only">Theme</span>
      <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"} />
    </button>
  );
}
