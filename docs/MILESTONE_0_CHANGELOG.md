# Milestone 0 Changelog - Documentation Reconciliation & Governance

**Date:** 2026-11-24  
**Scope:** Reconcile all 8 user-approved decisions (`DEC-01` through `DEC-08`), verify official provider documentation, finalize or isolate the background worker design, and establish root governance (`AGENTS.md`). No application code, dependencies, or SQL migrations were created.

---

## 1. Approved Decisions Implemented (`DEC-01` to `DEC-08`)

| Decision ID | Decision Summary | Target Documents Updated |
|---|---|---|
| **DEC-01** | **Modern Gradient Athletic - Light First** (`#F7F8FC`, `#FFFFFF`, `#20212B`, `#697080`, `#E7EAF1`, `#3478F6`, `#8B5CF6`, `#50C9CE`, selective `linear-gradient(110deg, #3478F6 0%, #8B5CF6 58%, #50C9CE 100%)`, Geist Sans & Geist Mono, 14-20px cards / 8-12px controls, desktop sidebar, mobile compact app bar + bottom tab bar). | `docs/DESIGN.md`, `AGENTS.md` |
| **DEC-02** | Strava OAuth scope set to **`activity:read_all`** to include private ("Only You") runs, clearly disclosed in the OAuth UI. | `docs/BUSINESS_RULES.md` (`BR-042`), `docs/USER_FLOW.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/DEPLOYMENT_RUNBOOK.md`, `docs/ADR/ADR-003-integration-strategy.md` |
| **DEC-03** | **`missed`** defined as a derived presentation/application state (`status = 'planned'` AND `scheduled_date < local_today` in runner `timezone_name`); persisted statuses remain `planned`, `completed`, `skipped`, `rescheduled`, `modified`; no midnight cron mutation or auto roll-forward. | `docs/BUSINESS_RULES.md` (`BR-022`, `BR-023`), `docs/DATABASE_SCHEMA.md`, `docs/TRAINING_METHODOLOGY.md`, `docs/USER_FLOW.md`, `docs/DESIGN.md` |
| **DEC-04** | Consolidated durable queue on PostgreSQL **`sync_jobs`** + single Next.js TypeScript worker (`server/jobs/sync-worker.ts`) via atomic `claim_sync_jobs` RPC (`FOR UPDATE SKIP LOCKED` + lease expiry). Verified triggers: webhook fast enqueue (`< 2s`), user `Sync Now`, and Vercel Hobby 1x/day Cron (`CRON_SECRET`). Sub-daily trigger (`pg_cron`+`pg_net`) isolated as a **Milestone 3 Implementation Spike** with 6 measurable criteria; Next.js `after()` excluded as non-durable. | `docs/SYSTEM_ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/DEPLOYMENT_RUNBOOK.md`, `docs/BUSINESS_RULES.md` (`BR-102`), `docs/ADR/ADR-002`, `docs/ADR/ADR-003`, `docs/ADR/ADR-004` |
| **DEC-05** | Distinct training load methods (`srpe`, `hr_trimp_estimate`, `duration_estimate`) with non-blocking optional post-sync RPE input (`1-10`) and full provenance metadata (`unit`, `method`, `calculation_version`, `source_data`, `completeness`, `is_estimated`). | `docs/TRAINING_METHODOLOGY.md`, `docs/DATABASE_SCHEMA.md`, `docs/BUSINESS_RULES.md` (`BR-100`, `BR-101`), `docs/AI_COACH_SPEC.md`, `docs/USER_FLOW.md` |
| **DEC-06** | Configurable, provisional deterministic defaults for the Training Plan Engine (4-24w bounds, pace from recent race/TT <16w or RPE fallback, phase ratios, 5-10% ramp cap, 3-4w step-back, 48h hard-session spacing, ~25-35% long-run cap, goal feasibility warnings). | `docs/TRAINING_METHODOLOGY.md`, `docs/AI_COACH_SPEC.md` |
| **DEC-07** | Unified milestone sequence M0-M9 (Strava in M3 before Plan Engine M4 and Calendar M5; Recovery M6 before Analytics M7). | `docs/DEVELOPMENT_ROADMAP.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/PRD.md` |
| **DEC-08** | Created root `AGENTS.md` enforcing `antislop` **During** mode, architecture boundaries, RLS/security rules, and 12-step milestone approval gates. | `AGENTS.md`, `docs/DESIGN.md`, `docs/DOCUMENTATION_AUDIT.md` |

