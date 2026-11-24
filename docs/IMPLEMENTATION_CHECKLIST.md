# Implementation Checklist
## Personal Running Coach

**Reconciled:** 2026-11-24 (`DEC-07` milestone sequence M0-M9)  
This checklist tracks actionable implementation steps per milestone. **Do not start Milestone 1 automatically; each milestone requires explicit user approval.**

---

## Milestone 0 - Documentation and Project Governance
- [x] Complete full documentation audit (`docs/DOCUMENTATION_AUDIT.md`).
- [x] Prepare dependency-aligned roadmap (`docs/DEVELOPMENT_ROADMAP.md`).
- [x] Reconcile approved decisions `DEC-01` through `DEC-08` across `docs/`.
- [x] Verify official provider documentation (Vercel Hobby, Supabase Free, Strava API, OpenRouter).
- [x] Document `DEC-04` worker architecture and Milestone 3 sub-daily trigger spike.
- [x] Complete Milestone 0 final remediation (composite cross-user FKs, DB constraints, two-layer training load model, worker guarantees/6 spike criteria, HR-TRIMP assumptions).
- [x] Create root `AGENTS.md` and `docs/MILESTONE_0_CHANGELOG.md`.
- [ ] User signs off Milestone 0 and explicitly approves starting Milestone 1.

## Milestone 1 - Project Foundation and Design System
- [x] Create Next.js App Router project (`16.4.6`, React `19.3.1`) with TypeScript strict (`6.0.3`, `strict: true`, `noUncheckedIndexedAccess: true`).
- [x] Configure Tailwind CSS (`4.3.5`), shadcn/ui Radix primitives, Lucide React (`1.78.0`), and Zod (`4.6.7`). (`Recharts` deferred to Milestone 6/7 when real trend charts render; `ChartFrame` empty/loading/error wrapper implemented in M1.)
- [x] Add ESLint (`9.39.5`), Prettier (`3.10.1`), Vitest (`5.1.1`), Playwright (`1.65.1`), and CI checks (`.github/workflows/ci.yml`).
- [x] Configure environment validation (`lib/env.ts`, `server/config/env.ts` with `server-only`) and `.env.example` (no secrets).
- [x] Configure Supabase CLI (`3.3.0`, `supabase/config.toml`) and `@supabase/ssr` (`0.12.7`) / `@supabase/supabase-js` (`2.119.2`) clients.
- [x] Implement `Modern Gradient Athletic - Light First` tokens (`docs/DESIGN.md`) and Geist Sans / Geist Mono typography (`app/globals.css`, `app/layout.tsx`).
- [x] Build responsive shell (`AppShell`: desktop sidebar + mobile compact app bar & bottom tab navigation) and core shared UI primitives (`Button`, `Card`, `Badge`, `Input`, `Select`, `Dialog`, `Tabs`, `MetricValue`, `WorkoutTypeBadge`, `WorkoutStatus`, `DataCompletenessNote`, `SyncStatus`, `StatePanel`, `ChartFrame`).
- [x] Refine `/dashboard` with product-oriented copy, Training Plan Status hero, summary metric slots, Upcoming Training, and Recent Activities empty states, and extract component showcase to dev-only `/dev/design-system`.

## Milestone 2 - Authentication and Runner Profile
- [x] Sign up / sign in / sign out and protected `(app)` routes (`middleware.ts`, `server/auth/session.ts`, `/login`, `/signup`, `/auth/callback`).
- [x] Create SQL migration (`supabase/migrations/202611240001_m2_auth_runner_and_security.sql`) for `runner_profiles`, `runner_goals`, `audit_logs`, `oauth_states`, and atomic `activate_primary_goal` RPC.
- [x] Author RLS policies on all M2 tables and two-user isolation suite (`tests/integration/rls-runner.test.ts`).
- [ ] Execute live `npm run test:integration` two-user RLS test and `supabase gen types typescript` against a running local/remote Supabase PostgreSQL instance (pending Docker or `.env.local`).
- [x] Auto-create runner profile on first login (`ensureRunnerProfile`); enforce server-only `SUPABASE_SERVICE_ROLE_KEY` and `recordAuditLog`.
- [x] Profile form with `timezone_name`, units, `preferred_training_days`, `unavailable_days`, baseline metrics (`NULL` when unknown), and baseline completeness indicator (`/onboarding`, `/settings`).
- [x] Goal CRUD enforcing one active primary goal via partial unique index and atomic RPC.

