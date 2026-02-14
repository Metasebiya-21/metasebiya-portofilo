# Production Readiness Runbook

## 1. Domain and DNS

1. Buy/use a custom domain (for example `metasebiya.dev`).
2. Point DNS to your hosting provider:
   - Vercel: add A/CNAME records shown in project settings.
   - VM/container: point A record to load balancer/public IP.
3. Set canonical site URL in profile content (`src/content/profile.ts` `website`).

## 2. SSL/TLS

1. Enable HTTPS certificate at platform level.
2. Enforce HTTPS redirects.
3. Enable HSTS after verifying stable HTTPS.

## 3. Environment and Secrets

Required:

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `ADMIN_SESSION_TOKEN` (or `ADMIN_SESSION_SECRET`)
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`

Cache (one option):

- Cloudflare KV:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_KV_NAMESPACE_ID`
  - `CLOUDFLARE_API_TOKEN`
- or Redis:
  - `REDIS_URL`

Recommendations:

1. Store secrets in provider secret manager (not committed files).
2. Rotate keys quarterly or after incidents.
3. Use separate secrets per environment (`dev/staging/prod`).

## 4. Database and Migrations

1. Take a backup before each production migration.
2. Apply migrations using:

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

3. Validate key reads:
   - `/`
   - `/projects`
   - `/api/health`

## 5. Uptime Monitoring

Use external monitor (UptimeRobot, Better Stack, Pingdom) against:

- `GET /api/health`

Healthy response target:
- HTTP `200`
- JSON `status: "ok"`

Alert on:
- 2+ consecutive failures
- latency above agreed SLO

## 6. Error Monitoring

Add one of:

- Sentry
- Better Stack Logs
- Datadog

Capture:
- server exceptions
- API route errors
- unhandled promise rejections

## 7. Performance Guardrails

1. Run Lighthouse on homepage/projects/contact.
2. Keep bundle growth in check (avoid heavy client-side libs).
3. Prefer server components for data-heavy rendering.
4. Keep media optimized (webp/avif, reasonable dimensions).

## 8. Security

1. Restrict admin routes with strong session secret.
2. Use strong random admin passwords.
3. Keep dependencies updated (monthly).
4. Add WAF/rate-limit at edge if high traffic.

## 9. Backups and Recovery

1. Daily PostgreSQL backup.
2. Retain backups for minimum 14 days.
3. Test restore monthly in staging.
4. Document RTO/RPO targets.

## 10. Deployment Checklist

1. Merge to main.
2. Build and deploy.
3. Apply migrations.
4. Hit smoke-test URLs:
   - `/`
   - `/projects`
   - `/contact`
   - `/api/health`
5. Verify admin login.
6. Verify chatbot response.