---

## 2. Documents Modified & Created

### Modified Existing Files
- `docs/DESIGN.md`: Replaced conflicting flat calm-green/blue guidelines with locked `Modern Gradient Athletic - Light First` tokens, typography, layout rules, chart palette, and anti-generic-design rules.
- `docs/ERD.md`: Added `SYNC_JOBS`, `OAUTH_STATES`, `STRAVA_CONNECTION_TOKENS`, `PERSONAL_RECORDS`, `AI_RECOMMENDATIONS -> TRAINING_PLANS` relationship, and explicit delete/retention rules.
- `docs/DATABASE_SCHEMA.md`: Added `runner_profiles.timezone_name`, `preferred_training_days`, `unavailable_days`, `max_hr_bpm`, `lthr_bpm`, `hr_zones`, `weight_kg`, `injury_history`; added `personal_records`, `oauth_states`, `strava_connection_tokens` (server-only AES-256-GCM isolated tokens + `key_version`); updated `activities` deduplication to `(user_id, provider, external_activity_id)` + `session_rpe`/`local_notes`; updated `training_loads` with `DEC-05` fields; added `ai_recommendations.training_plan_id`; added partial unique primary-match indexes on `workout_activities`; formalized `sync_jobs` state model (`pending`/`processing`/`retry_wait`/`completed`/`failed`, `next_run_at`, `lease_expires_at`, `error_classification`); added `ON DELETE` rules; fixed duplicate `## 5.` heading.
- `docs/BUSINESS_RULES.md`: Reconciled `BR-022`/`BR-023` (`missed` derived state), `BR-026`/`BR-028` (manual match preservation & `plan_version` increment), `BR-033` (Strava remote delete impact on matched workouts), `BR-041` (`per_page=50`), appended `BR-042` (`activity:read_all`) and `BR-100` to `BR-103` (training load methods, non-blocking RPE, 5-attempt 30/60/120s retry policy, recommendation 7-day/version expiry).
- `docs/TRAINING_METHODOLOGY.md`: Added configurable provisional deterministic engine parameters (`DEC-06`), sparse-data fallbacks, `DEC-05` formulas (`srpe`, Banister-style `hr_trimp_estimate`, `duration_estimate`), and non-medical guardrails.
- `docs/SYSTEM_ARCHITECTURE.md`: Updated worker topology (`sync_jobs` + single Next.js TS worker), webhook `< 2s` + `STRAVA_WEBHOOK_SUBSCRIPTION_ID` verification, `activity:read_all`, `DEC-04` M3 spike definition, verified free-tier limits, and consolidated env vars.
- `docs/AI_COACH_SPEC.md`: Added `training_load` method/completeness/guardrails to context contract, added `chat` Q&A structured JSON schema, and documented 7-day / `plan_version` expiry rules.
- `docs/AI_PROVIDER_STRATEGY.md`: Aligned `AI_REQUEST_TIMEOUT_MS=20000` with serverless budget and updated `:free` rate-limit notes (20 RPM / 50 RPD < \$10 credits, 1,000 RPD >= \$10 credits).
- `docs/USER_FLOW.md`: Updated Strava connect scope (`activity:read_all`), post-sync optional RPE flow, and derived `missed` workout flow.
- `docs/DEPLOYMENT_RUNBOOK.md`: Consolidated env vars (`STRAVA_WEBHOOK_SUBSCRIPTION_ID`, `CRON_SECRET`, `AI_*`), added separate Strava dev app rule (1 webhook per app), `< 2s` SLA, and Supabase 7-day pause recovery instructions.
- `docs/PRD.md`: Aligned Section 12 Release Phases with M0-M9 (`DEC-07`).
- `docs/IMPLEMENTATION_CHECKLIST.md`: Reordered M0-M9 per `DEC-07`, marked M0 tasks complete pending user sign-off, added M3 spike.
- `docs/README.md`: Updated index and reconciled Milestone 0 decision summary.
- `docs/ADR/ADR-002-database-strategy.md`, `ADR-003-integration-strategy.md`, `ADR-004-deployment-strategy.md`, `ADR-005-openrouter-ai-gateway.md`: Added dated Milestone 0 reconciliation sections preserving historical context.
- `docs/DOCUMENTATION_AUDIT.md` & `docs/DEVELOPMENT_ROADMAP.md`: Updated audit resolution log (`DEC-01`..`DEC-08` resolved) and M0/M3 roadmap tasks.

