import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";

export default function ExperiencePage() {
  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-6">Experience</h1>

        <Section title="Kifiya Financial Technologies — Lead Software Engineer (Mar 2024 – Present)">
          <ul className="list-disc pl-5 space-y-2">
            <li>Led the Onboarding & Verification Platform (offline-first sync, auto-recovery, secure KYC).</li>
            <li>Mentored 5+ engineers; owned architecture, code reviews, delivery quality.</li>
            <li>Real-time pipelines with Apache Pulsar/Kafka; improved latency and reliability.</li>
            <li>Optimized AWS serverless; cut costs ~20%, improved API speed ~30–40%.</li>
          </ul>
        </Section>

        <Section title="Kifiya Financial Technologies — Software Engineer, MICHU (Apr 2021 – Mar 2024)">
          <ul className="list-disc pl-5 space-y-2">
            <li>Core backend engineer for digital lending (uncollateralized loans).</li>
            <li>Python (FastAPI/Django), Node.js; KYC & approvals integrations.</li>
            <li>PostgreSQL/MySQL optimization; improved transaction throughput.</li>
          </ul>
        </Section>

        <Section title="Qena Digital Lending — Software Engineer (May 2023 – Sep 2024)">
          <ul className="list-disc pl-5 space-y-2">
            <li>Personal/contract ML projects: personalized learning, recommender, healthcare chatbot.</li>
            <li>Amharic OCR research using deep learning.</li>
          </ul>
        </Section>
      </main>
      <Footer />
    </>
  );
}
