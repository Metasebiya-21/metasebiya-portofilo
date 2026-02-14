import Redis from "ioredis";

declare global {
  var redisClient: Redis | null | undefined;
}

export function getRedisClient() {
  if (globalThis.redisClient !== undefined) return globalThis.redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    globalThis.redisClient = null;
    return null;
  }

  globalThis.redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    commandTimeout: 1000,
    connectTimeout: 1000,
    lazyConnect: true,
    enableReadyCheck: true,
  });
  globalThis.redisClient.on("error", () => {
    // Ignore noisy runtime redis errors and let callers fall back.
  });

  return globalThis.redisClient;
}
