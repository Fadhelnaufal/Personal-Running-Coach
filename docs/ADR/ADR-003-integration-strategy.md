# ADR-003: External Integration Strategy

- Status: Accepted
- Decision: Strava is the primary activity source; OpenRouter is the primary AI gateway.

## Strava
- OAuth2 with `activity:read_all` scope (`DEC-02`, clearly disclosed to the user) and AES-256-GCM server-side token encryption in isolated `strava_connection_tokens`.
- Idempotent historical import and incremental sync (`UNIQUE (user_id, provider, external_activity_id)`).
- Hybrid synchronization: webhook event capture (`< 2s` response, validating `subscription_id` and `owner_id`) + durable `sync_jobs` queue + Next.js bounded worker (`server/jobs/sync-worker.ts`).
- Initial import is explicitly user-triggered and paginated (baseline `per_page=50`, summaries first; lazy streams).
- Manual `Sync Now` plus Vercel Hobby 1x/day Cron form the guaranteed trigger baseline; sub-daily background triggering (`pg_cron`+`pg_net`) is isolated as a Milestone 3 implementation spike (`DEC-04`) and Next.js `after()` is not treated as durable execution.
- Handle token refresh with a 5-minute buffer, 401 reauthorization, 429 `Retry-After`, max 5 retry attempts (`30s`, `60s`, `120s` + exponential backoff with jitter), and manual recovery.

## OpenRouter
- All production AI requests pass through a server-side provider adapter.
- Use the OpenAI-compatible API endpoint `https://openrouter.ai/api/v1`.
- Prioritize available free model variants; model ID is environment configuration and can change without domain changes.
- Optional fallback model and bounded retry behavior are configured server-side.
- Validate every response with Zod; structured output is used only for models that pass compatibility tests.
- Minimize context and persist provider/model/prompt/schema metadata without secrets.
- No direct database access or autonomous plan modification is granted to the model.

## Consequences
- One gateway simplifies model switching, but free model availability, limits, latency, and output quality vary.
- OpenRouter and underlying model providers' privacy/retention terms must be reviewed.
- AI outages/rate limits must degrade gracefully; deterministic analytics and training rules remain available.
- Keep provider adapter boundaries so another gateway/provider can be adopted later.
