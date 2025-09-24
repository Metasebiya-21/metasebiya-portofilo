"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Metasebiya
        </Link>
        <ul className="flex gap-4 text-sm">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-2 py-1 rounded ${
                  pathname === l.href ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : "hover:underline"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
