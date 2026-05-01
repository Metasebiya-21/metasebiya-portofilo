import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import InteractiveSkills from "@/components/InteractiveSkills";
import FocusAccordion from "@/components/FocusAccordion";
import HomeCategoryProjects from "@/components/HomeCategoryProjects";
import Link from "next/link";
import { getProfileData, getProjectsData, getSkillDetailsData, getSkillGroupsData } from "@/lib/portfolio-store";
import { aboutContent } from "@/content/about";
import { siteContent } from "@/content/site";

export default async function HomePage() {
  const [profile, projects, skillGroups, skillDetails] = await Promise.all([
    getProfileData(),
    getProjectsData(),
    getSkillGroupsData(),
    getSkillDetailsData(),
  ]);
  const skillDetailsMap = Object.fromEntries(
    skillDetails.map((item) => [
      item.name,
      {
        description: item.description,
        howIUseIt: item.howIUseIt,
        technicalUse: item.technicalUse,
      },
    ]),
  );

  return (
    <>
      <Header />
      <main className="mt-8 space-y-12">
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white/85 p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {profile.role}
          </p>
          <h1 className="mt-4 text-3xl font-bold sm:text-5xl">{profile.name}</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-700 dark:text-slate-200">{profile.niche}</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{profile.availability}</p>
          <p className="mt-2 text-sm text-slate-500">{profile.location}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Start a Conversation
            </Link>
            <a
              href="/resume"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View Resume
            </a>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xl text-gray-700 dark:text-gray-200">
            <a
              href={`mailto:${profile.email}`}
              aria-label={siteContent.home.contactLinks.email}
              title={siteContent.home.contactLinks.email}
              className="transition hover:text-sky-600"
            >
              <i className="fa-solid fa-envelope" />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={siteContent.home.contactLinks.linkedin}
              title={siteContent.home.contactLinks.linkedin}
              className="transition hover:text-sky-600"
            >
              <i className="fa-brands fa-linkedin" />
            </a>
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label={siteContent.home.contactLinks.github}
                title={siteContent.home.contactLinks.github}
                className="transition hover:text-sky-600"
              >
                <i className="fa-brands fa-github" />
              </a>
            )}
          </div>
        </section>

        <Section title={siteContent.home.sections.metrics}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {profile.impactMetrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{metric.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title={siteContent.home.sections.highlights}>
          <ul className="list-disc space-y-2 pl-5">
            {profile.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </Section>

        <Section title={siteContent.home.sections.trust}>
          <div className="mb-4 flex flex-wrap gap-2">
            {profile.clientLogos.map((logo) => (
              <span
                key={logo}
                className="rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
              >
                {logo}
              </span>
            ))}
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.trustSignals.map((signal) => (
              <li
                key={signal}
                className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                {signal}
              </li>
            ))}
          </ul>
        </Section>

        <section>
          <InteractiveSkills groups={skillGroups} skillDetails={skillDetailsMap} />
        </section>

        <section>
          <FocusAccordion items={aboutContent.focusAreas} />
        </section>

        <Section title={siteContent.home.sections.caseStudies}>
          <HomeCategoryProjects projects={projects} skillDetails={skillDetailsMap} />
        </Section>

        <Section title={siteContent.home.sections.testimonials}>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.testimonials.map((item) => (
              <figure
                key={`${item.author}-${item.org}`}
                className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <blockquote className="text-sm text-slate-700 dark:text-slate-200">“{item.quote}”</blockquote>
                <figcaption className="mt-3 text-xs uppercase tracking-wide text-slate-500">
                  {item.author} · {item.org}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
