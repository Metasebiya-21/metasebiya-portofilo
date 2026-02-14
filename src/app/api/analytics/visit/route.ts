import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = { path?: string; sessionId?: string };

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const path = body.path?.trim() || "/";
  const sessionId = body.sessionId?.trim() || "anonymous";

  try {
    await prisma.visitorEvent.create({
      data: {
        sessionId,
        path,
        ip: getClientIp(request),
        country: request.headers.get("x-vercel-ip-country"),
        city: request.headers.get("x-vercel-ip-city"),
        userAgent: request.headers.get("user-agent"),
      },
    });
  } catch {
    // Keep UX non-blocking when analytics insert fails.
  }

  return NextResponse.json({ ok: true });
}
