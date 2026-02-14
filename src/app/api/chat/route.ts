import { NextResponse } from "next/server";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { experiences as fallbackExperiences } from "@/content/experience";
import { profile as fallbackProfile } from "@/content/profile";
import { projects as fallbackProjects } from "@/content/projects";
import { getCacheClient } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { getExperiencesData, getProfileData, getProjectsData, getSkillGroupsData } from "@/lib/portfolio-store";

export const runtime = "nodejs";

type ChatRequestBody = {
  message?: string;
  sessionId?: string;
};

type StoredMessage = {
  role: "user" | "assistant";
  content: string;
};

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const apiKey = process.env.GEMINI_API_KEY;
const MAX_MEMORY_MESSAGES = 20;
const CHAT_CACHE_TTL_SECONDS = 1800;

const getChatCacheKey = (sessionId: string) => `chat:session:${sessionId}:messages`;

async function loadSessionHistory(sessionId: string): Promise<StoredMessage[]> {
  const cache = getCacheClient();
  const cacheKey = getChatCacheKey(sessionId);

  if (cache) {
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as StoredMessage[];
      }
    } catch {
      // Fall back to database memory.
    }
  }

  const rows = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: MAX_MEMORY_MESSAGES,
  });

  const history = rows
    .reverse()
    .map((row) => ({ role: row.role as StoredMessage["role"], content: row.content }));

  if (cache) {
    try {
      await cache.set(cacheKey, JSON.stringify(history), CHAT_CACHE_TTL_SECONDS);
    } catch {
      // Ignore cache write errors.
    }
  }

  return history;
}

async function cacheSessionHistory(sessionId: string, history: StoredMessage[]) {
  const trimmed = history.slice(-MAX_MEMORY_MESSAGES);
  const cache = getCacheClient();
  if (cache) {
    try {
      await cache.set(getChatCacheKey(sessionId), JSON.stringify(trimmed), CHAT_CACHE_TTL_SECONDS);
    } catch {
      // Ignore cache write errors.
    }
  }
}

type SkillGroup = {
  label: string;
  skills: string[];
};

function buildSystemPrompt(
  profile: typeof fallbackProfile,
  experiences: typeof fallbackExperiences,
  projects: typeof fallbackProjects,
  skillGroups: SkillGroup[],
) {
  const portfolioContext = `
Name: ${profile.name}
Role: ${profile.role}
Headline: ${profile.headline}
Location: ${profile.location}
Email: ${profile.email}
LinkedIn: ${profile.linkedin}
GitHub: ${profile.github}
Summary: ${profile.summary}
Highlights: ${profile.highlights.join(" | ")}
About Skills: ${skillGroups.map((group) => `${group.label}: ${group.skills.join(", ")}`).join(" | ")}
Experience: ${experiences.map((exp) => `${exp.title} - ${exp.role} (${exp.period}) [${("techStacks" in exp ? exp.techStacks.join(", ") : "")}]: ${exp.bullets.join("; ")}`).join(" | ")}
Projects: ${projects.map((project) => `${project.title} (${("category" in project ? project.category : "General")}) [${project.tags.join(", ")}]: ${project.summary}`).join(" | ")}
`.trim();

  return `
You are Metasebiya's portfolio assistant chatbot.
Your job is to help visitors understand Metasebiya's background, projects, skills, and how to contact him.
Answer clearly, be concise, and use only the information provided in the context.
If asked about something unavailable in context, say you do not have that detail and suggest contacting Metasebiya at ${profile.email}.
Do not fabricate achievements, companies, dates, or links.

Context:
${portfolioContext}
`.trim();
}

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY. Add it to your environment variables." },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const [profile, experiences, projects, skillGroups] = await Promise.all([
    getProfileData(),
    getExperiencesData(),
    getProjectsData(),
    getSkillGroupsData(),
  ]);
  const systemPrompt = buildSystemPrompt(profile, experiences, projects, skillGroups);

  const llm = new ChatGoogleGenerativeAI({
    model,
    apiKey,
    temperature: 0.4,
  });

  try {
    const history = await loadSessionHistory(sessionId);
    const messages = [
      new SystemMessage(systemPrompt),
      ...history.map((entry) =>
        entry.role === "assistant" ? new AIMessage(entry.content) : new HumanMessage(entry.content),
      ),
      new HumanMessage(message),
    ];

    const response = await llm.invoke(messages);
    const text =
      typeof response.content === "string"
        ? response.content.trim()
        : response.content
            .map((part) => ("text" in part ? part.text : ""))
            .join("")
            .trim();
    const reply = text || "I could not generate a response. Please try again.";

    await prisma.$transaction(async (tx) => {
      await tx.chatSession.upsert({
        where: { id: sessionId },
        update: {},
        create: { id: sessionId },
      });

      await tx.chatMessage.createMany({
        data: [
          { sessionId, role: "user", content: message },
          { sessionId, role: "assistant", content: reply },
        ],
      });
    });

    await cacheSessionHistory(sessionId, [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);

    return NextResponse.json({ reply });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown LangChain/Gemini error.";
    if (detail.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        { error: "Invalid GEMINI_API_KEY. Update it in .env.local and restart the Next.js container." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: `Failed to generate response: ${detail}` }, { status: 500 });
  }
}
