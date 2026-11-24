# Development Roadmap: Personal Running Coach

**Baseline Date:** 2026-11-24  
**Target Operating Model:** Solo developer, personal-use MVP on Vercel Hobby + Supabase Free + OpenRouter free-tier models  
**Framework:** Milestones 0 to 9 (aligned with `docs/DOCUMENTATION_AUDIT.md`, resolving sequencing across `PRD.md` Section 12 and `IMPLEMENTATION_CHECKLIST.md`)

> **Sequencing Note:** This roadmap places **Strava Integration (Milestone 3)** ahead of **Training Plan Engine (Milestone 4)** and **Training Calendar (Milestone 5)**, and **Recovery and Readiness (Milestone 6)** ahead of **Performance Analytics (Milestone 7)**. Doing so ensures real Strava baseline history is available when generating plans, matching calendar workouts, and aggregating training loads. Upon user approval in Milestone 0, `docs/IMPLEMENTATION_CHECKLIST.md` and `docs/PRD.md` Section 12 should be aligned to match this ordering.

---

## Development Quality Gates (Mandatory Per Milestone)

Every milestone must follow this 12-step execution loop before advancing:

1. Explore existing code and relevant `docs/` specifications.
2. Analyze requirements, business rules (`BR-*`), and schema constraints.
3. Prepare an implementation plan for the single active milestone.
4. Present the plan for explicit user review and approval.
5. Implement only the approved milestone scope (avoid large unrelated refactors or premature abstractions).
6. Run relevant unit, integration, and E2E tests (`Vitest`, `Playwright`).
7. Run lint (`ESLint`) and TypeScript strict checks (`tsc --noEmit`).
8. Verify responsive UI across mobile, tablet, and desktop breakpoints plus keyboard accessibility and empty/loading/error states.
9. Review security, RLS policies, secret boundaries, and authorization ownership checks.
10. Review the full Git diff.
11. Update documentation (`DATABASE_SCHEMA.md`, `BUSINESS_RULES.md`, `IMPLEMENTATION_CHECKLIST.md`, ADRs) if specifications evolved.
12. Report completed work and remaining issues, then **STOP** for explicit approval before starting the next milestone.

---

## Milestone 0: Documentation and Project Governance

### Objective
Resolve all critical documentation conflicts, confirm open architectural/product decisions, verify provider limits, and establish project governance before writing application code.

### Scope
- Documentation audit review and user decision sign-off (`DEC-01` through `DEC-08`).
- Full reconciliation of `docs/DESIGN.md`, `docs/ERD.md`, `docs/DATABASE_SCHEMA.md`, `docs/BUSINESS_RULES.md`, `docs/TRAINING_METHODOLOGY.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/AI_COACH_SPEC.md`, `docs/AI_PROVIDER_STRATEGY.md`, `docs/DEPLOYMENT_RUNBOOK.md`, `docs/USER_FLOW.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/PRD.md`, `docs/README.md`, and `docs/ADR/*`.
- Creation of root `AGENTS.md` governance file (keeping existing docs inside `docs/`) and `docs/MILESTONE_0_CHANGELOG.md`.
- Verification of official provider quotas/terms (Vercel Hobby, Supabase Free, Strava API, OpenRouter).

### Prerequisites
- Completion of `docs/DOCUMENTATION_AUDIT.md` and initial `docs/DEVELOPMENT_ROADMAP.md`.

### Technical Tasks
1. Apply approved decisions `DEC-01` through `DEC-08` across all `docs/` files.
2. Lock `Modern Gradient Athletic - Light First` color, typography (Geist Sans / Geist Mono), spacing, radius, and mobile/desktop rules in `docs/DESIGN.md`.
3. Reconcile `docs/ERD.md` and `docs/DATABASE_SCHEMA.md` (`sync_jobs`, `oauth_states`, `strava_connection_tokens`, `personal_records`, `timezone_name`, `preferred_training_days`, `ai_recommendations.training_plan_id`, `training_loads` method metadata, partial unique indexes, `ON DELETE` rules).
4. Add deterministic engine defaults to `docs/TRAINING_METHODOLOGY.md`, derived `missed` status & `srpe`/`hr_trimp_estimate`/`duration_estimate` rules to `docs/BUSINESS_RULES.md`, and `DEC-04` queue/worker architecture + M3 spike definition to `docs/SYSTEM_ARCHITECTURE.md` and ADRs.
5. Verify official Vercel Hobby, Supabase Free, Strava API, and OpenRouter documentation.
6. Create root `AGENTS.md` (with `antislop` `During` workflow) and `docs/MILESTONE_0_CHANGELOG.md`.

### Expected Deliverables
- Reconciled `docs/` baseline (`MILESTONE_0_CHANGELOG.md`).
- Root `AGENTS.md`.

