import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Body = { path?: string; sessionId?: string };

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!(await rateLimit(`visit:${ip}`, 60, 60))) return NextResponse.json({ ok: true });

  const body = (await request.json().catch(() => ({}))) as Body;
  const path = text(body.path, 200) || "/";
  const sessionId = text(body.sessionId, 64) || "anonymous";

  try {
    await prisma.visitorEvent.create({
      data: {
        sessionId,
        path,
        ip,
        country: request.headers.get("x-vercel-ip-country"),
        city: request.headers.get("x-vercel-ip-city"),
        userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });
  } catch {
    // Keep UX non-blocking when analytics insert fails.
  }

  return NextResponse.json({ ok: true });
}
