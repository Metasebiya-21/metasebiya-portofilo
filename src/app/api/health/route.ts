import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCacheClient } from "@/lib/cache";

export async function GET() {
  const startedAt = Date.now();

  let database = "down";
  let cache = "down";
  let cacheProvider = "none";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch {
    database = "down";
  }

  try {
    const client = getCacheClient();
    if (!client) {
      cache = "not_configured";
    } else {
      cacheProvider = client.provider;
      await client.ping();
      cache = "up";
    }
  } catch {
    cache = "down";
  }

  const status = database === "up" ? 200 : 503;

  return NextResponse.json(
    {
      status: status === 200 ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: { database, cache, cacheProvider },
      latencyMs: Date.now() - startedAt,
    },
    { status },
  );
}
