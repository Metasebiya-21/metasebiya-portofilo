import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const clearAll = request.nextUrl.searchParams.get("all") === "1";

  if (clearAll) {
    await prisma.chatMessage.deleteMany({
      where: { role: "user" },
    });
    return NextResponse.json({ ok: true });
  }

  if (!id) {
    return NextResponse.json({ error: "id is required, or pass all=1" }, { status: 400 });
  }

  const deleted = await prisma.chatMessage.deleteMany({
    where: { id, role: "user" },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
