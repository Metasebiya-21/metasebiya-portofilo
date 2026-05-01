"use client";

import React from "react";

export default function PublicResumeViewer({ profile, experiences }: { profile: any, experiences: any }) {
  async function handleDownloadPdf() {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("public-resume");
    if (!element) return;
    
    html2pdf().set({
      margin: [0.75, 0.5],
      filename: `${profile.name.replace(/\s+/g, "_")}_Resume.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    }).from(element).save();
  }

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Standard Resume</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">View and download my general professional background.</p>
        </div>
        <button 
          onClick={handleDownloadPdf}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition active:scale-95"
        >
          Download as PDF
        </button>
      </div>

      <div className="bg-white text-black p-4 sm:p-10 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto w-full">
        <div id="public-resume" className="max-w-[8in] mx-auto text-sm leading-relaxed" style={{fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"}}>
          <h1 style={{fontSize: "28px", fontWeight: "700", marginBottom: "4px", color: "#111"}}>{profile.name}</h1>
          <p style={{marginBottom: "20px", color: "#444", fontSize: "15px"}}>
            {profile.email} • {profile.location} • <a href={profile.linkedin} style={{color: "#2563eb", textDecoration: "none"}}>LinkedIn</a>
          </p>
          
          <hr style={{marginBottom: "20px", borderColor: "#ddd", borderTop: "1px solid #ddd"}} />
          
          <h2 style={{fontSize: "18px", fontWeight: "bold", marginBottom: "12px", textTransform: "uppercase", color: "#222", letterSpacing: "1px"}}>Summary</h2>
          <p style={{marginBottom: "24px", fontSize: "15px", lineHeight: "1.6"}}>{profile.summary}</p>
          
          <h2 style={{fontSize: "18px", fontWeight: "bold", marginBottom: "16px", textTransform: "uppercase", color: "#222", letterSpacing: "1px"}}>Professional Experience</h2>
          {experiences.map((exp: any, i: number) => (
            <div key={i} style={{marginBottom: "20px"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px"}}>
                <strong style={{fontSize: "16px", color: "#111"}}>{exp.role}</strong>
                <span style={{fontSize: "14px", color: "#555", fontWeight: "500"}}>{exp.period}</span>
              </div>
              <div style={{fontStyle: "italic", marginBottom: "8px", fontSize: "15px", color: "#444"}}>{exp.title}</div>
              <ul style={{paddingLeft: "24px", listStyleType: "disc", margin: 0}}>
                {exp.bullets.map((b: string, j: number) => (
                  <li key={j} style={{marginBottom: "6px", fontSize: "14.5px", lineHeight: "1.5", color: "#333"}}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
