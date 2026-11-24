# Free-Cloud Deployment Runbook
## Personal Running Coach

**Target:** Rp0/month MVP using Vercel Hobby + Supabase Free + OpenRouter free model variants.
**Important:** Free tier is quota-limited and subject to provider eligibility, terms, and change.

## 1. Production topology

- GitHub: source repository.
- Vercel Hobby: Next.js App Router deployment, HTTPS endpoints, bounded sync worker, and once-daily Cron.
- Supabase Free: PostgreSQL (including `sync_jobs` durable queue), Auth, RLS, Storage, optional `pg_cron`/`pg_net` (subject to M3 spike).
- OpenRouter: server-side AI gateway.
- Strava: OAuth and webhook integration.

No VPS, always-on worker, Redis, or 9Router production service is required for MVP.

## 2. Before deployment

- Confirm Vercel Hobby is eligible for the intended personal/non-commercial use.
- Review current Vercel usage limits and function runtime.
- Review Supabase Free database/storage/egress/Edge Function quotas and inactivity/pause policy.
- Confirm Strava API application access, OAuth callback requirements, webhook requirements, and rate limits.
- Confirm OpenRouter free model catalogue, model capabilities, and rate limits.
- Add no production secrets to Git.

## 3. Supabase setup

1. Create a Supabase project in a suitable region.
2. Apply SQL migrations using Supabase CLI.
3. Enable required extensions (`pg_cron`/`pg_net` only if validated by the Milestone 3 spike).
4. Configure Auth URL allowlist and redirect URLs.
5. Enable and test RLS for every user-owned table (and verify zero client policies on `strava_connection_tokens` and `oauth_states`).
6. Store server-only secrets safely; configure Vault/Cron header secret only if the Milestone 3 spike adopts `pg_cron` + `pg_net` dispatch.
7. Test database backup/export and data deletion workflow.

Do not assume a queue starts a worker automatically. The queue stores durable work; an explicit manual invocation or scheduler is required to process it.

## 4. Vercel setup

1. Push repository to GitHub.
2. Import repository into Vercel.
3. Configure build command and Node version according to the project.
4. Add production environment variables.
5. Deploy and verify auth callback URLs.
6. Confirm HTTPS and custom domain if used.
7. Test preview and production environment separation.

Vercel Hobby is intended for personal/non-commercial use. If the app becomes commercial, review eligibility and move to an appropriate plan.

## 5. Required environment variables

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_TOKEN_ENCRYPTION_KEY=
STRAVA_WEBHOOK_VERIFY_TOKEN=
STRAVA_WEBHOOK_SUBSCRIPTION_ID=

OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_FALLBACK_MODEL=
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=Personal Running Coach
AI_REQUEST_TIMEOUT_MS=20000
AI_MAX_REQUESTS_PER_DAY=
AI_MAX_TOKENS=