### New Files Created
- `AGENTS.md`: Root project governance and AI coding instructions.
- `docs/MILESTONE_0_CHANGELOG.md`: This Milestone 0 reconciliation record.

---

## 3. Official Provider Documentation Verification (Verified 2026-11-24)

| Provider | Documentation Verified | Key Quota / Restriction Found | Architectural Impact | Changes Existing Decision? |
|---|---|---|---|---|
| **Vercel Hobby** | Vercel Limits & Plans Docs (`vercel.com/docs/limits`, `vercel.com/docs/plans/hobby`) | Function max duration up to 300s; **Cron jobs strictly limited to 1x/day with timing jitter** (sub-daily cron expressions fail deployment); 100 GB Fast Data Transfer / 10 GB Fast Origin Transfer (hard cap); strict personal/non-commercial eligibility. | Confirms Vercel Cron can handle daily reconciliation (`1x/day`) but **cannot** provide sub-daily background draining. `AI_REQUEST_TIMEOUT_MS` aligned to `20000` to fit cleanly inside serverless execution budgets. | **Refines `DEC-04`** (Vercel Cron = daily only; sub-daily trigger isolated as M3 spike). |
| **Supabase Free** | Supabase Platform Billing, Extensions & Edge Function Limits (`supabase.com/docs/guides/platform/billing-on-supabase`, `supabase.com/docs/guides/functions/limits`, `supabase.com/docs/guides/queues`) | 500 MB DB, 5 GB egress (+ 5 GB cached); **project pauses after 7 days of inactivity** (which halts `pg_cron` too); **`pg_cron` and `pg_net` ARE available on Free tier**; Edge Functions allow 500k invocations/mo, 150s wall-clock, 2s CPU, 256 MB RAM. | Confirms `activity_streams` must stay lazy-loaded/outside core DB tables to stay under 500 MB; documents manual unpause + `Sync Now` recovery after 7-day pauses; enables testing `pg_cron`+`pg_net` in M3 spike without Edge Function code duplication. | **Supports `DEC-04`** (avoids duplicate Deno worker; documents 7-day pause risk). |
| **Strava API v3** | Strava Developer Auth, Rate Limits & Webhooks Docs (`developers.strava.com/docs/authentication/`, `rate-limiting/`, `webhooks/`) | `activity:read` excludes private ("Only You") runs, whereas `activity:read_all` includes them; default read limits ~100 req / 15 min & 1,000 / day; **only 1 webhook subscription per Strava `client_id`**; webhook `GET` challenge & `POST` event endpoints must return `200 OK` within **2 seconds**. | Confirms `activity:read_all` (`DEC-02`), separate Strava dev app for local/preview testing, summary-only `per_page=50` initial import, and `< 2s` webhook enqueue-only pattern. | **Confirms `DEC-02` & `DEC-04`**. |
| **OpenRouter** | OpenRouter Docs & Free Models Policy (`openrouter.ai/docs`, `openrouter.ai/collections/free-models/`) | `:free` variants capped at **20 RPM** and **50 RPD** (< \$10 lifetime credits) or **1,000 RPD** (>= \$10 lifetime credits); upstream failed requests typically do not count toward daily cap; OpenRouter defaults to zero prompt storage when logging/training opt-ins are disabled, though upstream provider ZDR/retention policies vary. | Confirms context-fingerprint caching, per-user daily caps, deterministic non-AI fallback, and filtering/verifying upstream provider ZDR/data-policy settings before sending recovery/HR context. | **Confirms `ADR-005`** (no change to gateway choice). |

