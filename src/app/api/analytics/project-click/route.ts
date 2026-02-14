import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  projectId?: number;
  projectTitle?: string;
  projectLink?: string;
  sessionId?: string;
};

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const projectTitle = body.projectTitle?.trim();
  const sessionId = body.sessionId?.trim() || "anonymous";

  if (!projectTitle) {
    return NextResponse.json({ error: "projectTitle is required." }, { status: 400 });
  }

  try {
    await prisma.projectClick.create({
      data: {
        projectId: body.projectId || null,
        projectTitle,
        projectLink: body.projectLink || null,
        sessionId,
        ip: getClientIp(request),
        country: request.headers.get("x-vercel-ip-country"),
      },
    });
  } catch {
    // Keep UX non-blocking when analytics insert fails.
  }

  return NextResponse.json({ ok: true });
}
