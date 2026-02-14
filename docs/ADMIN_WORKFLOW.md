# Admin Workflow (Step-by-Step)

This document explains how the portfolio app works end-to-end: setup, admin auth, content management, visibility, and public rendering.

## 1. Prerequisites

- Docker + Docker Compose installed
- `.env.local` exists (copy from `.env.example`)

Minimum important env values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio?schema=public
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=...
SUPERADMIN_EMAIL=...
SUPERADMIN_PASSWORD=...
ADMIN_SESSION_TOKEN=...
```

## 2. One-Command Startup

Run:

```bash
docker compose up --build -d && docker compose watch
```

What happens:

1. Postgres and Redis start.
2. Next.js container starts.
3. Prisma client is generated.
4. Schema is synced (`prisma db push`) in dev startup flow.
5. Seed runs (idempotent).
6. Dev server starts on `http://localhost:3000`.

## 3. Superadmin Bootstrap

Superadmin account is ensured during seed:

- Uses `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`
- Fallbacks: `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Stored in DB table `AdminUser`
- Password stored hashed + salted
- Must be `isSuperAdmin=true` and `isActive=true`

## 4. Admin Login Flow

Path: `/admin/login`

1. You submit email/password.
2. API route checks DB user.
3. Password is verified against hash+salt.
4. On success, backend creates signed session cookie:
   - cookie: `portfolio_admin_session`
   - signature uses `ADMIN_SESSION_TOKEN` (or `ADMIN_SESSION_SECRET`)
5. Protected admin pages/API validate:
   - token signature
   - user exists
   - `isSuperAdmin=true`
   - `isActive=true`

## 5. Reset Admin Password

Inside running container:

```bash
docker exec -it portfolio-nextjs npm run admin:reset-password -- --email you@example.com --password "NewStrongPassword"
```

If you omit `--password`, a secure password is generated.

## 6. Content Management in Admin

### Profile

- Page: `/admin/content`
- Save profile data via `PUT /api/admin/profile`

### Experiences

- Page: `/admin/content`
- Add/Edit/Delete via:
  - `POST /api/admin/experience`
  - `PUT /api/admin/experience`
  - `DELETE /api/admin/experience?id=...`
- Supports `visibleToPublic`
- UI includes pagination and edit forms

### Projects

- Page: `/admin/projects`
- Add/Edit/Delete via:
  - `POST /api/admin/projects`
  - `PUT /api/admin/projects`
  - `DELETE /api/admin/projects?id=...`
- Supports category, tags, link, `visibleToPublic`
- UI includes pagination and edit forms

## 7. Visibility to Public

Both `Project` and `Experience` have `visibleToPublic`.

- `true`: item can appear on public pages
- `false`: hidden from public pages

Public data readers filter by `visibleToPublic=true` before rendering.

## 8. Data Flow to Public Pages

Public pages:

- Home: `/`
- Projects: `/projects`
- Experience: `/experience`

All use `src/lib/portfolio-store.ts`:

1. Try Redis cache
2. Query Postgres via Prisma
3. Apply visibility filters
4. Return to page components

Cache invalidation is triggered after admin mutations for projects/experiences so changes become visible quickly.

## 9. Troubleshooting

### A) Login says missing session token

Ensure one of these is set in `.env.local`:

- `ADMIN_SESSION_TOKEN`
- `ADMIN_SESSION_SECRET`

Then rebuild/restart:

```bash
docker compose up -d --build
```

### B) Admin login fails with network error

Check container status:

```bash
docker ps
```

Confirm `portfolio-nextjs` is running and mapped to port `3000`.

### C) Content does not appear publicly

Check item flags in admin:

- Project/Experience must be `visibleToPublic=true`

### D) Need clean local reset

```bash
npm run db:auto:reset
```

## 10. Key Files

- Auth: `src/lib/admin-auth.ts`
- Admin login API: `src/app/api/admin/login/route.ts`
- Admin project API: `src/app/api/admin/projects/route.ts`
- Admin experience API: `src/app/api/admin/experience/route.ts`
- Public store/cache: `src/lib/portfolio-store.ts`
- Cache invalidation: `src/lib/portfolio-cache.ts`
- Prisma schema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts`
