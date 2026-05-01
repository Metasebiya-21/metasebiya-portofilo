"use client";

import { useState } from "react";
import { saveAs } from "file-saver";

export default function ResumeBuilderClient() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeHtml, setResumeHtml] = useState("");
  const [coverLetterHtml, setCoverLetterHtml] = useState("");
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResumeHtml(data.resumeHtml);
      setCoverLetterHtml(data.coverLetterHtml);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("document-preview");
    if (!element) return;

    const opt = {
      margin:       1,
      filename:     activeTab === "resume" ? "Resume.pdf" : "Cover_Letter.pdf",
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: "in", format: "letter", orientation: "portrait" }
    };
    html2pdf().set(opt as any).from(element).save();
  }

  async function handleDownloadDocx() {
    const { asBlob } = await import("html-docx-js-typescript");
    const htmlToExport = activeTab === "resume" ? resumeHtml : coverLetterHtml;
    // Ensure styles are stripped out and proper UTF-8 charset exists for Office.
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlToExport}</body></html>`;
    const blob = await asBlob(fullHtml);
    saveAs(blob as Blob, activeTab === "resume" ? "Targeted_Resume.docx" : "Targeted_Cover_Letter.docx");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      {/* Left Panel */}
      <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[calc(100vh-200px)]">
        <h2 className="text-xl font-bold mb-4">Job Description</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Paste the target job description here. The AI will tailor your Resume and Cover Letter to fit these requirements.
        </p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="e.g. We are looking for a Software Engineer with React experience..."
          className="flex-1 w-full p-4 bg-background border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm mb-4"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !jobDescription.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 hover:opacity-90 flex justify-center items-center gap-2 transition"
        >
          {loading ? "Generative AI Working..." : "Generate Documents"}
        </button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {/* Right Panel */}
      <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[calc(100vh-200px)] overflow-hidden">
        <div className="flex justify-between items-center sm:flex-row flex-col gap-4 mb-6">
          <div className="flex bg-background p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "resume" ? "bg-surface shadow-sm text-foreground" : "text-slate-500 hover:text-foreground"}`}
            >
              Resume
            </button>
            <button
              onClick={() => setActiveTab("cover")}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "cover" ? "bg-surface shadow-sm text-foreground" : "text-slate-500 hover:text-foreground"}`}
            >
              Cover Letter
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownloadDocx} disabled={!resumeHtml} className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-50 transition-colors">
              Download DOCX
            </button>
            <button onClick={handleDownloadPdf} disabled={!resumeHtml} className="px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-medium text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 transition-colors">
              Download PDF
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white text-black p-8 rounded-xl overflow-y-auto border border-slate-200">
          {!resumeHtml && !loading ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>Preview will appear here</p>
             </div>
          ) : (
            <div 
              id="document-preview" 
              className="prose max-w-none text-sm leading-relaxed" 
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              dangerouslySetInnerHTML={{ __html: activeTab === "resume" ? resumeHtml : coverLetterHtml }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
