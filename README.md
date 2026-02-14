This is a personal portfolio built with [Next.js](https://nextjs.org), including:
- Config-driven content in `src/content/*`
- Contact form (mailto draft)
- LangChain + Gemini-powered chatbot for visitor Q&A on every page
- Postgres persistence (profile, experiences, projects, chat messages)
- Pluggable cache layer (Redis locally, Cloudflare KV in cloud)
- Admin dashboard for analytics and content management
- SEO-ready metadata + Open Graph image + sitemap + robots
- Health endpoint for uptime monitoring (`/api/health`)

## Getting Started

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env.local
```

3. Configure `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio?schema=public
REDIS_URL=redis://localhost:6379
# Optional for Supabase deployments (use as DATABASE_URL or copy value into DATABASE_URL)
SUPABASE_DATABASE_URL=
# Optional for Cloudflare KV cache
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_KV_NAMESPACE_ID=
CLOUDFLARE_API_TOKEN=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=change_me
ADMIN_SESSION_TOKEN=replace_with_long_random_secret
```

4. Prepare database:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

Or run all at once:

```bash
npm run db:setup
```

Or fully automated with `.env.local` loading included:

```bash
npm run db:auto
```

`db:auto` now auto-generates `ADMIN_SESSION_TOKEN` (once) if missing, then runs setup.

If your local DB drifted and needs a clean reset:

```bash
npm run db:auto:reset
```

`db:setup` is safe to re-run. Seed is idempotent and skips when data already exists.

Docker startup behavior:
- If `prisma/migrations` exists, container runs `prisma migrate deploy`.
- If no migrations exist yet, container runs `prisma db push`.
- Then it runs seed (idempotent) and starts Next.js.

5. Initialize or reset admin credentials (stored in DB as salted hash):

```bash
npm run admin:reset-password -- --email admin@example.com --password "YourStrongPassword"
```

If `--password` is omitted, a secure password is generated and printed.

Generate a stable admin session signing secret into `.env.local`:

```bash
npm run admin:generate-session-secret
```

Rotate it explicitly:

```bash
npm run admin:generate-session-secret -- --force
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Chatbot

- Global floating UI: `src/components/FloatingChatbot.tsx`
- API route: `src/app/api/chat/route.ts`
- LangChain model: `@langchain/google-genai` (`ChatGoogleGenerativeAI`)
- Persistent memory source: Postgres (`ChatSession` + `ChatMessage`)
- Cache layer: Cloudflare KV (preferred on Cloudflare) or Redis fallback

If `GEMINI_API_KEY` is missing, the chatbot route returns a clear error.

## Cloudflare + Supabase Deployment

- Database: set `DATABASE_URL` to your Supabase Postgres connection string.
- Cache: set `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_KV_NAMESPACE_ID`, `CLOUDFLARE_API_TOKEN`.
- If Cloudflare KV vars are present, app uses KV cache automatically.
- If KV vars are missing but `REDIS_URL` exists, app uses Redis.

## SEO + Performance

- Canonical metadata and social previews are configured in `src/app/layout.tsx`
- Dynamic Open Graph image: `src/app/opengraph-image.tsx`
- Sitemap: `src/app/sitemap.ts`
- Robots policy: `src/app/robots.ts`
- Structured data (JSON-LD Person schema) is injected in `layout.tsx`

## Admin

- Login page: `/admin/login`
- Dashboard: `/admin`
- Content management: `/admin/content`
- Project management: `/admin/projects`

The dashboard includes:
- visitor count and origin (country + IP)
- project click analytics
- recent chatbot questions

Admin authentication notes:
- Credentials are stored in Postgres table `AdminUser` (hashed + salted).
- Seed always ensures one active superadmin exists using `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (fallback: `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- `ADMIN_SESSION_TOKEN` (or `ADMIN_SESSION_SECRET`) is required to sign admin session cookies. Use `npm run admin:generate-session-secret` once and keep it stable.

## Production

Use the production runbook:

- `docs/PRODUCTION_READINESS.md`
- `docs/CLOUDFLARE_SUPABASE_SETUP.md`

It covers:
- custom domain and DNS
- SSL/TLS
- uptime monitoring with `/api/health`
- error tracking and alerting
- backup and rollback checklist