### Acceptance Criteria
- All 8 decisions (`DEC-01` to `DEC-08`) reflected consistently with zero unresolved Critical or High contradictions.
- Every Milestone 1-4 table and business rule has an unambiguous schema and domain contract.
- Unvalidated sub-daily background triggering (`pg_cron`+`pg_net`) is explicitly isolated as a Milestone 3 pre-implementation spike with 6 measurable acceptance criteria (Next.js `after()` is not treated as durable execution).
- User explicitly approves starting Milestone 1.

### Testing Requirements
- Manual specification cross-check across `ERD.md`, `DATABASE_SCHEMA.md`, `BUSINESS_RULES.md`, and `DESIGN.md`.

### Potential Risks
- Incomplete design token lock or missing mobile reference delaying Milestone 1 UI work.

### Dependencies on Other Milestones
- **Blocks:** All subsequent milestones (Milestone 1 through Milestone 9).

---

## Milestone 1: Project Foundation and Design System

### Objective
Initialize the Next.js App Router + TypeScript strict repository, local/hosted Supabase foundation, environment validation, CI checks, and the responsive design system shell.

### Scope
- Repository initialization (Next.js App Router, React, TypeScript strict, Tailwind CSS, shadcn/ui, Lucide React, Recharts, Zod).
- Quality tooling (ESLint, Prettier, Vitest, Playwright, GitHub Actions CI).
- Supabase CLI setup, `@supabase/ssr` client/server utilities, environment schema validation, `.env.example`.
- Modular monolith directory skeleton (`app/`, `components/`, `features/`, `server/`, `lib/`, `supabase/`, `tests/`).
- Implementation of locked design tokens, responsive app shell (desktop sidebar + mobile bottom tab navigation), and reusable core UI primitives (`MetricValue`, `WorkoutTypeBadge`, `WorkoutStatus`, `DataCompletenessNote`, `SyncStatus`, empty/loading/error wrappers).

### Prerequisites
- Milestone 0 approved (`DEC-01`, `DEC-07`, `DEC-08` resolved).

