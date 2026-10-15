import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProfileData, getExperiencesData } from "@/lib/portfolio-store";
import PublicResumeViewer from "@/components/PublicResumeViewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Metasebiya Mulugeta: backend, data, and applied AI engineering experience.",
  alternates: { canonical: "/resume" },
};

export default async function ResumePage() {
  const [profile, experiences] = await Promise.all([
    getProfileData(),
    getExperiencesData(),
  ]);

  return (
    <>
      <Header />
      <main className="mt-8 flex w-full items-start justify-center">
        <PublicResumeViewer profile={profile} experiences={experiences} />
      </main>
      <Footer />
    </>
  );
}