## Milestone 3 - Strava Integration
- [ ] Execute `DEC-04` Pre-Implementation Spike: validate sub-daily trigger (`pg_cron`+`pg_net`) against all 6 measurable spike criteria (no active session, concurrency lock, lease recovery, mid-batch failure durability, retry deduplication, live end-to-end free-tier test), or confirm Webhook-Enqueue + 1x/Day Vercel Cron + Manual `Sync Now` baseline.
- [ ] Create SQL migrations for `strava_connections`, server-only `strava_connection_tokens`, `activities`, `activity_streams`, `sync_jobs`, `sync_logs`, plus `claim_sync_jobs` RPC.
- [ ] Implement OAuth2 flow (`activity:read_all` scope clearly disclosed, `oauth_states` validation, AES-256-GCM encryption).
- [ ] Implement webhook Route Handler (`/api/webhooks/strava`: `GET` challenge < 2s, `POST` `subscription_id` & `owner_id` check + idempotent `sync_jobs` enqueue).
- [ ] Implement bounded Next.js worker (`server/jobs/sync-worker.ts`): `per_page=50` summary pagination, `(user_id, provider, external_activity_id)` upsert, 5-min token refresh buffer, 401/429 handling, max 5 retries (`30s`, `60s`, `120s`, backoff).
- [ ] Build Settings -> Integrations (`Sync Now`, initial import, failed job retry, disconnect/token deletion) and Activities list/detail views (lazy streams + optional post-sync RPE input).

## Milestone 4 - Training Plan Engine
- [ ] Create SQL migrations for `training_plans`, `training_phases`, `workouts`, `workout_steps`, `plan_adjustments`.
- [ ] Implement configurable deterministic Training Engine defaults (`DEC-06`: pace zones from recent race/TT or RPE fallback, 4-24 week bounds, phase splits, ramp cap, 3-4 week deload, 48h hard-session spacing, ~30-35% long-run cap).
- [ ] Implement baseline validation and goal feasibility warnings (never fabricate pace targets).
- [ ] Build Plan Creation Wizard, Preview, and atomic plan activation RPC (`BR-018`) + lifecycle (`pause`, `resume`, `complete`, `cancel`, `clone`).
- [ ] Write comprehensive deterministic unit tests for engine guardrails.

## Milestone 5 - Training Calendar and Workout-Activity Matching
- [ ] Create SQL migration for `workout_activities` with partial unique `is_primary` indexes.
- [ ] Build Week view (default, scrollable mobile list) and Month view (secondary).
- [ ] Implement derived `missed` presentation (`status = 'planned'` and `scheduled_date < local_today` in `timezone_name`; never auto-moved).
- [ ] Implement workout detail, complete/skip/modify/reschedule with calendar/spacing/load conflict validation and `plan_version` increment.
- [ ] Implement deterministic activity-to-workout matching (preserving manual matches) + manual link/unlink + Strava remote delete handling (`BR-033`).

## Milestone 6 - Recovery and Readiness
- [ ] Create SQL migration for `recovery_logs` (`UNIQUE (user_id, log_date)`).
- [ ] Build accessible daily check-in form (`RecoveryScaleInput`, skip without penalty, partial inputs remain `NULL`).
- [ ] Implement deterministic `normal` / `caution` / `high_caution` evaluation and severe/worsening pain stop-and-seek-care notice.
- [ ] Build Recovery History view showing missing days explicitly as gaps (never zero).

## Milestone 7 - Performance Analytics
- [ ] Create SQL migrations for `performance_metrics`, `training_loads` (per-activity 1:1), `daily_training_load_summaries` (per-day aggregates + 7d/28d snapshots), `personal_records`.
- [ ] Implement `srpe`, `hr_trimp_estimate`, and `duration_estimate` load calculations (`DEC-05`) with explicit `method`, `is_estimated`, `completeness`, and `calculation_version` (in-place `training_loads` recalculation + deterministic `daily_training_load_summaries` recomputation on post-run RPE input).
- [ ] Implement weekly/monthly summaries, comparable pace trends, PR validation (`BR-055`), and rolling acute/chronic load with non-diagnostic caveats.
- [ ] Build Dashboard focal hero card + supporting cards and Analytics `ChartFrame` visualizations with `DataCompletenessNote`.

## Milestone 8 - AI Adaptive Running Coach
- [ ] Create SQL migrations for `ai_coach_sessions`, `ai_coach_messages`, `ai_recommendations` (with `training_plan_id` FK).
- [ ] Implement server-side OpenRouter provider adapter (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODEL`, timeout, daily budget, context-fingerprint cache, no silent paid fallback).
- [ ] Build minimized context builder (exposing load methods, completeness, and guardrails) and deterministic non-AI fallback summary.
- [ ] Implement strict Zod schemas (Weekly Review + Proposals + Chat Q&A) and `evidence_refs` verification; test against selected free model(s).
- [ ] Implement deterministic proposal validator and transactional Accept/Reject flow (`plan_version` check, `plan_adjustments` before/after snapshots, 7-day/version staleness expiry).

## Milestone 9 - Quality Assurance and Deployment
- [ ] Implement data export (JSON/CSV) and full account + Strava deauthorization deletion workflow.
- [ ] Run threat model review, OAuth/webhook security tests, and two-user RLS regression suite.
- [ ] Run WCAG 2.2 AA accessibility audit (contrast across gradient stops, keyboard nav) and mobile/desktop responsive QA.
- [ ] Provision production Supabase Free + Vercel Hobby, apply migrations, configure production Strava app & OpenRouter secrets.
- [ ] Run full `DEPLOYMENT_RUNBOOK.md` Section 10 smoke tests (including 401, 429, AI outage, malformed output, pause-recovery).
