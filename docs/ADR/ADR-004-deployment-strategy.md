# ADR-004: Deployment Strategy

- Status: Accepted
- Decision: Deploy to free cloud using Vercel Hobby + Supabase Free, targeting Rp0/month for a personal MVP.

## Context
The application is personal-use and should avoid recurring infrastructure cost. The system must not require a VPS, always-on worker, Redis, or production 9Router.

## Decision details
- GitHub: source control and deployment trigger.
- Vercel Hobby: Next.js application, Route Handlers, Server Actions, and preview deployments. Hobby eligibility is personal/non-commercial; re-evaluate if the use becomes commercial.
- Supabase Free: PostgreSQL, Auth, RLS, Storage, Queues/pgmq if suitable, and Edge Functions.
- OpenRouter: external AI gateway; use free model variants where available and within limits.
- Strava: OAuth and webhook integration.
- Docker Compose: optional local development only.
- No Redis or always-on worker in MVP.

## Background processing (Reconciled `DEC-04`, 2026-11-24)
- Webhook handlers validate `subscription_id`/`owner_id`, enqueue minimal `sync_jobs`, and return `200 OK` within 2 seconds.
- **Single TypeScript runtime:** Queue worker logic runs in Next.js (`server/jobs/sync-worker.ts`) rather than duplicating Node.js and Deno Edge Function codebases.
- **Verified baseline triggers:** User-triggered `Sync Now` plus Vercel Hobby daily Cron (1x/day with jitter, max 300s function duration, authenticated via `CRON_SECRET`).
- **Explicit non-guarantees & Milestone 3 spike:** Official Supabase docs confirm `pg_cron` and `pg_net` are available on Supabase Free, though free projects pause after 7 days of inactivity (halting `pg_cron`). Next.js `after()` is **not** a durable queue or guaranteed background execution mechanism. Validating a sub-daily `pg_cron`+`pg_net` trigger against measurable concurrency, lease-recovery, and end-to-end free-tier criteria is deferred to a Milestone 3 spike; if unproven, MVP operates strictly on Webhook-Enqueue + 1x/Day Vercel Cron + Manual `Sync Now`.

## Consequences
- Low operational overhead, single TypeScript codebase, and a realistic zero-cost starting point.
- Free quotas (Vercel Hobby 100 GB transfer, 1x/day cron, personal/non-commercial; Supabase Free 500 MB DB, 5 GB egress, 7-day inactivity pause) constrain background automation and DB stream storage.
- No guarantee of permanent free usage or unlimited AI inference.
- Design for graceful degradation, manual recovery after inactivity pauses, data export, and later migration to paid tiers/worker infrastructure.
