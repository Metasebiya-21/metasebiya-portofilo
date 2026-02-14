import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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

  const body = (await request.json()) as Body;
  await prisma.profile.upsert({
    where: { id: 1 },
    update: { ...body },
    create: { id: 1, ...body },
  });

  return NextResponse.json({ ok: true });
}
