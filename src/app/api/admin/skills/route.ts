import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invalidatePortfolioCache } from "@/lib/portfolio-cache";

type SkillBody = {
  id?: number;
  name?: string;
  categoryId?: number;
  justifications?: string[];
};

function normalizeJustifications(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [skills, categories] = await Promise.all([
    prisma.techStack.findMany({
      include: { category: true },
      orderBy: [{ categoryId: "asc" }, { category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ skills, categories });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as SkillBody;
  const name = body.name?.trim();
  const categoryId = Number(body.categoryId);
  if (!name || !categoryId) return NextResponse.json({ error: "name and categoryId are required" }, { status: 400 });

  await prisma.techStack.create({
    data: {
      name,
      categoryId,
      description: null,
      howIUseIt: null,
      technicalUse: normalizeJustifications(body.justifications).join("\n") || null,
    },
  });
  await invalidatePortfolioCache({ skills: true });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as SkillBody;
  const id = Number(body.id);
  const name = body.name?.trim();
  const categoryId = Number(body.categoryId);
  if (!id || !name || !categoryId) return NextResponse.json({ error: "id, name and categoryId are required" }, { status: 400 });

  await prisma.techStack.update({
    where: { id },
    data: {
      name,
      categoryId,
      technicalUse: normalizeJustifications(body.justifications).join("\n") || null,
    },
  });
  await invalidatePortfolioCache({ skills: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await prisma.techStack.delete({ where: { id } });
  await invalidatePortfolioCache({ skills: true, projects: true, experiences: true });
  return NextResponse.json({ ok: true });
}
