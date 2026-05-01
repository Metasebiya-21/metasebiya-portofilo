import { getProfileData } from "@/lib/portfolio-store";

export default async function Footer() {
  const profile = await getProfileData();

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-10 text-sm text-gray-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <p className="mt-1 text-xs">{profile.availability}</p>
        </div>
        <div className="flex items-center gap-4 text-lg">
          <a
            href={`mailto:${profile.email}`}
            aria-label="Gmail"
            title="Gmail"
            className="transition hover:text-sky-600"
          >
            <i className="fa-solid fa-envelope" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="transition hover:text-sky-600"
          >
            <i className="fa-brands fa-linkedin" />
          </a>
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="transition hover:text-sky-600"
            >
              <i className="fa-brands fa-github" />
            </a>
          )}
          <a
            href="/resume"
            aria-label="Resume"
            title="Resume"
            className="transition hover:text-sky-600"
          >
            <i className="fa-solid fa-file-lines" />
          </a>
        </div>
      </div>
    </footer>
  );
}
