import { getRedisClient } from "@/lib/redis";

declare global {
  var rateLimitBuckets: Map<string, { count: number; resetAt: number }> | undefined;
}

export function getClientIp(request: Request) {
  const header = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0];
  return header?.trim() || "unknown";
}

/**
 * Fixed-window rate limiter. Uses Redis when available so limits are shared
 * across instances, otherwise falls back to per-process memory.
 * Returns true when the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
  const bucketKey = `rl:${key}:${windowId}`;

  const redis = getRedisClient();
  if (redis) {
    try {
      const count = await redis.incr(bucketKey);
      if (count === 1) await redis.expire(bucketKey, windowSeconds);
      return count <= limit;
    } catch {
      // Fall through to the in-memory limiter.
    }
  }

  const buckets = (globalThis.rateLimitBuckets ??= new Map());
  const now = Date.now();
  const bucket = buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    buckets.set(bucketKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