### Technical Tasks
1. Initialize Next.js App Router with strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`).
2. Configure Tailwind CSS, shadcn/ui, Lucide React, Prettier, ESLint, Vitest, and Playwright.
3. Add Zod-based server/client environment validation and `.env.example` (no secrets).
4. Initialize Supabase CLI (`supabase/`), configure `@supabase/ssr` browser/server/admin clients, and set up initial health check.
5. Implement `docs/DESIGN.md` CSS custom properties, typography, spacing, and radius tokens.
6. Build responsive navigation shell (desktop sidebar, mobile bottom tab bar covering Dashboard, Calendar, Activities, Analytics, Recovery, Coach, Settings) with working placeholder routes and explicit empty/loading/error states.
7. Set up CI workflow (lint, typecheck, unit tests, build).

### Expected Deliverables
- Working Next.js + Supabase repository skeleton deployed to a Vercel preview environment.
- Reusable design-system tokens and responsive navigation shell.
- Passing CI pipeline.

### Acceptance Criteria
- `npm run lint`, `tsc --noEmit`, `vitest`, and `next build` pass cleanly.
- No server-only env variables leak into client bundles.
- Mobile (375px), tablet (768px), and desktop (1280px+) navigation works with zero horizontal overflow, keyboard focus visibility, and 44px+ touch targets.

### Testing Requirements
- **Unit (Vitest):** Environment validation tests, unit formatting utilities (meters to km/mi, seconds to pace).
- **E2E (Playwright):** Navigation smoke tests and responsive viewport checks (desktop sidebar vs. mobile bottom bar).

### Potential Risks
- Next.js / Tailwind / shadcn version compatibility friction; missing visual tokens if `DEC-01` was not locked cleanly.

### Dependencies on Other Milestones
- **Depends on:** Milestone 0.
- **Blocks:** Milestone 2 through Milestone 9.

---

## Milestone 2: Authentication, Security Foundation, and Runner Profile

### Objective
Deliver authenticated private runner workspaces protected by PostgreSQL Row Level Security (RLS), audit logging, runner profile management, baseline assessment, and goal CRUD.

### Scope
- Supabase Auth (sign up, sign in, sign out, session refresh, protected `(app)` route group).
- Initial SQL migrations for `runner_profiles`, `runner_goals`, `audit_logs`, and `oauth_states` (or foundation schema).
- RLS policies on all tables, verified with two distinct test user identities.
- Automatic `runner_profiles` creation on first login.
- Runner profile form (units, `timezone_name`, experience level, recent mileage/days/longest run, preferred/unavailable days, easy/threshold pace, resting/max HR, injury/limitation notes) with `NULL` preservation and baseline completeness indicator.
- Goal CRUD (`runner_goals`) enforcing at most one active primary goal via partial unique index.

### Prerequisites
- Milestone 1 complete and approved.

### Technical Tasks
1. Write SQL migrations for `runner_profiles`, `runner_goals`, `audit_logs` with `CHECK` constraints, `updated_at` triggers, and partial unique index on active primary goal.
2. Enable and write strict RLS policies (`auth.uid() = user_id`) for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
3. Generate TypeScript database types via Supabase CLI.
4. Implement auth routes/pages (`(auth)`), middleware/server session guard, and first-login profile provisioning.
5. Implement `server/domain/runner/` services, audit logging helper, and Zod schemas.
6. Build Onboarding and Settings UI for runner profile, units/timezone, baseline completeness indicator, and Goal CRUD.

### Expected Deliverables
- Working authentication and private workspace isolation.
- Runner profile, baseline completeness view, and goal management UI.
- Verified RLS test suite.

### Acceptance Criteria
- Unauthenticated users are redirected away from `(app)` routes.
- User A cannot read, insert, update, or delete User B's profile, goals, or audit logs via Supabase client or Server Actions.
- Optional/unfilled numeric fields persist as `NULL` (never `0`).
- Activating a new primary goal enforces the one-active-primary-goal constraint cleanly.

### Testing Requirements
- **Unit (Vitest):** Zod validation, unit conversions, baseline completeness calculation.
- **Integration:** Two-user RLS isolation tests against local/test Supabase PostgreSQL; primary goal uniqueness constraint tests.
- **E2E (Playwright):** Sign up/in, onboarding profile save with skipped optional fields, goal creation/archiving.

### Potential Risks
- Incorrect `UPDATE` RLS policy missing `WITH CHECK`, or subtle client-side zero defaults turning missing data into `0`.

### Dependencies on Other Milestones
- **Depends on:** Milestone 1.
- **Blocks:** Milestone 3, Milestone 4, Milestone 6, Milestone 7, Milestone 8.

---

## Milestone 3: Strava Integration and Durable Sync Queue

### Objective
Connect Strava securely via OAuth2, implement durable background synchronization (`sync_jobs`), support historical and incremental activity imports without duplicates, handle webhooks safely, and provide activity browsing.

### Scope
- SQL migrations for `strava_connections`, `strava_connection_tokens` (server-only), `oauth_states`, `activities`, `activity_streams` (optional/lazy), `sync_jobs`, and `sync_logs`.
- Server-side Strava OAuth2 flow (random CSRF `state`, code exchange, AES-256-GCM token encryption, token refresh with 5-minute buffer).
- Durable DB-backed job queue (`sync_jobs`) with atomic claim/lease RPC (`FOR UPDATE SKIP LOCKED`), max 5 retry attempts, staged delays (30s / 60s / 120s + exponential backoff), 429 `Retry-After` respect, 401 reauthorization marking, and dead-letter handling.
- Strava API adapter (`per_page=50` summary pagination, canonical meters/seconds normalization, idempotent upsert on `(user_id, provider, external_activity_id)`).
- Webhook Route Handler (`/api/webhooks/strava`) for `GET` challenge verification and fast `POST` validation + idempotent enqueue (<2s).
- User-triggered `Sync Now` + `Import Historical Activities` + `Retry Failed Jobs` + `Disconnect Strava`.
- Activities list/detail UI with `SyncStatus` indicator, sync history, and lazy stream/detail fetch (if needed) without blocking import.

### Prerequisites
- Milestone 2 complete (`DEC-02` Strava scope and `DEC-04` queue/worker runtime approved).

### Technical Tasks
0. **Pre-Implementation Spike (`DEC-04`):** Validate sub-daily background trigger (`pg_cron` + `pg_net.http_post()` calling `/api/cron/sync-worker`) against all 6 measurable acceptance criteria in `docs/SYSTEM_ARCHITECTURE.md` (no active session, concurrent claim exclusion, expired lease recovery, failure durability, duplicate/retry idempotency, live end-to-end free-tier proof). Next.js `after()` is not treated as durable execution. If unproven under free-tier limits, lock MVP to Webhook-Enqueue + 1x/Day Vercel Hobby Cron + Manual `Sync Now`.
1. Create SQL migrations, RLS policies (keeping `strava_connection_tokens` and `oauth_states` accessible only to `service_role`), and atomic `claim_sync_jobs` (`FOR UPDATE SKIP LOCKED` + `lease_expires_at`) PostgreSQL RPCs.
2. Implement AES-256-GCM encryption/decryption utility (`STRAVA_TOKEN_ENCRYPTION_KEY`) and `oauth_states` lifecycle.
3. Build `/api/integrations/strava/connect`, `/api/integrations/strava/callback` (`activity:read_all`), and disconnect handler (`BR-091`, deleting `strava_connection_tokens`).
4. Build Strava HTTP adapter with 5-minute proactive token refresh, 401 recovery, 429 `Retry-After` backoff, and DTO normalization to canonical units.
5. Build `/api/webhooks/strava` (`GET` hub verification < 2s + `POST` `subscription_id` & `owner_id` check + idempotent `sync_jobs` insert).
6. Implement bounded Next.js queue worker (`server/jobs/sync-worker.ts`) invoked by `Sync Now` and Vercel Hobby daily Cron (`/api/cron/sync-reconcile` with `CRON_SECRET`), plus any validated spike trigger.
7. Build Settings -> Integrations panel (explicitly disclosing `activity:read_all` scope) and Activities list/detail pages (with filters, sync logs, manual retry, optional post-sync RPE input, and empty/partial/error states).

### Expected Deliverables
- End-to-end Strava OAuth connection, disconnect, webhook enqueue, manual `Sync Now`, and historical import.
- Activities list and detail views populated with normalized Strava runs.

### Acceptance Criteria
- Tokens are never exposed to client components, browser network responses, or logs.
- Re-running webhook events or manual sync never creates duplicate `activities` rows.
- Webhook `POST` inserts minimal `sync_jobs` row and returns `200 OK` without inline Strava API fetching.
- Simulated 429 schedules `retry_wait` using `Retry-After`; simulated 401 transitions connection to `reauthorization_required`; 5 failed attempts move job to `failed` with manual retry available.

### Testing Requirements
- **Unit (Vitest):** Token encryption/decryption roundtrip, Strava payload normalization, retry/backoff calculator, 401/429 error classification.
- **Integration:** Mocked Strava API tests for paginated import (`per_page=50`), idempotent upsert, webhook duplicate suppression, and `claim_sync_jobs` lease locking.
- **E2E (Playwright):** Connect/disconnect flow (mocked OAuth), triggering `Sync Now`, inspecting `SyncStatus` and Activities list.

### Potential Risks
- Strava rate limits during large historical imports if streams are fetched eagerly (mitigated by summary-only initial import).
- Vercel Hobby timeout during synchronous `Sync Now` (mitigated by bounded 1-2 page batches per invocation with cursor persistence).

### Dependencies on Other Milestones
- **Depends on:** Milestone 2.
- **Feeds:** Milestone 4 (imported baseline history), Milestone 5 (activity matching), Milestone 7 (analytics).

---

## Milestone 4: Training Plan Engine

### Objective
Build the deterministic periodized Training Plan Engine capable of generating, previewing, validating, activating, pausing, resuming, completing, cancelling, and versioning structured running plans.

### Scope
- SQL migrations for `training_plans`, `training_phases`, `workouts`, `workout_steps`, and `plan_adjustments` (with partial unique index for one `active` plan per user).
- Deterministic domain engine (`server/domain/training/`) implementing baseline validation, goal feasibility feedback, phase allocation, weekly volume progression guardrails, hard-session spacing, and workout/step generation across the 12 taxonomy types (`easy_run`, `recovery_run`, `long_run`, `steady_run`, `tempo_run`, `interval`, `repetition`, `hill_repeats`, `race_pace`, `strides`, `rest`, `cross_training`).
- Atomic PostgreSQL RPC/transaction for plan activation (deactivating/completing conflicting plans safely per `BR-018`) and plan lifecycle transitions (`draft -> active -> paused -> active -> completed | cancelled`).
- Plan Creation Wizard, Preview (phases, weekly volume chart, key workouts, availability match, uncertainty/estimate disclosures), and Plan Management UI.

### Prerequisites
- Milestone 2 and Milestone 3 complete (`DEC-06` deterministic engine defaults approved).

### Technical Tasks
1. Create SQL migrations for `training_plans`, `training_phases`, `workouts`, `workout_steps`, `plan_adjustments` with `CHECK` constraints and partial unique active-plan index.
2. Implement deterministic pace/HR/RPE zone resolver (using profile/Strava baseline when valid, falling back to RPE and labeling estimates explicitly).
3. Implement phase generator and weekly workout/step builder respecting `preferred_training_days`, `unavailable_days`, progressive overload caps, deload weeks, and 48h hard-session spacing.
4. Implement goal feasibility evaluator (warning when target time/race date conflicts with recent mileage/PRs without blocking custom/adjusted plans).
5. Implement atomic activation & lifecycle transitions (`activate`, `pause`, `resume`, `complete`, `cancel`, `clone_revision`) with `audit_logs` entries.
6. Build Plan Builder & Preview UI.

### Expected Deliverables
- Deterministic Training Plan Engine with full unit test coverage.
- Interactive Plan Wizard, Preview, and Lifecycle Management UI.

### Acceptance Criteria
- Database rejects two concurrent `active` plans for the same user.
- Generated workouts contain structured steps (`warmup`, `work`, `recovery`, `cooldown`) and never fabricate exact paces when baseline pace data is missing.
- Activating, pausing, completing, or cancelling a plan preserves full historical plans and records audit logs.
- No hard sessions scheduled on consecutive days by default; unavailable days respected.

### Testing Requirements
- **Unit (Vitest):** Extensive deterministic tests for phase splits, volume ramp caps, deload weeks, missing-baseline RPE fallback, hard-day spacing, and invalid state transition rejections.
- **Integration:** Atomic activation transaction tests and RLS tests on plans/phases/workouts/steps.
- **E2E (Playwright):** Generate plan -> preview -> activate -> pause -> resume -> cancel flow.

### Potential Risks
- Edge cases in custom goals, short lead times (<4 weeks), or sparse Strava/profile baseline data producing unrealistic workouts (mitigated by conservative fallback templates and explicit warnings).

### Dependencies on Other Milestones
- **Depends on:** Milestone 2, Milestone 3 (optional Strava baseline).
- **Blocks:** Milestone 5, Milestone 8.

---

## Milestone 5: Training Calendar and Workout-Activity Matching

### Objective
Deliver the interactive weekly/monthly Training Calendar, workout detail inspection, manual rescheduling/modification with conflict checks, missed workout handling, and automatic + manual workout-to-activity matching.

### Scope
- SQL migration for `workout_activities` (including partial unique indexes enforcing one primary match per workout and one primary match per activity).
- Calendar views: Week view (default, scrollable list on mobile) and Month view (secondary).
- Workout detail panel/page displaying structured steps, intensity basis, status (`planned`, `completed`, `skipped`, `rescheduled`, `modified`, plus derived `missed` presentation), and completion notes.
- Reschedule, skip, and bounded modification workflows validating calendar conflicts, hard-session spacing, and recovery/load warnings (`BR-024`) without auto-rolling missed workouts (`BR-023`).
- Automatic activity matching service (local timezone date window, running sport-type filter, distance/duration similarity confidence `0..1`) + manual link/unlink/replace UI (`BR-025` to `BR-027`).
- Optional manual post-run RPE / note capture on linked/completed workouts.

### Prerequisites
- Milestone 3 (Strava activities) and Milestone 4 (Training plans & workouts) complete (`DEC-03` missed status and `MISS-04` matching rules approved).

### Technical Tasks
1. Create `workout_activities` migration with partial unique indexes on `is_primary = true` for `workout_id` and `activity_id`.
2. Implement deterministic matching engine (`server/domain/activities/matching.ts`) invoked after Strava sync upsert; never overwrite existing `manual` matches.
3. Implement calendar mutation services (mark completed/skipped, reschedule with conflict check, modify target/notes, link/unlink activity) that bump `plan_version` and write `plan_adjustments` / `audit_logs` where appropriate.
4. Handle Strava `delete` webhook impact on matched workouts according to approved `MISS-04` policy.
5. Build Calendar Week/Month views, Workout Detail drawer/page, accessible menu-based Reschedule modal, and Activity Link/Unlink picker.

### Expected Deliverables
- Complete Calendar workspace (week + month) with workout lifecycle controls.
- Automatic and manual `workout_activities` matching integrated with Strava sync.

### Acceptance Criteria
- Past uncompleted workouts are flagged as missed/unresolved and **never** automatically moved to the next day.
- Unlinking an activity never deletes either the `workouts` row or the `activities` row.
- Rescheduling onto an occupied/consecutive-hard day triggers deterministic conflict warnings and confirmation.
- Manual match overrides automatic match and is preserved across subsequent Strava incremental syncs.

### Testing Requirements
- **Unit (Vitest):** Matching confidence scoring, timezone date alignment, missed workout derived detection, reschedule conflict checks.
- **Integration:** `workout_activities` primary-match constraint tests; Strava sync preserving manual matches.
- **E2E (Playwright):** Weekly/monthly calendar navigation, reschedule workout, link/unlink Strava activity, mobile scrollable week calendar check.

### Potential Risks
- Timezone edge cases around midnight runs causing off-by-one date matches (mitigated by converting `started_at` via `activity.timezone_name` / `runner_profiles.timezone_name`).

### Dependencies on Other Milestones
- **Depends on:** Milestone 3, Milestone 4.
- **Feeds:** Milestone 7, Milestone 8.

---

## Milestone 6: Recovery and Readiness

### Objective
Enable fast, non-judgmental daily manual recovery check-ins, recovery history trends, conservative deterministic readiness flags, and safety-first pain/symptom escalations.

### Scope
- SQL migration for `recovery_logs` (`UNIQUE (user_id, log_date)` using runner local calendar date).
- Daily check-in form: sleep duration (min/hours) & quality (1-5), fatigue (1-10), soreness (1-10), stress (1-10), motivation (1-10), optional resting HR (bpm), optional HRV (ms), pain notes, general notes.
- Deterministic recovery flag evaluator (`normal`, `caution`, `high_caution`) with explicit missing-data handling (`BR-061`, `BR-065`: missing inputs reduce confidence rather than inflating readiness; red-flag pain triggers stop-and-seek-professional guidance).
- Recovery history timeline and trend charts (showing missing days explicitly as gaps, never zero).

### Prerequisites
- Milestone 2 (runner profile & `timezone_name`) complete.

### Technical Tasks
1. Create `recovery_logs` migration with range `CHECK` constraints (`sleep_quality` 1-5, subjective scales 1-10) and `(user_id, log_date)` unique index.
2. Implement `server/domain/recovery/` service for upsert-by-local-date, deterministic flag rules, and data completeness calculation.
3. Build accessible `RecoveryScaleInput` component (keyboard + touch friendly, 44px+ targets) and daily check-in form (allowing partial inputs and skip without penalty).
4. Build Recovery History view with Recharts trend visualization (explicit gaps for missing days) and clear non-medical disclaimer banner.

### Expected Deliverables
- Daily Recovery Check-in workflow and Recovery Trends page.
- Deterministic `normal` / `caution` / `high_caution` evaluation module.

### Acceptance Criteria
- Unfilled fields remain `NULL` and render as "Not recorded" rather than `0`.
- User can create and edit one check-in per local calendar date, and skip check-ins with zero penalty.
- Severe/worsening pain note or `high_caution` flag displays clear non-medical stop/professional-guidance notice.
- Recovery UI explicitly communicates that indicators are decision support, not medical diagnoses.

### Testing Requirements
- **Unit (Vitest):** Range validation, local-date resolution, deterministic flag rules (`normal`/`caution`/`high_caution`), missing-data confidence reduction.
- **Integration:** Unique `(user_id, log_date)` upsert and RLS isolation tests.
- **E2E (Playwright):** Submitting partial recovery check-in, editing same-day log, verifying missing-day gap display on mobile/desktop.

### Potential Risks
- Users skipping subjective inputs frequently if the form feels tedious (mitigated by progressive/fast 1-tap scales and optional fields).

### Dependencies on Other Milestones
- **Depends on:** Milestone 2.
- **Feeds:** Milestone 5 (reschedule recovery warning), Milestone 7, Milestone 8.

---

## Milestone 7: Performance Analytics and Dashboard

### Objective
Build the deterministic analytics and training-load engine and deliver the main Dashboard and Analytics views with explicit units, comparison context, PR tracking, and data completeness disclosures.

### Scope
- SQL migrations for `performance_metrics`, `training_loads` (per-activity session load, 1:1), `daily_training_load_summaries` (per-day unmixed method aggregates + rolling 7d acute / 28d chronic snapshots), and `personal_records` (with `calculation_version` and provenance).
- Deterministic analytics engine (`server/domain/analytics/`):
  - Daily/weekly/monthly distance, duration, running frequency, elevation gain.
  - Longest run and verified Personal Records (5K, 10K, HM, Marathon).
  - Comparable pace progression (grouped by workout/effort type, never misleadingly mixing intervals with recovery runs per `BR-052`).
  - Planned vs. completed adherence metrics.
  - Heart rate / intensity distribution (only when sufficient HR/pace/RPE data exists).
  - Training load (`sRPE` + approved fallback from `DEC-05`, 7-day acute / 28-day chronic rolling/EWMA trends with explicit non-diagnostic caveats per `BR-053`, `BR-054`).
- Dashboard page (`/dashboard`) answering *"How is my training going, and what should I focus on next?"* (current goal & phase, weekly planned vs. completed, next workout, weekly volume, recent activity, recovery status, coach insight entry point).
- Analytics page (`/analytics`) with date-range selector, Recharts visualizations wrapped in `ChartFrame` (empty state + accessible summary table/text), and `DataCompletenessNote`.

### Prerequisites
- Milestone 3 (activities), Milestone 4 (plans), Milestone 5 (matching), Milestone 6 (recovery) complete (`DEC-05` load fallback approved).

### Technical Tasks
1. Create migrations for `performance_metrics`, `training_loads`, `daily_training_load_summaries`, and `personal_records` with composite cross-user FKs, RLS, and indexes.
2. Implement deterministic metric & two-layer training load calculators (in-place per-activity `training_loads` upsert + deterministic forward recomputation of `daily_training_load_summaries`) with `calculation_version` and completeness scoring (`0..1`).
3. Hook metric/load recalculation cleanly into activity sync, RPE entry, and workout matching (on-demand + cached period summaries).
4. Build Dashboard summary cards following `docs/DESIGN.md` hierarchy (focal card, restrained metrics, no information overload).
5. Build Analytics page with Recharts charts (distance/duration bars, pace trend with workout-type filter, intensity distribution, acute/chronic load with caveat banner) and accessible data summaries.

### Expected Deliverables
- Complete Dashboard and Analytics workspaces backed by deterministic domain calculations.

### Acceptance Criteria
- Every metric displays value, unit, time period, source, and data completeness/limitations when partial.
- Acute/chronic load views explicitly disclaim medical/injury certainty.
- Empty/insufficient-data states render cleanly without fake charts or placeholder statistics (`antislop` `R-17`, `R-27`).
- PR detection ignores invalid/short activities (`BR-055`).

### Testing Requirements
- **Unit (Vitest):** Weekly/monthly aggregation, timezone boundary bucketing, sRPE/fallback load math, acute/chronic rolling math, PR eligibility filter, completeness scoring.
- **Integration:** Recalculation idempotency across repeated Strava syncs.
- **E2E (Playwright):** Dashboard overview rendering, Analytics date-range switching, chart empty state vs. populated state, mobile layout check.

### Potential Risks
- Recharts responsiveness or label overlap on 375px mobile screens (mitigated by simplified mobile chart ticks + tabular summary).

### Dependencies on Other Milestones
- **Depends on:** Milestone 3, Milestone 4, Milestone 5, Milestone 6.
- **Blocks:** Milestone 8.

---

## Milestone 8: AI Adaptive Running Coach (OpenRouter)

### Objective
Integrate the server-side OpenRouter AI gateway to deliver evidence-backed weekly training reviews, recovery/goal insights, conversational Q&A, and human-approved structured training plan adjustment proposals.

### Scope
- SQL migrations for `ai_coach_sessions`, `ai_coach_messages`, and `ai_recommendations` (including `training_plan_id` FK and `based_on_plan_version`).
- Server-side OpenRouter provider adapter (`server/integrations/openrouter/` and `ai-provider/` interface) using `https://openrouter.ai/api/v1`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, optional `OPENROUTER_FALLBACK_MODEL`, strict timeouts, bounded retries, per-user daily request caps, and **no silent fallback to paid models**.
- Minimized context builder (`server/domain/ai-coach/context-builder.ts`) stripping tokens, GPS streams, and unnecessary identifiers.
- Strict Zod output schemas for Weekly Review + Proposals and Conversational Q&A, plus `evidence_refs` verification against supplied context IDs.
- Deterministic proposal validator (`server/domain/ai-coach/proposal-validator.ts`) enforcing narrow allowed operations, plan ownership, `plan_version` concurrency check, availability, and training guardrails.
- Approval workflow (`pending -> accepted | rejected | expired | superseded`) applying accepted adjustments transactionally with `plan_adjustments` and `audit_logs` before/after snapshots.
- Deterministic non-AI fallback summary when OpenRouter is unavailable or rate-limited (`BR-097`).
- AI Coach UI (`/coach`): structured Weekly Review report, `CoachEvidenceList`, `AdjustmentDiff` (before/after), explicit Accept / Reject buttons, and grounded chat interface.

