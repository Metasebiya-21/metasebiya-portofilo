# Cloudflare + Supabase Setup

## Goal

Deploy the portfolio on Cloudflare with:

- Supabase Postgres as primary database
- Cloudflare KV as cache backend

## 1. Supabase

1. Create a Supabase project.
2. Copy the Postgres connection string.
3. Set environment variable:

```env
DATABASE_URL=postgresql://...
```

You can also set `SUPABASE_DATABASE_URL`; runtime falls back to it if `DATABASE_URL` is missing.

## 2. Cloudflare KV

1. Create a KV namespace.
2. Create API Token with KV read/write permission for that namespace.
3. Set environment variables:

```env
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_KV_NAMESPACE_ID=...
CLOUDFLARE_API_TOKEN=...
```

The app auto-selects cache backend in this order:
1. Cloudflare KV
2. Redis (`REDIS_URL`)
3. No external cache

## 3. Other required env vars

```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
SUPERADMIN_EMAIL=...
SUPERADMIN_PASSWORD=...
ADMIN_SESSION_TOKEN=...
```

## 4. Health check

After deployment, call:

```bash
GET /api/health
```

Expected JSON includes:

- `checks.database` (`up`)
- `checks.cache` (`up` when KV is connected)
- `checks.cacheProvider` (`cloudflare-kv`)
