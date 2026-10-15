import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSessionToken, isValidAdminLogin } from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const email = body.email?.trim() || "";
  const password = body.password?.trim() || "";

  const ip = getClientIp(request);
  const allowed =
    (await rateLimit(`login:ip:${ip}`, 10, 900)) && (await rateLimit(`login:email:${email.toLowerCase()}`, 5, 900));
  if (!allowed) {
    return NextResponse.json({ error: "Too many login attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const admin = await isValidAdminLogin(email, password);
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = createAdminSessionToken(admin.id);
  if (!token) return NextResponse.json({ error: "Failed to create admin session." }, { status: 500 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