### Prerequisites
- Milestone 4, Milestone 5, Milestone 6, and Milestone 7 complete.

### Technical Tasks
1. Create migrations for `ai_coach_sessions`, `ai_coach_messages`, and `ai_recommendations` with RLS and status/expiry indexes.
2. Implement OpenRouter adapter (OpenAI-compatible SDK or `fetch`) with normalized response/error types, latency/usage logging (no secrets), and context-fingerprint caching.
3. Build deterministic context builder and non-AI fallback generator.
4. Define strict Zod schemas and `evidence_refs` validator; test against target free OpenRouter model(s) on representative coach prompts.
5. Implement proposal validation + transactional Accept/Reject RPC/service (checking `training_plan_id` + `plan_version`, bumping `plan_version`, recording `plan_adjustments` & `audit_logs`).
6. Build AI Coach UI (Weekly Review, Proposal Diff with Accept/Reject, Conversational Q&A, Quota/Unavailable fallback notice).

### Expected Deliverables
- Working OpenRouter-backed AI Coach with Weekly Review, Q&A, Proposal Diff, and transactional Approval flow.

### Acceptance Criteria
- `OPENROUTER_API_KEY` is never exposed to client code or persisted in logs/DB.
- Malformed JSON, invented `evidence_refs`, or guardrail-violating proposals are rejected and never mutate a training plan.
- Stale proposals (where `plan_version` changed after generation) cannot be applied and transition cleanly to `expired` / `superseded`.
- 429 rate limit, timeout, or provider outage shows a deterministic fallback summary without throwing unhandled errors or switching to a paid model.
- Changing `OPENROUTER_MODEL` requires zero changes to `server/domain/ai-coach/` or UI code.

