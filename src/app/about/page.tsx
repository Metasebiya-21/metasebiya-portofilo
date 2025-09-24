import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import { profile } from "@/content/profile";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-4">About</h1>
        <p className="max-w-3xl leading-7">{profile.summary}</p>
        <Section title="What I work with">
          <ul className="list-disc pl-5 space-y-1">
            <li>Backend: Java (Spring Boot), Python (FastAPI, Django), Node.js</li>
            <li>Data & Streaming: Apache Pulsar, Kafka, PostgreSQL, MySQL</li>
            <li>Cloud & DevOps: AWS, Docker, CI/CD</li>
            <li>ML/AI: TensorFlow, PyTorch, NLP, OCR, Recommenders</li>
          </ul>
        </Section>
      </main>
      <Footer />
    </>
  );
}
