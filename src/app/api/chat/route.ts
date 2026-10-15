import { NextResponse } from "next/server";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { experiences as fallbackExperiences } from "@/content/experience";
import { profile as fallbackProfile } from "@/content/profile";
import { projects as fallbackProjects } from "@/content/projects";
import { getCacheClient } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
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
const MAX_MESSAGE_CHARS = 1000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
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

  let rows: { role: string; content: string }[] = [];
  try {
    rows = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: MAX_MEMORY_MESSAGES,
    });
  } catch {
    // Chat still works without stored memory when the database is unavailable.
    return [];
  }

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
      { error: "The assistant is not configured yet. Please use the contact page instead." },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: `Please keep messages under ${MAX_MESSAGE_CHARS} characters.` }, { status: 413 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.json({ error: "Invalid sessionId." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const allowed = (await rateLimit(`chat:ip:${ip}`, 10, 60)) && (await rateLimit(`chat:day:${ip}`, 200, 86_400));
  if (!allowed) {
    return NextResponse.json({ error: "Too many messages. Please wait a minute and try again." }, { status: 429 });
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
    maxOutputTokens: 1024,
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

    try {
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
    } catch (error) {
      // Persisting is best-effort; still return the reply the visitor asked for.
      console.error("[chat] failed to persist messages", error);
    }

    await cacheSessionHistory(sessionId, [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[chat] failed to generate response", error);
    return NextResponse.json({ error: "The assistant is unavailable right now. Please try again later." }, { status: 500 });
  }
}
