import Redis from "ioredis";

type CacheClient = {
  provider: "redis" | "cloudflare-kv";
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttlSeconds: number) => Promise<void>;
  del: (...keys: string[]) => Promise<void>;
  ping: () => Promise<void>;
};

declare global {
  var appCacheClient: CacheClient | null | undefined;
}

function getRedisCacheClient(): CacheClient | null {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    commandTimeout: 1000,
    connectTimeout: 1000,
    lazyConnect: true,
    enableReadyCheck: true,
  });
  redis.on("error", () => {
    // Ignore noisy runtime redis errors and let callers fall back.
  });

  return {
    provider: "redis",
    get: async (key) => redis.get(key),
    set: async (key, value, ttlSeconds) => {
      await redis.set(key, value, "EX", ttlSeconds);
    },
    del: async (...keys) => {
      if (!keys.length) return;
      await redis.del(...keys);
    },
    ping: async () => {
      await redis.ping();
    },
  };
}

function getCloudflareKvCacheClient(): CacheClient | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) return null;

  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values`;

  const request = async (method: "GET" | "PUT" | "DELETE", key: string, value?: string, ttlSeconds?: number) => {
    const encodedKey = encodeURIComponent(key);
    const ttlQuery = ttlSeconds ? `?expiration_ttl=${ttlSeconds}` : "";
    const response = await fetch(`${baseUrl}/${encodedKey}${ttlQuery}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        ...(method === "PUT" ? { "Content-Type": "text/plain; charset=utf-8" } : {}),
      },
      body: method === "PUT" ? value : undefined,
      cache: "no-store",
    });

    if (method === "GET" && response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Cloudflare KV request failed (${method} ${response.status})`);
    }
    if (method === "GET") return response.text();
    return null;
  };

  return {
    provider: "cloudflare-kv",
    get: async (key) => request("GET", key),
    set: async (key, value, ttlSeconds) => {
      await request("PUT", key, value, ttlSeconds);
    },
    del: async (...keys) => {
      await Promise.all(keys.map((key) => request("DELETE", key)));
    },
    ping: async () => {
      // GET on a non-existent key validates auth + namespace access.
      await request("GET", "__portfolio_healthcheck__");
    },
  };
}

export function getCacheClient(): CacheClient | null {
  if (globalThis.appCacheClient !== undefined) return globalThis.appCacheClient;

  const client = getCloudflareKvCacheClient() ?? getRedisCacheClient();
  globalThis.appCacheClient = client;
  return client;
}
