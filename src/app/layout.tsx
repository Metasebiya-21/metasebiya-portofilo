import "./globals.css";
import type { Metadata } from "next";
import { profile } from "@/content/profile";
import ClientWidgets from "@/components/ClientWidgets";
import { Manrope, Space_Grotesk } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

const siteUrl = profile.website?.startsWith("http") ? profile.website : "https://example.com";
const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${profile.name} | Backend, Data, and AI Engineer`,
    template: `%s | ${profile.name}`,
  },
  description: profile.headline,
  keywords: [
    "Backend Engineer",
    "Software Engineer",
    "Data Engineering",
    "Machine Learning",
    "Fintech",
    "Portfolio",
    "Next.js",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${profile.name} | Backend, Data, and AI Engineer`,
    description: profile.headline,
    url: "/",
    siteName: `${profile.name} Portfolio`,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${profile.name} portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | Backend, Data, and AI Engineer`,
    description: profile.headline,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    email: profile.email,
    url: profile.website,
    sameAs: [profile.linkedin, profile.github].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location,
    },
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem("theme");
                const isDark = savedTheme === "dark";
                document.documentElement.classList.toggle("dark", isDark);
              })();
            `,
          }}
        />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <div className="mx-auto max-w-5xl px-4">
          {children}
        </div>
        <ClientWidgets />
      </body>
    </html>
  );
}
