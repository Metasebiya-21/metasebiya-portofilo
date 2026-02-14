import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveSkills from "@/components/InteractiveSkills";
import FocusAccordion from "@/components/FocusAccordion";
import { aboutContent } from "@/content/about";
import { siteContent } from "@/content/site";
import { getProfileData, getSkillGroupsData } from "@/lib/portfolio-store";

export default async function AboutPage() {
  const [profile, skillGroups] = await Promise.all([getProfileData(), getSkillGroupsData()]);

  return (
    <>
      <Header />
      <main className="mt-8 space-y-12">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{aboutContent.sectionLabel}</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{profile.name}</h1>
          <p className="mt-2 text-base font-medium text-slate-600">{profile.role}</p>
          <p className="mt-4 max-w-3xl leading-7 text-slate-700">{profile.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">{siteContent.about.labels.location}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{profile.location}</p>
            </div>
            {aboutContent.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-12">
          <InteractiveSkills groups={skillGroups} />
        </section>

        <section className="my-12">
          <FocusAccordion items={aboutContent.focusAreas} />
        </section>
      </main>
      <Footer />
    </>
  );
}
