import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/content/projects";

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map(p => <ProjectCard key={p.title} {...p} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
