import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { invalidatePortfolioCache } from "@/lib/portfolio-cache";

type CategoryBody = {
  id?: number;
  name?: string;
};

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true, techStacks: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as CategoryBody;
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  await invalidatePortfolioCache({ projects: true, skills: true });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as CategoryBody;
  const id = Number(body.id);
  const name = body.name?.trim();
  if (!id || !name) return NextResponse.json({ error: "id and name are required" }, { status: 400 });

  await prisma.category.update({
    where: { id },
    data: { name },
  });

  await invalidatePortfolioCache({ projects: true, skills: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const [projectUseCount, skillUseCount] = await Promise.all([
    prisma.project.count({ where: { categoryId: id } }),
    prisma.techStack.count({ where: { categoryId: id } }),
  ]);

  if (projectUseCount > 0 || skillUseCount > 0) {
    return NextResponse.json({ error: "Category is assigned to projects or skills. Reassign them first." }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  await invalidatePortfolioCache({ projects: true, skills: true });
  return NextResponse.json({ ok: true });
}
