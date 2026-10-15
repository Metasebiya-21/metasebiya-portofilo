import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Body = {
  projectId?: number;
  projectTitle?: string;
  projectLink?: string;
  sessionId?: string;
};

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await rateLimit(`click:${ip}`, 30, 60))) return NextResponse.json({ ok: true });

  const body = (await request.json().catch(() => ({}))) as Body;
  const projectTitle = text(body.projectTitle, 200);
  const sessionId = text(body.sessionId, 64) || "anonymous";
  const projectId = Number.isInteger(body.projectId) && Number(body.projectId) > 0 ? Number(body.projectId) : null;

  if (!projectTitle) {
    return NextResponse.json({ error: "projectTitle is required." }, { status: 400 });
  }

  try {
    await prisma.projectClick.create({
      data: {
        projectId,
        projectTitle,
        projectLink: text(body.projectLink, 500) || null,
        sessionId,
        ip,
        country: request.headers.get("x-vercel-ip-country"),
      },
    });
  } catch {
    // Keep UX non-blocking when analytics insert fails.
  }

  return NextResponse.json({ ok: true });
}
