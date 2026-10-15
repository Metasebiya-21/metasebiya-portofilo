import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invalidatePortfolioCache } from "@/lib/portfolio-cache";

type Body = {
  name: string;
  brandName: string;
  role: string;
  headline: string;
  location: string;
  email: string;
  linkedin: string;
  github?: string;
  website?: string;
  contactIntro: string;
  summary: string;
};

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = (await request.json().catch(() => null)) as Partial<Record<keyof Body, unknown>> | null;
  if (!raw || typeof raw !== "object") return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

  // Only accept known fields; spreading the raw body let clients change the row id or send unknown columns.
  const pick = (key: keyof Body) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");
  const data = {
    name: pick("name"),
    brandName: pick("brandName"),
    role: pick("role"),
    headline: pick("headline"),
    location: pick("location"),
    email: pick("email"),
    linkedin: pick("linkedin"),
    github: pick("github") || null,
    website: pick("website") || null,
    contactIntro: pick("contactIntro"),
    summary: pick("summary"),
  };
  if (!data.name || !data.email) {
    return NextResponse.json({ error: "name and email are required." }, { status: 400 });
  }

  await prisma.profile.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  await invalidatePortfolioCache({ profile: true });

  return NextResponse.json({ ok: true });
}