### Testing Requirements
- **Unit (Vitest):** Context minimization (verifying zero tokens/latlng), Zod schema parsing, `evidence_refs` rejection of hallucinated IDs, proposal validator guardrails, stale `plan_version` rejection, fallback summary generation.
- **Integration:** Transactional Accept/Reject tests with mocked OpenRouter adapter + live compatibility smoke test against chosen `:free` OpenRouter model.
- **E2E (Playwright):** Request Weekly Review -> inspect evidence & before/after diff -> Accept proposal -> verify Calendar & `plan_adjustments` updated -> Reject flow leaves plan unchanged.

### Potential Risks
- OpenRouter `:free` model deprecation, 20 RPM / 50 RPD throttling, or inconsistent JSON-schema adherence (mitigated by context caching, prompt-JSON + Zod parsing, allowlist testing, and deterministic fallback).
- Vercel Hobby timeout if primary + fallback exceed execution limit (mitigated by bounded 15-20s timeouts).

### Dependencies on Other Milestones
- **Depends on:** Milestone 4, Milestone 5, Milestone 6, Milestone 7.
- **Blocks:** Milestone 9.

---

## Milestone 9: Quality Assurance, Hardening, and Free-Cloud Deployment

### Objective
Harden security, accessibility, performance, data portability (export/deletion), observability, and deploy the production personal MVP to Vercel Hobby + Supabase Free.

