import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invalidatePortfolioCache } from "@/lib/portfolio-cache";
import { asStrings, nextSortOrder } from "@/lib/admin-api";

type ProjectBody = {
  id?: number;
  title: string;
  category: string;
  summary: string;
  description?: string;
  images?: string[];
  tags: string[];
  link?: string;
  visibleToPublic?: boolean;
};

function parseBody(raw: unknown): ProjectBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  if (!title || !summary) return null;
  return {
    id: typeof body.id === "number" ? body.id : undefined,
    title,
    summary,
    category: typeof body.category === "string" ? body.category : "",
    description: typeof body.description === "string" ? body.description : undefined,
    images: asStrings(body.images).filter((url) => /^https?:\/\//i.test(url)),
    tags: asStrings(body.tags),
    link: typeof body.link === "string" && /^https?:\/\//i.test(body.link.trim()) ? body.link.trim() : undefined,
    visibleToPublic: typeof body.visibleToPublic === "boolean" ? body.visibleToPublic : undefined,
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = parseBody(await request.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "title and summary are required" }, { status: 400 });

  const categoryName = body.category?.trim() || "General";
  const category = await prisma.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });

  const techNames = body.tags.map((tag) => tag.trim()).filter(Boolean);
  if (techNames.length) {
    await prisma.techStack.createMany({
      data: techNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const techRows = await prisma.techStack.findMany({
    where: { name: { in: techNames } },
    select: { id: true, name: true },
  });

  await prisma.project.create({
    data: {
      title: body.title,
      categoryId: category.id,
      summary: body.summary,
      description: body.description?.trim() || null,
      images: body.images?.length ? body.images : [],
      link: body.link || null,
      visibleToPublic: body.visibleToPublic ?? true,
      sortOrder: await nextSortOrder("project"),
      techStackLinks: {
        create: techRows.map((tech) => ({ techStackId: tech.id })),
      },
    },
  });
  await invalidatePortfolioCache({ projects: true });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = parseBody(await request.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "title and summary are required" }, { status: 400 });
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const categoryName = body.category?.trim() || "General";
  const category = await prisma.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });

  const techNames = body.tags.map((tag) => tag.trim()).filter(Boolean);
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
    await tx.project.update({
      where: { id: body.id },
      data: {
        title: body.title,
        categoryId: category.id,
        summary: body.summary,
        description: body.description?.trim() || null,
        images: body.images?.length ? body.images : [],
        link: body.link || null,
        visibleToPublic: body.visibleToPublic ?? true,
      },
    });

    await tx.projectTech.deleteMany({ where: { projectId: body.id } });
    if (techRows.length) {
      await tx.projectTech.createMany({
        data: techRows.map((tech) => ({ projectId: body.id!, techStackId: tech.id })),
        skipDuplicates: true,
      });
    }
  });
  await invalidatePortfolioCache({ projects: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.project.delete({ where: { id } });
  await invalidatePortfolioCache({ projects: true });
  return NextResponse.json({ ok: true });
}
