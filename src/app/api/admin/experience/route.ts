import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invalidatePortfolioCache } from "@/lib/portfolio-cache";
import { asStrings, nextSortOrder } from "@/lib/admin-api";

type ExperienceBody = {
  id?: number;
  title: string;
  role: string;
  period: string;
  bullets: string[];
  techStacks?: string[];
  visibleToPublic?: boolean;
};

function parseBody(raw: unknown): ExperienceBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  if (!title || !role) return null;
  return {
    id: typeof body.id === "number" ? body.id : undefined,
    title,
    role,
    period: typeof body.period === "string" ? body.period.trim() : "",
    bullets: asStrings(body.bullets).map((item) => item.trim()).filter(Boolean),
    techStacks: asStrings(body.techStacks),
    visibleToPublic: typeof body.visibleToPublic === "boolean" ? body.visibleToPublic : undefined,
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = parseBody(await request.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "title and role are required" }, { status: 400 });

  const techNames = (body.techStacks ?? []).map((name) => name.trim()).filter(Boolean);
  if (techNames.length) {
    await prisma.techStack.createMany({
      data: techNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const techRows = await prisma.techStack.findMany({
    where: { name: { in: techNames } },
    select: { id: true },
  });

  await prisma.experience.create({
    data: {
      title: body.title,
      role: body.role,
      period: body.period,
      bullets: body.bullets,
      visibleToPublic: body.visibleToPublic ?? true,
      sortOrder: await nextSortOrder("experience"),
      techStackLinks: {
        create: techRows.map((tech) => ({ techStackId: tech.id })),
      },
    },
  });
  await invalidatePortfolioCache({ experiences: true });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = parseBody(await request.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "title and role are required" }, { status: 400 });
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const techNames = (body.techStacks ?? []).map((name) => name.trim()).filter(Boolean);
  if (techNames.length) {
    await prisma.techStack.createMany({
      data: techNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const techRows = await prisma.techStack.findMany({
    where: { name: { in: techNames } },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.experience.update({
      where: { id: body.id },
      data: {
        title: body.title,
        role: body.role,
        period: body.period,
        bullets: body.bullets,
        visibleToPublic: body.visibleToPublic ?? true,
      },
    });

    await tx.experienceTech.deleteMany({ where: { experienceId: body.id } });
    if (techRows.length) {
      await tx.experienceTech.createMany({
        data: techRows.map((tech) => ({
          experienceId: body.id!,
          techStackId: tech.id,
        })),
        skipDuplicates: true,
      });
    }
  });
  await invalidatePortfolioCache({ experiences: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.experience.delete({ where: { id } });
  await invalidatePortfolioCache({ experiences: true });
  return NextResponse.json({ ok: true });
}