### Scope
- Full security & privacy review (threat model validation, RLS regression suite, OAuth/webhook security tests, log redaction audit, OpenRouter data-retention verification).
- Data Export (JSON/CSV user workspace export) and Account/Data Deletion workflow (`FR-19`, `BR-092`).
- Accessibility audit (WCAG 2.2 AA: keyboard navigation, contrast checks across gradients/badges, screen-reader landmarks, reduced motion) and mobile/tablet/desktop responsive QA.
- Query performance & index verification, DB size / egress / AI quota monitoring dashboard or admin view.
- Production deployment on Vercel Hobby + Supabase Free + Strava production OAuth/webhook + OpenRouter configuration, plus backup/export and Supabase pause-recovery validation.

### Prerequisites
- Milestones 1 through 8 complete and tested locally/in preview.

### Technical Tasks
1. Implement user data export endpoint/action and full account + Strava deauthorization deletion workflow (`auth.admin.deleteUser` + cascade + audit completion note).
2. Run full Vitest unit/integration suite, two-user RLS regression tests, and Playwright E2E suite across mobile and desktop viewports.
3. Run Lighthouse / axe-core accessibility and contrast checks; fix any keyboard, focus, or contrast defects.
4. Provision production Supabase Free project, apply SQL migrations via Supabase CLI, configure Auth URLs and server secrets.
5. Deploy production Next.js app to Vercel Hobby (confirming non-commercial personal-use eligibility), configure production env vars (`NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`, `STRAVA_*`, `OPENROUTER_*`).
6. Register production Strava OAuth callback & webhook subscription (`STRAVA_WEBHOOK_SUBSCRIPTION_ID`) and verify <2s challenge/event handling.
7. Execute full production smoke checklist from `docs/DEPLOYMENT_RUNBOOK.md` Section 10, including failure simulations (401, 429, OpenRouter unavailable, malformed JSON).
8. Validate manual DB export/backup procedure and document operational recovery steps for Supabase 7-day inactivity pause.