---

## 4. Background Worker Architecture Decision & Milestone 3 Spike (`DEC-04`)

- **Selected MVP Baseline:**
  - **Queue Storage:** PostgreSQL `sync_jobs` table (`pending`, `processing`, `retry_wait`, `completed`, `failed`).
  - **Job Claiming:** Atomic PostgreSQL RPC `claim_sync_jobs` (`FOR UPDATE SKIP LOCKED` + `lease_expires_at` reclaim).
  - **Job Execution:** Single Next.js TypeScript worker (`server/jobs/sync-worker.ts`) processing bounded batches (`per_page=50`), avoiding duplicate Node.js + Deno implementations.
  - **Guaranteed Triggers:** Webhook fast enqueue (`< 2s`), user-triggered `Sync Now`, and Vercel Hobby 1x/day Cron (`/api/cron/sync-reconcile`, authenticated with `CRON_SECRET`).
- **Isolated Milestone 3 Pre-Implementation Spike:**
  - Validate in live Supabase Free + Vercel Hobby whether **Supabase `pg_cron` + `pg_net.http_post()`** (calling `/api/cron/sync-worker` with secret header) passes all 6 measurable spike criteria (no active user session, concurrent claim exclusion, expired lease recovery, mid-batch failure durability, retry/webhook deduplication, live end-to-end free-tier proof). Next.js `after()` is explicitly **not** treated as a durable queue or guaranteed execution mechanism.
  - **Fallback if spike fails or proves brittle:** Operate strictly in **Webhook-Enqueue + 1x/Day Vercel Cron + Manual `Sync Now`** mode (no unverified continuous background execution claimed).

---

## 5. Remaining Risks & Outstanding Questions

1. **Supabase 7-Day Inactivity Pause:** If the user takes >7 days off without opening the app or triggering DB queries, Supabase Free pauses and Strava webhook deliveries fail until restored in Supabase Dashboard.
2. **Missing Visual Reference Asset:** The previously supplied three-smartphone mobile reference is not stored as an image file in the repo; `docs/DESIGN.md` codifies its structure textually, and Milestone 1 UI screens should be visually reviewed with the user during implementation (`antislop` `During` mode).
3. **OpenRouter `:free` Model Stability:** Available `:free` slugs and JSON-schema compliance shift periodically; Milestone 8 must run live contract tests against the chosen model ID before release.
4. **Provisional Training Defaults:** All numerical defaults in `docs/TRAINING_METHODOLOGY.md` (`DEC-06`) and TRIMP coefficients (`DEC-05`) are starting configurations requiring real-usage validation across Milestones 4-7.

---

## 6. Milestone 0 Acceptance Criteria Status

1. All 8 user decisions (`DEC-01`..`DEC-08`) reflected consistently: **PASS**
2. Zero unresolved Critical documentation contradictions: **PASS**
3. Zero unresolved High contradictions blocking Milestone 1: **PASS**
4. `ERD.md` and `DATABASE_SCHEMA.md` consistent: **PASS**
5. Business rules unambiguous: **PASS**
6. Training methodology defaults documented and configurable: **PASS**
7. Training load sources and estimation methods distinguishable: **PASS**
8. Strava OAuth scope (`activity:read_all`) consistent everywhere: **PASS**
9. Worker architecture has verified baseline + clearly isolated M3 spike: **PASS**
10. Design direction consistent across all documents: **PASS**
11. Root `AGENTS.md` exists and is usable: **PASS**
12. Milestone ordering consistent across roadmap, PRD, and checklist: **PASS**
13. Existing documentation remains inside `docs/`: **PASS**
14. No application source code, migrations, or npm dependencies created: **PASS**

