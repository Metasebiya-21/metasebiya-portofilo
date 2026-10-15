import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const ADMIN_COOKIE_NAME = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const DUMMY_PASSWORD_HASH = "00".repeat(64);
const DUMMY_PASSWORD_SALT = "00".repeat(16);

declare global {
  var adminSessionSecret: string | undefined;
}

function getAdminSessionSecret() {
  const configured = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_SESSION_SECRET;
  if (configured) return configured;

  // Each serverless instance would generate its own secret, so admin sessions must
  // fail closed in production rather than sign with an ephemeral one.
  if (process.env.NODE_ENV === "production") {
    console.error("ADMIN_SESSION_TOKEN/ADMIN_SESSION_SECRET is not set; admin login is disabled.");
    return null;
  }

  if (!globalThis.adminSessionSecret) {
    globalThis.adminSessionSecret = randomBytes(48).toString("base64url");
    console.warn(
      "ADMIN_SESSION_TOKEN/ADMIN_SESSION_SECRET missing. Generated ephemeral runtime secret for this process.",
    );
  }

  return globalThis.adminSessionSecret;
}

function createSignature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminSessionToken(adminUserId: number) {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${adminUserId}.${expiresAt}`;
  const signature = createSignature(payload, secret);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function validateAdminSessionToken(token: string) {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  let decoded = "";
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const [userIdRaw, expiresAtRaw, signature] = decoded.split(".");
  if (!userIdRaw || !expiresAtRaw || !signature) return null;

  const payload = `${userIdRaw}.${expiresAtRaw}`;
  const expected = createSignature(payload, secret);
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  const userId = Number.parseInt(userIdRaw, 10);
  const expiresAt = Number.parseInt(expiresAtRaw, 10);
  if (!Number.isFinite(userId) || !Number.isFinite(expiresAt)) return null;
  if (expiresAt < Math.floor(Date.now() / 1000)) return null;
  return userId;
}

export async function isValidAdminLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password.trim()) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  // Always run scrypt so response time does not reveal whether the email exists.
  const isValid = await verifyPassword(
    password,
    admin?.passwordHash ?? DUMMY_PASSWORD_HASH,
    admin?.passwordSalt ?? DUMMY_PASSWORD_SALT,
  );
  if (!admin || !admin.isActive || !admin.isSuperAdmin || !isValid) return null;
  return admin;
}

async function getAuthorizedAdminFromToken(token: string) {
  const userId = validateAdminSessionToken(token);
  if (!userId) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, isSuperAdmin: true },
  });

  if (!admin || !admin.isActive || !admin.isSuperAdmin) return null;
  return admin;
}

export async function requireAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const admin = token ? await getAuthorizedAdminFromToken(token) : null;
  if (!admin) {
    redirect("/admin/login");
  }
}

export async function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return !!(await getAuthorizedAdminFromToken(token));
}
