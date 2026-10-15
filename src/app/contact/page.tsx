import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { getProfileData } from "@/lib/portfolio-store";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Metasebiya for backend engineering, data platform, and applied AI opportunities.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await getProfileData();

  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-4">{siteContent.contact.title}</h1>
        <p className="text-gray-600 dark:text-gray-300">{siteContent.contact.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xl text-gray-700 dark:text-gray-200">
          <a
            href={`mailto:${profile.email}`}
            aria-label={siteContent.contact.links.email}
            title={siteContent.contact.links.email}
            className="inline-flex items-center gap-2 transition hover:text-sky-600"
          >
            <Icon name="envelope" />
            <span className="text-sm">{siteContent.contact.links.email}</span>
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={siteContent.contact.links.linkedin}
            title={siteContent.contact.links.linkedin}
            className="inline-flex items-center gap-2 transition hover:text-sky-600"
          >
            <Icon name="linkedin" />
            <span className="text-sm">{siteContent.contact.links.linkedin}</span>
          </a>
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label={siteContent.contact.links.github}
              title={siteContent.contact.links.github}
              className="inline-flex items-center gap-2 transition hover:text-sky-600"
            >
              <Icon name="github" />
            <span className="text-sm">{siteContent.contact.links.github}</span>
            </a>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full border border-slate-300 px-3 py-1 dark:border-slate-700">Open to global opportunities</span>
          <a
            href="/resume"
            className="rounded-full border border-slate-300 px-3 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Resume
          </a>
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 px-3 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              GitHub Activity
            </a>
          )}
        </div>
        <ContactForm recipientEmail={profile.email} content={siteContent.contact.form} />
      </main>
      <Footer />
    </>
  );
}