---

## 7. Final Milestone 0 Documentation Remediation (2026-11-24)

Resolved five structural and precision findings prior to Milestone 1 approval:

1. **Cross-User Relational Integrity (`DATABASE_SCHEMA.md`, `ERD.md`, `ADR-002`):**
   - Added `UNIQUE (id, user_id)` on all parent tables (`runner_goals`, `strava_connections`, `activities`, `training_plans`, `training_phases`, `workouts`, `ai_coach_sessions`, `ai_recommendations`) and enforced composite `(referenced_id, user_id)` foreign keys across all child relationships (including `strava_connection_tokens -> strava_connections`, `training_phases -> training_plans`, `workouts -> training_plans`/`training_phases`/self, `workout_steps -> workouts`, `workout_activities -> workouts`/`activities`, `activity_streams -> activities`, `training_loads -> activities`, `ai_coach_messages -> ai_coach_sessions`, `ai_recommendations -> ai_coach_sessions`/`training_plans`, and `plan_adjustments -> training_plans`/`ai_recommendations`).
   - Used PostgreSQL 15+ column-scoped `ON DELETE SET NULL (<fk_col>)` on nullable composite FKs so deleting a parent clears only the nullable reference column and never attempts to null `user_id`.
2. **Background Worker Operational Guarantees (`SYSTEM_ARCHITECTURE.md`, `ADR-003`, `ADR-004`, `DEVELOPMENT_ROADMAP.md`, `IMPLEMENTATION_CHECKLIST.md`):**
   - Explicitly separated durable storage (`sync_jobs`), atomic claiming (`claim_sync_jobs`), worker execution (`server/jobs/sync-worker.ts`), and triggering/scheduling.
   - Added the 6 measurable M3 spike acceptance criteria, excluded Next.js `after()` as a durable execution guarantee, and codified the **Webhook-Enqueue + 1x/Day Vercel Cron + Manual `Sync Now`** MVP fallback.
3. **Database Constraint Audit (`DATABASE_SCHEMA.md`):**
   - Added explicit `CHECK` constraints for Strava vs. manual `external_activity_id` presence (while keeping `strava_connection_id` nullable for `ON DELETE SET NULL` history retention), `training_loads` `method`/`is_estimated`/`session_rpe` consistency, `training_plans`/`training_phases`/`performance_metrics` date ordering, `workouts` & `workout_steps` pace (`min <= max` in `sec_per_km`) and RPE (`min <= max`) ordering, `runner_profiles` HR ordering (`max_hr_bpm > resting_hr_bpm`), `strava_connection_tokens` owner consistency via composite FK, and `ai_recommendations` `plan_adjustment` plan/version requirements (`ON DELETE CASCADE` on `training_plan_id` to prevent check violations).
4. **Two-Layer Training Load Data Model (`DATABASE_SCHEMA.md`, `ERD.md`, `TRAINING_METHODOLOGY.md`, `DEVELOPMENT_ROADMAP.md`, `IMPLEMENTATION_CHECKLIST.md`):**
   - Separated strictly per-activity session loads (`training_loads`, `UNIQUE (activity_id)` updated in-place on RPE changes) from materialized per-day unmixed method aggregates and rolling 7-day acute / 28-day chronic snapshots (`daily_training_load_summaries`, `UNIQUE (user_id, summary_date)` recomputed forward deterministically).
5. **Training Methodology Refinement (`TRAINING_METHODOLOGY.md`):**
   - Formalized baseline sufficiency tiers (`sufficient`, `partial`, `sparse`), preserved `DEC-06` values explicitly as provisional configurable defaults, and documented Banister-style `hr_trimp_estimate` assumptions, confounders (optical HR lag, cadence lock, heat drift, uncalibrated HR bounds), and validation requirements against `srpe`.
