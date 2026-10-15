import { NextResponse, NextRequest } from "next/server";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getExperiencesData, getProfileData, getProjectsData, getSkillGroupsData } from "@/lib/portfolio-store";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY. Add it to your environment variables." },
      { status: 500 },
    );
  }

  let body: { jobDescription?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
  if (!jobDescription) {
    return NextResponse.json({ error: "jobDescription is required." }, { status: 400 });
  }
  if (jobDescription.length > 20_000) {
    return NextResponse.json({ error: "Job description is too long (max 20,000 characters)." }, { status: 413 });
  }

  const [profile, experiences, projects, skillGroups] = await Promise.all([
    getProfileData(),
    getExperiencesData(),
    getProjectsData(),
    getSkillGroupsData(),
  ]);

  const portfolioContext = `
Name: ${profile.name}
Role: ${profile.role}
Location: ${profile.location}
Email: ${profile.email}
LinkedIn: ${profile.linkedin}
Summary: ${profile.summary}
Skills: ${skillGroups.map((g) => `${g.label}: ${g.skills.join(", ")}`).join(" | ")}
Experience: ${experiences.map((exp) => `${exp.title} - ${exp.role} (${exp.period}): ${exp.bullets.join("; ")}`).join(" | ")}
Projects: ${projects.map((p) => `${p.title}: ${p.summary}`).join(" | ")}
`.trim();

  const systemPrompt = `
You are an expert resume and cover letter builder.
Using ONLY the candidate's exact experience, skills, and projects provided, build a highly targeted resume and a compelling cover letter customized specifically for the provided Job Description. Do not fabricate facts.

Candidate Details:
---
${portfolioContext}
---

Target Job Description:
---
${jobDescription}
---

Instructions:
1. Extract and format the candidate's experiences effectively to align with keywords and responsibilities inside the Job Description. Tailor the summary and bullet points where applicable.
2. For the HTML Cover Letter: Ensure it exactly follows this brief structure. IMPORTANT: Write in an extremely natural, colloquial, and human tone. ABSOLUTELY DO NOT use standard LLM keywords, overly formal corporate jargon, or pompous vocabulary (e.g., 'furthermore', 'delve', 'thrilled', 'undoubtedly'). Do not use "Dear Hiring Manager".
   Hi team [or insert Name if explicitly provided in the JD],<br><br>
   [Ask one highly-specific, conversational question about their technical stack or business constraint outlined in the job description. Keep it casual but sharp, e.g., "Could you elaborate on..."] I'm interested to see how my background in [insert 1-2 highly specific technical skills tailored to the job, do NOT use broad abstractions like 'general system problem-solving'] could help get this across the finish line.<br><br>
   Best,<br><br>
   ${profile.name}
3. Structure the resume and cover letter strictly in valid, clean HTML. 
4. Use semantic HTML structure. Crucially: DO NOT style the font family, just use inline styles for basic layout like margins, borders, or font weights so that it prints nicely. Ensure there is adequate padding.
5. Output strict JSON with exactly two string properties: "resumeHtml" and "coverLetterHtml". Do not output markdown fencing (\`\`\`json). Just the raw JSON object string.
`;

  const llm = new ChatGoogleGenerativeAI({
    model,
    apiKey,
    temperature: 0.4,
  });

  try {
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage("Please generate the JSON response tailored to the job description."),
    ];

    const response = await llm.invoke(messages);
    const text = typeof response.content === "string" 
      ? response.content.trim() 
      : response.content.map(p => "text" in p ? p.text : "").join("").trim();
      
    // Gemini sometimes wraps the JSON in markdown fences or prose; take the outermost object.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let result: { resumeHtml?: unknown; coverLetterHtml?: unknown };
    try {
      result = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
    } catch {
      return NextResponse.json({ error: "The AI response was not valid JSON. Please try again." }, { status: 502 });
    }

    return NextResponse.json({
      resumeHtml: typeof result.resumeHtml === "string" ? result.resumeHtml : "",
      coverLetterHtml: typeof result.coverLetterHtml === "string" ? result.coverLetterHtml : "",
    });
  } catch (error) {
    console.error("[generate-documents] failed", error);
    return NextResponse.json({ error: "Failed to generate documents. Please try again." }, { status: 500 });
  }
}
