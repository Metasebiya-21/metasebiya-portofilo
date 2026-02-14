"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navigationLinks } from "@/content/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    navigationLinks.forEach((link) => {
      router.prefetch(link.href);
    });
  }, [router]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-end md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            className="rounded-lg border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>

        <ul className="hidden justify-end gap-4 text-sm md:flex">
          {navigationLinks.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                prefetch
                className={`inline-flex min-w-24 items-center justify-center rounded-lg px-4 py-2 transition-all duration-150 ${
                  pathname === l.href
                    ? "bg-slate-900 text-white dark:bg-sky-300 dark:text-slate-900"
                    : "bg-white/65 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {isOpen && (
          <ul className="mt-3 space-y-2 text-sm md:hidden">
            {navigationLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  prefetch
                  className={`block rounded-lg px-3 py-2 transition ${
                    pathname === l.href
                      ? "bg-slate-900 text-white dark:bg-sky-300 dark:text-slate-900"
                      : "bg-white/65 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