### Expected Deliverables
- Hardened, verified production deployment on Vercel Hobby + Supabase Free.
- Passing QA, security, accessibility, and smoke-test sign-off.
- Data export and account deletion features.

### Acceptance Criteria
- All `DEPLOYMENT_RUNBOOK.md` Section 10 smoke checks pass.
- Zero critical/high security, RLS, or WCAG AA accessibility issues.
- App degrades gracefully when OpenRouter is unavailable or Strava returns 401/429.
- Data export produces complete user records; deletion revokes Strava tokens and removes user records cleanly.

### Testing Requirements
- **Unit + Integration (Vitest):** Full suite passing, including RLS isolation and OAuth/webhook security cases.
- **E2E (Playwright):** Critical user journeys end-to-end (onboarding -> Strava sync -> plan -> calendar match -> recovery -> analytics -> AI review/approval -> export).
- **Manual / Production Smoke:** Live webhook test, Strava `Sync Now`, OpenRouter `:free` roundtrip, and mobile device responsive check.

### Potential Risks
- Provider terms/quota changes on Vercel Hobby, Supabase Free, Strava, or OpenRouter `:free` models between planning and release (mitigated by pre-deploy provider verification and documented upgrade paths).

### Dependencies on Other Milestones
- **Depends on:** Milestone 1 through Milestone 8.

---

## Summary Timeline & Dependency Graph

```text
M0 (Governance & Spec Alignment)
 └──▶ M1 (Foundation & Design System)
       └──▶ M2 (Auth, RLS & Runner Profile)
             ├──▶ M3 (Strava Integration & Sync Queue) ──────┐
             │                                               ▼
             ├──▶ M4 (Training Plan Engine) ◀──── (optional baseline)
             │          │
             │          ▼
             ├──▶ M5 (Training Calendar & Matching) ◀────────┤
             │                                               │
             └──▶ M6 (Recovery & Readiness)                  │
                        │                                    │
                        ▼                                    ▼
                   M7 (Performance Analytics & Dashboard) ◀──┘
                        │
                        ▼
                   M8 (AI Adaptive Running Coach - OpenRouter)
                        │
                        ▼
                   M9 (QA, Hardening & Free-Cloud Deployment)
```

For a solo developer working part-time with strict quality gates per milestone, expect M0-M2 to establish the core platform quickly, M3 (Strava + durable queue) and M4-M5 (Plan Engine + Calendar Matching) to represent the primary engineering bulk, and M6-M9 to layer recovery, analytics, AI coaching, and production hardening cleanly on top.
