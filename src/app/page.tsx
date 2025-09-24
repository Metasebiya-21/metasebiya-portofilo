import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ProjectCard from "@/components/ProjectCard";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mt-8">
        <section className="mt-6">
          <h1 className="text-3xl sm:text-4xl font-bold">{profile.name}</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{profile.role}</p>
          <p className="mt-1 text-sm text-gray-500">{profile.location}</p>
          <p className="mt-4 max-w-2xl">{profile.summary}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a className="underline" href={`mailto:${profile.email}`}>Email</a>
            <a className="underline" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            {profile.github && <a className="underline" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>}
          </div>
        </section>

        <Section title="Highlights">
          <ul className="list-disc pl-5 space-y-2">
            {profile.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </Section>

        <Section title="Selected Projects">
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map(p => <ProjectCard key={p.title} {...p} />)}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
