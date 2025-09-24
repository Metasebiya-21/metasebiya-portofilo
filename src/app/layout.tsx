import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metasebiya Mulugeta — Portfolio",
  description: "Lead Software Engineer | Backend, Data Pipelines, ML",
  openGraph: {
    title: "Metasebiya Mulugeta — Portfolio",
    description: "Lead Software Engineer | Backend, Data Pipelines, ML",
    url: "https://your-domain.vercel.app",
    siteName: "Metasebiya Portfolio",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto max-w-5xl px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
