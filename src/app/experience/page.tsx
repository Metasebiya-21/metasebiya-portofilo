import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { getExperiencesData } from "@/lib/portfolio-store";

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience delivering backend, data, and AI systems in production fintech environments.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const experiences = await getExperiencesData();

  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-6">{siteContent.experience.title}</h1>

        <div className="experience-list">
        {experiences.map((item) => (
          <article
            key={`${item.title}-${item.role}`}
            className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <h2 className="text-xl font-semibold">{`${item.title} — ${item.role} (${item.period})`}</h2>
            <ul className="list-disc pl-5 space-y-2">
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