CRON_SECRET=
```

Only public Supabase URL/anon key and app URL may use `NEXT_PUBLIC_`. Never expose service role, Strava secret, token encryption key, webhook verify token/subscription ID, `CRON_SECRET`, or OpenRouter API key.

## 6. Strava OAuth and webhook setup

1. Register production callback URL in Strava app settings (requesting `activity:read_all` per `DEC-02`).
2. Use a separate Strava developer application for local/preview testing because Strava allows **only 1 active webhook subscription per Strava `client_id`**.
3. Configure webhook callback URL to the deployed Next.js Route Handler (`/api/webhooks/strava`) and record the returned `STRAVA_WEBHOOK_SUBSCRIPTION_ID`.
4. Store webhook verification token (`STRAVA_WEBHOOK_VERIFY_TOKEN`) and subscription ID server-side.
5. Validate `GET` hub challenge within Strava's **2-second** timeout, and validate `POST` `subscription_id` + `owner_id` before idempotent `sync_jobs` enqueue.

### Hybrid sync operations

- **Initial import:** user clicks Import Activities; create an import job and process summary pages in bounded batches (`per_page=50`). Persist cursor/progress and avoid eager high-resolution stream downloads.
- **Webhook:** validate and enqueue a minimal event job into `sync_jobs`, then return `200 OK` (< 2s).
- **Sync Now:** authenticated user action invokes bounded Next.js worker processing (`server/jobs/sync-worker.ts`) and incremental sync.
- **Retry:** user can retry failed jobs after error classification (`rate_limit`, `auth_required`, `transient_network`, `permanent`).
- **Scheduled reconciliation:** Vercel Hobby daily Cron (1x/day with jitter) calls `/api/cron/sync-reconcile` with `Authorization: Bearer <CRON_SECRET>` to drain pending jobs and catch missed events. Sub-daily `pg_cron` + `pg_net` triggering is evaluated in the Milestone 3 spike.

Respect 401 reauthorization, 429 `Retry-After`, token refresh with a 5-minute expiry buffer, idempotent upsert on `(user_id, provider, external_activity_id)`, and max 5 retry attempts (30s / 60s / 120s + exponential backoff).

## 7. Queue worker operation

- Claim jobs atomically via PostgreSQL `claim_sync_jobs` RPC (`FOR UPDATE SKIP LOCKED` + `lease_expires_at`).
- Process a bounded number of jobs/activities per invocation inside Next.js (single TypeScript runtime; no duplicate Deno worker code unless spike proves necessary).
- Persist progress after each page/batch.
- Retry transient errors with staged delays (`30s`, `60s`, `120s`) then bounded exponential backoff with jitter.
- Mark exhausted jobs `failed` (dead-letter) and expose manual retry.
- Keep handlers idempotent.

**Supabase Free Inactivity Pause Recovery:** Free Supabase projects pause after 7 days of inactivity, which stops `pg_cron` and causes webhook DB inserts to fail. If paused during travel or rest weeks, restore the project in the Supabase Dashboard, verify Strava webhook subscription status (`GET /push_subscriptions`), and run `Sync Now` to reconcile missed runs.

## 8. Scheduling policy

Core correctness must not depend on high-frequency scheduled jobs. Use webhook enqueue + manual `Sync Now` + Vercel Hobby once-daily Cron as the verified baseline. Keep cron endpoints authenticated with `CRON_SECRET` and rate-limited. Any sub-daily `pg_cron` + `pg_net` schedule requires passing the Milestone 3 implementation spike.

## 9. OpenRouter setup

1. Create an OpenRouter account and API key.
2. Select a free model variant and test it against the AI Coach schema.
3. Add `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` to Vercel production environment.
4. Optionally add a separately tested fallback model.
5. Verify 429/rate-limit, timeout, provider unavailable, malformed JSON, and invalid evidence behavior.
6. Confirm the application never silently calls a paid model.

Do not hard-code a model ID as a permanent guarantee of free access.

## 10. Production smoke tests

- [ ] Sign up/sign in/sign out and session refresh.
- [ ] RLS prevents cross-user access.
- [ ] Strava OAuth state validation and token encryption.
- [ ] Webhook validation and idempotent enqueue.
- [ ] Sync Now drains a bounded batch.
- [ ] 401, 429, timeout, and retry behavior.
- [ ] OpenRouter API key is server-only.
- [ ] Selected free model returns valid output or graceful error.
- [ ] No automatic paid-model fallback.
- [ ] AI recommendation cannot modify plan without approval.
- [ ] Data export/delete works.
- [ ] Quota and database usage monitoring is enabled.

## 11. Degradation and migration

If OpenRouter free quota is exhausted, AI Coach should show a clear temporary unavailable state while analytics, calendar, and training rules continue to work. Do not automatically incur paid inference.

If Supabase/Vercel quotas are reached, reduce optional sync/AI work, preserve queued jobs, and communicate delayed processing. If usage grows, evaluate paid tiers or a dedicated worker as a separate architecture decision.

## 12. Official references

- Vercel Hobby: https://vercel.com/docs/plans/hobby
- Vercel limits: https://vercel.com/docs/limits
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase Queues: https://supabase.com/docs/guides/queues
- Supabase Edge Function limits: https://supabase.com/docs/guides/functions/limits
- Supabase scheduled functions: https://supabase.com/docs/guides/functions/schedule-functions
- OpenRouter developer platform: https://openrouter.ai/developers
- OpenRouter free models: https://openrouter.ai/collections/free-models/
