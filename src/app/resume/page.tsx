import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProfileData, getExperiencesData } from "@/lib/portfolio-store";
import PublicResumeViewer from "@/components/PublicResumeViewer";

export const metadata = {
  title: "Resume | Metasebiya",
};

export default async function ResumePage() {
  const [profile, experiences] = await Promise.all([
    getProfileData(),
    getExperiencesData(),
  ]);

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Header />
      <main className="flex-1 w-full px-4 py-8 pt-24 max-w-5xl mx-auto flex items-start justify-center">
        <PublicResumeViewer profile={profile} experiences={experiences} />
      </main>
      <Footer />
    </div>
  );
}
