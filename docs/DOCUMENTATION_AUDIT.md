# Documentation Audit Report: Personal Running Coach

**Audit Date:** 2026-11-24  
**Scope:** Complete product, domain, database, architecture, integration, AI, methodology, design, security, deployment, and governance audit of all existing documentation in `docs/`.  
**Audit Mode:** Read-only review of existing files. No existing files were modified, renamed, moved, or deleted, and no application code or migrations were created.

---

## 1. Executive Summary

The Personal Running Coach documentation suite (18 Markdown documents in `docs/` and `docs/ADR/`) establishes a cohesive, well-reasoned product and technical baseline for a personal-use, AI-assisted adaptive running training platform. The core architectural decisions (Next.js App Router + TypeScript strict modular monolith, Supabase managed backend with PostgreSQL/Auth/RLS/Storage/Edge Functions, Strava hybrid synchronization, OpenRouter as the primary server-side AI gateway prioritizing free model variants, and Vercel Hobby + Supabase Free deployment) are aligned across the README, PRD, Architecture Decision Records (ADRs 001 to 005), System Architecture, AI specs, and Deployment Runbook.

However, the audit identified **material inconsistencies, missing implementation-level specifications, and operational risks** that should be resolved before initializing the codebase in Milestone 1:

1. **Design Direction Conflict (Critical):** The project prompt specifies *"Modern Gradient Athletic - Light First"* with *"bold blue-purple gradient highlights, rounded white cards, compact pill controls, and bottom tab navigation"* referencing an uploaded three-smartphone mockup that is **not present in the workspace**. Meanwhile, `docs/DESIGN.md` explicitly rejects neon/decorative gradients, specifies *"restrained athletic green or deep blue; choose one"*, mandates *"modest corner radius"*, and leaves concrete tokens undefined. This also intersects with `antislop` rules (`R-01`, `R-11`, `R-37`).
2. **Database Schema and ERD Gaps (High):** `sync_jobs` is defined in `docs/DATABASE_SCHEMA.md` but omitted from `docs/ERD.md`. Several features required by `PRD.md`, `TRAINING_METHODOLOGY.md`, `USER_FLOW.md`, and `AI_COACH_SPEC.md` lack schema support: `runner_profiles.timezone_name`, `preferred_training_days` / `unavailable_days`, HR zones, `personal_records`, OAuth `state` persistence, `ai_recommendations.training_plan_id` FK, `ON DELETE` foreign-key actions, and SQL partial unique constraints for `workout_activities` primary matching.
3. **Training Engine and Analytics Determinism Gaps (High):** While `TRAINING_METHODOLOGY.md` establishes sound high-level principles, it omits deterministic formulas/defaults required to implement Milestone 4 and Milestone 7: pace-zone calculation, phase allocation heuristics, default volume/progression guardrails, activity-to-workout matching rules, `training_loads` calculation when `session_rpe` is missing, and whether `missed` is a derived state or stored `workouts.status`.
4. **Strava and Free-Tier Operational Risks (High):** Dual runtime maintenance (Node.js on Vercel vs. Deno on Supabase Edge Functions), Strava's 2-second webhook response SLA vs. serverless cold starts, `activity:read` missing private ("Only You") Strava activities compared to `activity:read_all`, missing `STRAVA_WEBHOOK_SUBSCRIPTION_ID` and token encryption/storage isolation, historical stream-import rate-limit exhaustion, and Supabase Free's 7-day inactivity pause risk.
5. **Roadmap Sequencing Discrepancy (Medium):** `PRD.md` Section 12, `IMPLEMENTATION_CHECKLIST.md`, and the prompt's Milestone 0-9 framework order Strava, Training Engine, Recovery, and Analytics differently.

**Overall Readiness Assessment:** **Ready after minor corrections** (specifically: resolving the user-approval items in Section 20 and closing the missing deterministic/schema specifications prior to or at the start of each corresponding milestone).

---

## 2. Project Understanding

**Personal Running Coach** is a responsive web application built initially for personal use by one experienced recreational runner who tracks runs on Strava and wants structured, adaptive training grounded in actual data rather than static spreadsheets or raw activity logs.

Core value pillars:
- **Deterministic core, AI-assisted layer:** Training plan generation, pace/load calculations, business-rule enforcement, and safety validation are handled deterministically in TypeScript domain services and PostgreSQL constraints. AI (via OpenRouter) interprets weekly summaries, recovery context, and proposes structured adjustments.
- **Human-in-the-loop safety:** AI never executes SQL, never mutates the database directly, and never modifies an active training plan without explicit user approval and server-side revalidation.
- **Honest data handling:** Missing data stays `NULL` (never coerced to zero), planned workouts remain separate from actual Strava activities (`workout_activities` link table), missed workouts never auto-roll forward, and readiness/load metrics are presented with limitations rather than medical claims.
- **Free-first personal cloud baseline:** Designed to run at Rp0/\$0 per month on Vercel Hobby + Supabase Free + OpenRouter free model variants while maintaining strict `user_id` ownership and RLS so the architecture does not hard-lock to a single user.

---

## 3. Workspace and Documentation Inventory

Inspection of `/Users/fadhel/Documents/Project /personal-running-coach` confirms the application has **not** been initialized yet. No `package.json`, `app/`, `src/`, `supabase/`, or root governance files (`AGENTS.md`, `README.md`) exist. Only `.DS_Store` and `docs/` are present at the workspace root.

All project documentation resides inside `docs/`:

| Path | Size / Lines | Last / Status Notes | Access Status |
|---|---|---|---|
| `docs/README.md` | 65 lines | Baseline index & final decisions (2026-11-24) | Read in full |
| `docs/PRD.md` | 313 lines | Product baseline, 20 FRs, NFRs, scope | Read in full |
| `docs/BUSINESS_RULES.md` | 122 lines | Authoritative domain rules (`BR-001` to `BR-099`) | Read in full |
| `docs/TRAINING_METHODOLOGY.md` | 179 lines | Endurance principles, taxonomy, RPE, safety | Read in full |
| `docs/USER_FLOW.md` | 118 lines | 10 core user & system journeys | Read in full |
| `docs/ERD.md` | 74 lines | Logical Mermaid ERD & 20 entity descriptions | Read in full |
| `docs/DATABASE_SCHEMA.md` | 462 lines | PostgreSQL tables, indexes, RLS, conventions | Read in full |
| `docs/SYSTEM_ARCHITECTURE.md` | 327 lines | Modular monolith, Strava, OpenRouter, security | Read in full |
| `docs/AI_COACH_SPEC.md` | 245 lines | AI Coach workflow, I/O contracts, validation | Read in full |
| `docs/AI_PROVIDER_STRATEGY.md` | 129 lines | OpenRouter strategy, quotas, privacy (2026-11-24) | Read in full |
| `docs/DEPLOYMENT_RUNBOOK.md` | 148 lines | Vercel Hobby + Supabase Free runbook | Read in full |
| `docs/DESIGN.md` | 207 lines | Visual principles, IA, components, a11y | Read in full |
| `docs/IMPLEMENTATION_CHECKLIST.md` | 116 lines | Milestone 0-9 execution checklist | Read in full |
| `docs/ADR/ADR-001-application-architecture.md` | 17 lines | Accepted: Modular monolith in Next.js + Supabase | Read in full |
| `docs/ADR/ADR-002-database-strategy.md` | 15 lines | Accepted: PostgreSQL, SQL migrations, RLS | Read in full |
| `docs/ADR/ADR-003-integration-strategy.md` | 28 lines | Accepted: Strava hybrid + OpenRouter | Read in full |
| `docs/ADR/ADR-004-deployment-strategy.md` | 27 lines | Accepted: Vercel Hobby + Supabase Free | Read in full |
| `docs/ADR/ADR-005-openrouter-ai-gateway.md` | 27 lines | Accepted: OpenRouter primary AI gateway | Read in full |

---

## 4. Documents Reviewed

- **Successfully reviewed:** **18 of 18** Markdown documents inside `docs/` and `docs/ADR/`.
- **Could not be accessed:** **0 files** inside the repository.
- **External / unprovided reference noted:** The user prompt (Section 8.8) references *"the user's uploaded three-smartphone reference"* for mobile UI layout. No image or visual reference file exists in the repository or was attached in this session.

---

## 5. Confirmed Product Decisions

Confirmed across `PRD.md`, `BUSINESS_RULES.md`, `TRAINING_METHODOLOGY.md`, `USER_FLOW.md`, and `README.md`:
1. **Audience & Scope:** Personal-use application for one primary experienced recreational runner, architected with `user_id` ownership so multi-user isolation holds via RLS.
2. **Core Modules (MVP):** Auth/workspace, Runner Profile & Baseline Assessment, Goal Management, Training Plan Engine, Training Calendar, Strava Activity Management, Performance Analytics, Manual Recovery Check-in, AI Adaptive Running Coach, and Audit/Sync Logging.
3. **One Active Plan & One Active Primary Goal:** Enforced atomically (`BR-010`, `BR-011`, `BR-018`) and preserved historically (`BR-013`). Terminal plan statuses (`completed`, `cancelled`) require cloning/revision rather than reopening.
4. **Planned vs. Actual Separation:** `workouts` and `activities` are distinct entities linked via `workout_activities` (`BR-020`, `BR-025`). Unlinking never deletes either record (`BR-027`).
5. **Missed Workout Policy:** Missed workouts never auto-roll forward to the next day or create double sessions (`BR-023`, `TRAINING_METHODOLOGY.md` Section 9).
6. **Honest Missing Data:** Unknown baseline, recovery, or metric values are stored as `NULL`, never zero (`BR-003`, `BR-061`). Incomplete analytics must disclose limitations (`BR-051`).
7. **Human Control Over AI:** Every AI plan adjustment requires explicit user approval and deterministic server-side revalidation (`BR-074`, `BR-076`). AI provides no medical diagnoses (`BR-065`, `BR-078`).
8. **Canonical Units & Time:** Distance in meters, duration in seconds, weight in kilograms, timestamps in UTC `timestamptz` (`README.md`, `DATABASE_SCHEMA.md`).

---

## 6. Confirmed Technical Decisions

Confirmed across `ADR-001` to `ADR-005`, `SYSTEM_ARCHITECTURE.md`, `AI_PROVIDER_STRATEGY.md`, `DEPLOYMENT_RUNBOOK.md`, and the prompt baseline:
1. **Application Stack:** Next.js App Router, React, TypeScript strict mode, Tailwind CSS, shadcn/ui, Recharts, Lucide React, Zod, ESLint, Prettier, Vitest, Playwright.
2. **Architecture:** Modular monolith (`app/` thin transport layer, `server/domain/` core business logic, `server/integrations/` adapters). No Laravel, separate permanent backend, Prisma, Redis, or always-on worker server for MVP.
3. **Database & Backend:** Supabase PostgreSQL (UUID PKs, SQL migrations via Supabase CLI, generated TypeScript types, RLS on all user-owned tables), Supabase Auth (`@supabase/ssr`), Supabase Storage, Supabase Edge Functions, Supabase Queues / DB-backed `sync_jobs`, optional Supabase Cron.
4. **Strava Sync Strategy:** Hybrid sync: OAuth2 (`activity:read` baseline in prompt; see conflict on private runs), server-side encrypted tokens, 5-minute refresh buffer, page size 50, max 5 retry attempts (30s / 60s / 120s staged backoff), 429 `Retry-After` handling, 401 reauthorization flow, lightweight webhook enqueueing, user-triggered manual `Sync Now` queue drain, and optional daily reconciliation.
5. **AI Strategy:** OpenRouter OpenAI-compatible API (`https://openrouter.ai/api/v1`) as the sole production AI gateway (`ADR-005`), server-side `OPENROUTER_API_KEY`, configurable `OPENROUTER_MODEL` and optional fallback, free model variants prioritized without silent paid fallback, Zod output validation, and deterministic fallback when AI is unavailable. No direct Gemini SDK or production 9Router dependency.
6. **Hosting Target:** Vercel Hobby + Supabase Free (Rp0/month target, explicitly subject to provider quotas, inactivity rules, and non-commercial terms).

---

## 7. Documentation Consistency Review

| Area | Consistency Status | Observations |
|---|---|---|
| **Product Vision & Principles** | Strong | `README.md`, `PRD.md`, `BUSINESS_RULES.md`, `TRAINING_METHODOLOGY.md`, and `DESIGN.md` share identical principles. |
| **AI Strategy** | Strong | `ADR-005`, `AI_PROVIDER_STRATEGY.md`, `AI_COACH_SPEC.md`, `SYSTEM_ARCHITECTURE.md`, and `DEPLOYMENT_RUNBOOK.md` are all updated to 2026-11-24 with OpenRouter primary and zero 9Router/Gemini Direct references. |
| **Strava Hybrid Sync** | Mostly consistent | `ADR-003`, `USER_FLOW.md`, `SYSTEM_ARCHITECTURE.md`, `BUSINESS_RULES.md`, and `DEPLOYMENT_RUNBOOK.md` align on webhook enqueue + manual `Sync Now` + optional daily reconciliation. Queue mechanism (`pgmq` vs `sync_jobs`) remains open. |
| **Database ERD vs Schema** | Partial mismatch | `DATABASE_SCHEMA.md` has 20 tables (`sync_jobs` included); `ERD.md` omits `sync_jobs`. Multiple PRD/Flow fields are missing from `DATABASE_SCHEMA.md`. |
| **Workout Status & Lifecycle** | Minor ambiguity | `missed` / `unresolved` appears in `PRD.md`, `TRAINING_METHODOLOGY.md`, and `USER_FLOW.md`, while `BUSINESS_RULES.md` and `DATABASE_SCHEMA.md` list only `planned`, `completed`, `skipped`, `rescheduled`, `modified`. |
| **Design System** | Contradictory | Prompt Section 8.8 ("Modern Gradient Athletic - Light First", blue-purple gradient, rounded white cards, compact pill controls, bottom nav) conflicts with `docs/DESIGN.md` (no neon gradients, athletic green or deep blue, modest radius). |
| **Implementation Sequencing** | Divergent | Three milestone orderings exist across `PRD.md` Section 12, `IMPLEMENTATION_CHECKLIST.md`, and Prompt Section 12. |

---

## 8. Critical Findings

1. **CF-01 - Unresolved Visual Direction Conflict and Missing Reference Asset:** `docs/DESIGN.md` explicitly warns against neon/gradient aesthetics and pairs a calm neutral palette with *"restrained athletic green or deep blue"*, directly contradicting the prompt's *"Modern Gradient Athletic - Light First"* with *"bold blue-purple gradient highlights"*, *"rounded white cards"*, and *"compact pill controls"*. In addition, the referenced *"three-smartphone reference"* does not exist in the repository, leaving mobile dashboard hierarchy ambiguous and risking `antislop` `R-01`/`R-11`/`R-37` violations.
2. **CF-02 - Supabase Free 7-Day Inactivity Pause vs. Strava Webhooks:** Under Supabase Free, projects pause after prolonged inactivity (historically 7 days). If the user travels or rests without opening the app, Strava webhook `POST` deliveries to Vercel will fail to enqueue into the paused PostgreSQL database, risking Strava disabling the webhook subscription and silently dropping activities until manual recovery.
3. **CF-03 - Strava `activity:read` Scope Excludes Private ("Only You") Activities:** Prompt Section 5 specifies `activity:read`. In Strava's OAuth model, `activity:read` cannot read activities whose privacy is set to "Only You". If the runner keeps training runs private on Strava, sync will silently import zero private activities unless `activity:read_all` is requested.
4. **CF-04 - Client-Accessible Encrypted Tokens in `strava_connections`:** `DATABASE_SCHEMA.md` places `access_token_ciphertext` and `refresh_token_ciphertext` directly on `strava_connections` and enforces RLS (`auth.uid() = user_id`), relying only on query discipline ("never select token columns in browser-facing queries"). Any authenticated browser client holding `NEXT_PUBLIC_SUPABASE_ANON_KEY` and a user session JWT could call PostgREST directly to fetch those columns unless table/column privileges revoke `SELECT` or tokens live in a service-role-only table.
5. **CF-05 - Missing Schema Columns Required by MVP Flows:** `runner_profiles` lacks `timezone_name` (needed for daily `recovery_logs` local date, activity-to-workout date matching, and AI context) and `preferred_training_days` / `unavailable_days` (needed by the Training Plan Engine). `ai_recommendations` lacks a `training_plan_id` FK (making `based_on_plan_version` ambiguous across plans).

---

## 9. Conflict Register

Conflicts are categorized strictly by nature: **Contradiction**, **Missing Specification**, **Technical Risk**, or **Optional Improvement**.

### A. Actual Contradictions

| ID | Affected Docs | Exact Topic | Existing Statements / Requirements | Why It Matters | Potential Implementation Impact | Recommended Resolution | Approval Required? | Severity |
|---|---|---|---|---|---|---|---|---|
| **CONF-01** | `docs/DESIGN.md` vs. Prompt Sec 8.8 vs. `antislop` (`R-01`, `R-11`, `R-37`) | Visual direction, gradients, corner radius, pill controls | `DESIGN.md` (lines 16, 32, 49): *"Avoid neon gradients"*, *"restrained athletic green or deep blue; choose one"*, *"Modest corner radius"*. Prompt 8.8: *"Modern Gradient Athletic - Light First"*, *"Bold blue-purple gradient highlights"*, *"Rounded white cards"*, *"Compact pill controls"*. | Developers and UI components cannot implement two opposing palettes, radius systems, and card styles simultaneously. | Rework of all Tailwind/shadcn design tokens, chart palettes, and mobile dashboard components in Milestone 1+. | Update `DESIGN.md` to explicitly adopt **Modern Gradient Athletic - Light First** with documented hierarchy purpose for the blue-purple gradient (per `antislop` R-01/R-37) and defined radius hierarchy (per R-11), OR confirm keeping `DESIGN.md`'s calm green/blue direction. Also supply the missing 3-smartphone reference. | **Yes** | **Critical** |
| **CONF-02** | `docs/DATABASE_SCHEMA.md` vs. `docs/ERD.md` | `sync_jobs` entity & connection FK naming | `DATABASE_SCHEMA.md` defines `sync_jobs` (lines 377-395) and uses `strava_connection_id` on `activities` (line 85) vs `connection_id` in index checklist (line 417). `ERD.md` omits `sync_jobs` entirely. | `ERD.md` and `DATABASE_SCHEMA.md` are both baseline design specs; missing `sync_jobs` misrepresents the queue data model. | Schema generation mistakes or missed RLS/migration steps for `sync_jobs`. | Add `SYNC_JOBS` to `ERD.md` (linked to `USERS`) and standardize `strava_connection_id` vs `connection_id` in `DATABASE_SCHEMA.md` line 417. | No | **High** |
| **CONF-03** | `docs/PRD.md`, `docs/TRAINING_METHODOLOGY.md`, `docs/USER_FLOW.md` vs. `docs/BUSINESS_RULES.md`, `docs/DATABASE_SCHEMA.md`, `docs/DESIGN.md` | Workout `missed` / `unresolved` status | `PRD.md` (161), `TRAINING_METHODOLOGY.md` (141), `USER_FLOW.md` (57) refer to marking past uncompleted workouts as `missed`/`unresolved`. `BUSINESS_RULES.md` (BR-022), `DATABASE_SCHEMA.md` (183), and `DESIGN.md` (85) restrict `workouts.status` strictly to `planned`, `completed`, `skipped`, `rescheduled`, `modified`. | Affects DB `CHECK` constraint, calendar badge rendering, adherence analytics, and AI Coach context counts (`missed_sessions`). | Mismatched DB constraint rejections or inconsistent missed-workout detection across calendar and analytics. | Formally define `missed` as a **derived presentation/query state** (`status = 'planned' AND scheduled_date < runner_local_today`) while keeping stored DB status values as `planned/completed/skipped/rescheduled/modified`, OR add `missed` to the DB enum. | **Yes** | **High** |
| **CONF-04** | `docs/PRD.md` Sec 12 vs. `docs/IMPLEMENTATION_CHECKLIST.md` vs. Prompt Sec 12 | Development milestone ordering | `PRD.md` orders: Plan -> Strava -> Analytics/Recovery -> AI. `IMPLEMENTATION_CHECKLIST.md` orders: Auth -> Profile -> Engine -> Calendar -> Strava -> Analytics/Recovery -> AI. Prompt Sec 12 orders: Strava (M3) -> Engine (M4) -> Calendar (M5) -> Recovery (M6) -> Analytics (M7) -> AI (M8). | Sequencing determines whether Strava baseline data exists when building the Training Plan Engine and Calendar matching. | Building Calendar/Engine before Strava forces temporary mocks for matching and baseline import; inconsistent tracking across docs. | Adopt Prompt Sec 12 ordering (Strava in M3 before Plan Engine M4 and Calendar M5) in `DEVELOPMENT_ROADMAP.md` and reconcile `IMPLEMENTATION_CHECKLIST.md` / `PRD.md` after approval. | **Yes** | **Medium** |
| **CONF-05** | `docs/DATABASE_SCHEMA.md` line 77 & 107 vs. `docs/BUSINESS_RULES.md` BR-030, BR-031 | Activity deduplication across reconnections | `DATABASE_SCHEMA.md` deduplicates `activities` on `(strava_connection_id, provider, external_activity_id)`, while allowing disconnected `strava_connections` rows and specifying "one active connection per user/provider". | If disconnecting and reconnecting creates a new `strava_connections` row, re-importing history creates duplicate `activities` rows for the same Strava activity ID. | Duplicate runs, inflated mileage, and broken PR/load analytics after a reconnect. | Change unique constraint to `(user_id, provider, external_activity_id)` AND/OR upsert `strava_connections` on `(user_id, provider, provider_athlete_id)` when reconnecting. | No (technical fix) | **High** |
| **CONF-06** | `docs/SYSTEM_ARCHITECTURE.md` Sec 10 vs. `docs/AI_PROVIDER_STRATEGY.md` Sec 2 vs. `docs/DEPLOYMENT_RUNBOOK.md` Sec 5 | Required environment variables | `SYSTEM_ARCHITECTURE.md` lists 11 env vars (no `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`, or `AI_*` budget vars). `AI_PROVIDER_STRATEGY.md` adds those 5 vars. `DEPLOYMENT_RUNBOOK.md` omits `AI_*` vars. None list `STRAVA_WEBHOOK_SUBSCRIPTION_ID`. | Incomplete `.env.example` and Vercel/Supabase secret setup during Milestone 1 and Milestone 9. | Missing runtime config for timeouts, daily AI caps, or webhook subscription validation. | Consolidate a single canonical environment variable table across `SYSTEM_ARCHITECTURE.md` and `DEPLOYMENT_RUNBOOK.md`. | No | **Low** |
| **CONF-07** | `docs/USER_FLOW.md` line 93 vs. `docs/DATABASE_SCHEMA.md` lines 69-71 | Nullability of Strava tokens on disconnect | `USER_FLOW.md` says disconnect *"deletes/invalidates local credentials"*. `DATABASE_SCHEMA.md` marks `access_token_ciphertext`, `refresh_token_ciphertext`, and `token_expires_at` non-nullable. | Cannot clear tokens while retaining `strava_connections` row with `status = 'disconnected'`. | Migration failure or forced deletion of connection row (breaking `activities.strava_connection_id` FK). | Make token columns nullable (when `status = 'disconnected'`) or move tokens to a separate deletable `strava_connection_tokens` table. | No | **Medium** |
| **CONF-08** | `docs/README.md` line 51 & `docs/DATABASE_SCHEMA.md` line 8 vs. Table Definitions | Weight canonical unit (`kilograms`) | Both docs declare *"berat dalam kilogram"* / *"Canonical units: meters, seconds, kilograms"*, yet no table has a weight column. | Minor spec drift between global conventions and schema. | None in MVP unless weight tracking is added later; causes confusion during schema review. | Either note kilograms applies to optional future body metrics or add optional `weight_kg` to `runner_profiles` if needed for calorie/metric context. | No | **Low** |

### B. Missing Specifications (Key Entries; full catalog in Section 10)

| ID | Affected Docs | Exact Topic | Gap Summary | Impact | Recommended Resolution | Approval? | Severity |
|---|---|---|---|---|---|---|---|
| **MISS-01** | `TRAINING_METHODOLOGY.md`, `PRD.md` | Deterministic Plan Engine algorithms | No formulas/defaults for pace zone derivation, phase-week splitting, progression guardrails, deload cadence, or HR zone formula. | Milestone 4 cannot be coded deterministically without guessing training logic. | Define configurable baseline defaults (e.g., VDOT/threshold % pace bands, phase split table, deload cadence, min hard-session spacing) in an Engine spec before M4. | **Yes** | **High** |
| **MISS-02** | `DATABASE_SCHEMA.md`, `TRAINING_METHODOLOGY.md` | Training load without `session_rpe` & rolling formulas | `sRPE = duration × RPE` is the primary load method, yet Strava sync does not supply `session_rpe`, no RPE UI flow exists, and `acute_load` / `chronic_load` window formulas (7d/28d SMA vs EWMA) are undefined. | `training_loads` table will stay empty or inconsistent after Strava sync. | Add post-run RPE input on activity/workout completion + define fallback load metric (e.g., HR-zone TRIMP or duration proxy, clearly labeled) + document 7d/28d rolling/EWMA math. | **Yes** | **High** |
| **MISS-03** | `DATABASE_SCHEMA.md`, `PRD.md`, `USER_FLOW.md` | Missing `runner_profiles` & `ai_recommendations` fields | Missing `timezone_name`, `preferred_training_days` / `unavailable_days`, `max_hr_bpm` / `hr_zones`, `personal_records` provenance, and `ai_recommendations.training_plan_id` FK. | Breaks local-date check-ins, plan generation day scheduling, HR analytics, PR tracking, and stale proposal checks. | Add these columns/tables before Milestone 2/4 schema migrations. | No (schema completion) | **High** |
| **MISS-04** | `BUSINESS_RULES.md`, `DATABASE_SCHEMA.md` | Automatic workout matching & Strava delete impact | No matching algorithm (date/distance/sport heuristics or confidence formula) and no rule for what happens to a `completed` workout when its matched Strava activity is deleted at Strava. | Inconsistent auto-matching and orphaned `completed` statuses. | Define deterministic matching score rules and specify whether Strava deletion reverts workout status or flags it. | **Yes** | **Medium** |
| **MISS-05** | `SYSTEM_ARCHITECTURE.md`, `DATABASE_SCHEMA.md` | OAuth `state` persistence & token encryption spec | State storage mechanism (`oauth_states` table vs signed cookie) and encryption spec (AES-256-GCM, IV/tag format, key rotation) are unspecified. | Security vulnerability or broken OAuth callback across serverless instances. | Specify AES-256-GCM format and short-lived DB `oauth_states` table (or signed HTTP-only cookie bound to user ID) prior to M3. | No | **Medium** |
| **MISS-06** | `AI_COACH_SPEC.md` | Chat output schema, recommendation expiry, manual plan edits | Chat Q&A has no response schema or history truncation rule; `expires_at` has no default TTL; unclear if manual calendar edits bump `plan_version`. | Unbounded token usage in chat, recommendations never expiring, or stale AI proposals applying after manual edits. | Define chat response contract, default recommendation TTL (e.g., 7 days / end of week), and bump `plan_version` on any schedule/target mutation. | No | **Medium** |

### C. Technical Risks

| ID | Affected Docs | Exact Topic | Risk Description | Impact | Mitigation / Resolution | Approval? | Severity |
|---|---|---|---|---|---|---|---|
| **RISK-01** | `DEPLOYMENT_RUNBOOK.md`, `SYSTEM_ARCHITECTURE.md`, `ADR-004` | Supabase Free 7-day inactivity pause | Idle personal project pauses; Strava webhook `POST` fails; Strava may deactivate webhook subscription. | Silent sync outage after rest weeks or travel. | Document manual wake-up + webhook status health check + `Sync Now` incremental fallback; consider lightweight legitimate personal usage or upgrade trigger if needed. | No | **High** |
| **RISK-02** | `SYSTEM_ARCHITECTURE.md`, `ADR-003`, Prompt Sec 5 | Strava `activity:read` missing private runs | `activity:read` cannot fetch "Only You" Strava activities. | Missing activities if runner logs privately. | Recommend switching baseline scope to `activity:read_all` (with user consent explanation). | **Yes** | **High** |
| **RISK-03** | `SYSTEM_ARCHITECTURE.md`, `DEPLOYMENT_RUNBOOK.md` | Dual runtime (Vercel Node.js + Supabase Deno Edge Functions) | Sharing TypeScript domain code, Zod schemas, Strava client, and AES-GCM token crypto across Next.js and Deno Edge Functions adds friction and duplication risk. | Maintenance overhead and potential drift between manual Next.js sync and Edge Function worker. | Choose one canonical worker execution host for MVP (e.g., Next.js Route Handlers for webhook enqueue + bounded `Sync Now` worker, using Supabase Edge Function only if scheduled Cron invokes it, or sharing pure TS modules). | **Yes** | **Medium** |
| **RISK-04** | `SYSTEM_ARCHITECTURE.md`, `DEPLOYMENT_RUNBOOK.md` | Strava historical streams & API rate limits | Fetching streams/detail for every historical run hits Strava 15-min rate limits and serverless timeouts. | Partial/failed initial import. | Limit initial import to activity summaries (page size 50), and lazy-fetch detail/streams only on activity view or for the most recent 4-8 weeks. | No | **High** |
| **RISK-05** | `AI_PROVIDER_STRATEGY.md`, `DEPLOYMENT_RUNBOOK.md` | OpenRouter free model latency/availability vs. Vercel Hobby timeouts | `AI_REQUEST_TIMEOUT_MS=30000` with retry + fallback can exceed Vercel Hobby serverless execution timeout; free models may drop structured-output support or throttle at 20 RPM / 50 RPD. | 504 Gateway Timeout on Weekly Review or frequent AI fallback states. | Keep timeout + 1 fast fallback within Vercel function budget (e.g., 15-20s primary, max 1 fallback attempt, no multi-attempt sleep loops inside synchronous Server Actions). | No | **Medium** |

### D. Optional Improvements

1. **IMP-01 (Design Tokens File):** Add a concrete token section (`colors`, `font-family`, `type scale`, `radius`, `elevation`, `dials`) to `docs/DESIGN.md` once direction is confirmed.
2. **IMP-02 (Pgmq vs `sync_jobs` Decision):** Commit solely to the PostgreSQL `sync_jobs` table for MVP (`SELECT ... FOR UPDATE SKIP LOCKED` via RPC) rather than keeping `pgmq` as an undecided parallel option, reducing extension/ops surface.
3. **IMP-03 (Split `strava_connection_tokens`):** Separate encrypted OAuth tokens from `strava_connections` metadata so browser RLS queries can read connection status without ever having table access to ciphertext columns.
4. **IMP-04 (`workout_steps` Type Parity):** Expand `workout_steps.step_type` to support `strides`, `steady`, or `rest` intervals cleanly if needed by `TRAINING_METHODOLOGY.md`.

### E. Decisions Requiring User Approval

Explicitly consolidated in **Section 20** (Design Direction & Missing Mockup, Strava `activity:read_all` scope, `missed` workout status modeling, Worker runtime consolidation, Plan Engine algorithmic defaults, Training load fallback when RPE is missing, Milestone ordering alignment, and `antislop` Usage Mode).

---

## 10. Missing Specifications

Consolidated list of specifications needed before or during implementation:

1. **Concrete Design Tokens & Missing Reference Asset (`DESIGN.md`):** Hex palette, typography choices, spacing/radius scale, dark mode policy (Prompt specifies Light First; confirm no dark toggle for MVP), and the missing 3-smartphone mobile reference.
2. **Runner Profile & Availability Fields (`DATABASE_SCHEMA.md`):** `timezone_name` (IANA), `preferred_training_days` / `unavailable_days`, optional `max_hr_bpm` / `lthr_bpm` / `hr_zones`, structured injury/limitation flags, and `personal_records` table or structured storage with activity verification provenance.
3. **Database Foreign Key Cascade Rules & Partial Indexes (`DATABASE_SCHEMA.md`):** Explicit `ON DELETE` rules (`CASCADE`, `SET NULL`, `RESTRICT`) for every FK, plus partial unique indexes on `workout_activities (workout_id) WHERE is_primary = true` and `(activity_id) WHERE is_primary = true`.
4. **OAuth `state` Persistence & Token Encryption Format (`SYSTEM_ARCHITECTURE.md`):** Table or signed cookie specification for CSRF `state`, plus AES-256-GCM key format, IV/tag encoding, and rotation strategy.
5. **Strava Webhook Signature/Verification & Subscription Env Var (`SYSTEM_ARCHITECTURE.md`, `DEPLOYMENT_RUNBOOK.md`):** Document `STRAVA_WEBHOOK_SUBSCRIPTION_ID` verification on `POST` events (since Strava `POST` webhooks do not use HMAC signatures) and production vs. preview app separation (1 webhook subscription per Strava client ID).
6. **Historical Import Depth Policy (`SYSTEM_ARCHITECTURE.md`):** Default lookback window (e.g., all summaries vs. last 6-12 months) and lazy-loading policy for `activity_streams`.
7. **Deterministic Plan Engine Parameters (`TRAINING_METHODOLOGY.md`):** Pace-zone derivation formula, phase duration ratios, minimum/maximum plan length, weekly volume ramp cap, deload frequency, long-run cap, and hard-session spacing rules (minimum hours/days between quality workouts).
8. **Auto-Matching Algorithm & Strava Delete Policy (`BUSINESS_RULES.md`):** Matching criteria (sport types included as running, date tolerance in local timezone, distance/duration similarity thresholds for `match_confidence`) and behavior on `workouts.status` if a matched Strava activity is deleted remotely.
9. **Training Load Calculation & RPE Capture (`TRAINING_METHODOLOGY.md`, `USER_FLOW.md`):** Post-run RPE entry UX, fallback calculation when `session_rpe` is `NULL`, and exact `acute_load` / `chronic_load` formulas (7-day / 28-day rolling or EWMA).
10. **AI Conversational Schema, TTL, & Plan Versioning (`AI_COACH_SPEC.md`):** Output schema for `chat` sessions, context window limits for conversation history, default `ai_recommendations.expires_at` TTL, and rule on whether manual workout modifications increment `training_plans.plan_version`.
11. **Data Export & Account Deletion Mechanics (`USER_FLOW.md`, `PRD.md`):** Export file format (JSON/CSV bundle), scope of exported tables, and deletion execution path (Supabase Admin API `auth.admin.deleteUser` + cascade + Strava deauthorization call).

---

## 11. Database Design Review

### Strengths
- Strong relational modeling (`UUID` PKs, UTC `timestamptz`, canonical `meters`/`seconds`, `NULL` for unknown values).
- Explicit separation of `workouts` (planned) and `activities` (actual) via `workout_activities`.
- Solid partial unique index requirements for one active `training_plans` row and one active primary `runner_goals` row per user.
- Comprehensive auditability (`plan_adjustments`, `audit_logs`, `sync_logs`, `ai_recommendations` metadata).
- Explicit RLS baseline across all user-owned tables, tested with two distinct user identities.

### Issues Identified
1. **`ERD.md` vs `DATABASE_SCHEMA.md` Drift:** `sync_jobs` is missing from `ERD.md`.
2. **Missing Columns & Tables:**
   - `runner_profiles`: needs `timezone_name`, `preferred_training_days` (`smallint[]` or `jsonb`), `max_hr_bpm`, `lthr_bpm`, `hr_zones_jsonb` (or table), and `personal_records` entity.
   - `ai_recommendations`: needs `training_plan_id uuid FK` alongside `based_on_plan_version`.
   - `activities`: needs `session_rpe` (or link to effort input) and `strava_connection_id` nullable if history survives connection deletion; unique key should be `(user_id, provider, external_activity_id)` to prevent duplicates across reconnects.
   - `oauth_states` (if DB-backed): `id`, `user_id`, `state_hash`, `expires_at`, `created_at`.
3. **Token Security Boundary:** Storing `access_token_ciphertext` and `refresh_token_ciphertext` inside a user-selectable RLS table (`strava_connections`) exposes ciphertext to PostgREST queries by the logged-in user. Moving tokens to a `strava_connection_tokens` table with RLS enabled and **zero** policies for `authenticated`/`anon` (accessible only via `service_role` on the server) eliminates accidental exposure.
4. **Missing SQL Constraints:**
   - `workout_activities` needs partial unique indexes for `is_primary = true` on both `workout_id` and `activity_id`.
   - `workouts.workout_type` lacks a `CHECK` constraint aligned with the 12 types in `TRAINING_METHODOLOGY.md`.
   - `ON DELETE` clauses are omitted throughout `DATABASE_SCHEMA.md`.
   - `DATABASE_SCHEMA.md` has duplicate heading numbering (`## 5.` appears twice at lines 446 and 456).
5. **Nullable Columns on Disconnect:** `strava_connections` token columns must be nullable if tokens are cleared on disconnect (`USER_FLOW.md` line 93).
6. **Table Growth / Supabase Free 500 MB DB Limit:** `activity_streams.data` (`jsonb`) can grow rapidly if high-resolution GPS/HR streams (`latlng`, `heartrate`, `velocity_smooth`) are stored in PostgreSQL for hundreds of runs. `DATABASE_SCHEMA.md` line 118 wisely notes *"consider object storage for large payload"*; for MVP on Supabase Free, avoid importing high-resolution streams into PostgreSQL by default, or store stream blobs in Supabase Storage if needed later.

---

## 12. Architecture Feasibility Review

| Component | Classification | Assessment |
|---|---|---|
| **Next.js App Router + TS strict modular monolith** | Confirmed & Feasible | Well-suited for a solo developer. Keeping `app/` thin and domain logic in `server/domain/` prevents tight coupling to framework transport. |
| **Supabase PostgreSQL + Auth + RLS** | Confirmed & Feasible | Ideal relational fit. Standard `@supabase/ssr` pattern works cleanly with Next.js Server Components and Server Actions. |
| **DB-backed `sync_jobs` queue (`FOR UPDATE SKIP LOCKED`)** | Technically Feasible (Preferred over `pgmq`) | Avoids extra extension complexity while supporting atomic leasing, `attempts`, `run_after`, and dead-letter states directly in PostgreSQL RPCs. |
| **Dual Runtime Worker (Vercel Node + Supabase Edge Functions)** | **Requires Implementation Validation** | Maintaining Strava API client, Zod schemas, and AES-GCM encryption across both Next.js (Node) and Supabase Edge Functions (Deno) increases complexity. For a personal MVP triggered mainly by `Sync Now` (and optional daily cron), executing bounded sync jobs via a Next.js Route Handler / server service (or isolating Deno solely if Supabase Cron triggers it) is simpler to maintain. |
| **Supabase Cron / Vercel Cron** | **Requires Provider Verification** | Free-tier Cron availability, minimum intervals, and Vercel Hobby invocation limits change over time. Treating scheduled reconciliation as optional/best-effort while relying on webhook enqueue + manual `Sync Now` is architecturally sound. |
| **Vercel Hobby Serverless Timeouts vs. AI + Sync** | **Requires Implementation Validation** | Long synchronous AI calls or multi-page Strava imports inside a single Server Action can hit Vercel Hobby function timeouts. Enforce bounded batches (e.g., 1-2 pages per `Sync Now` invocation with UI progress/continuation) and strict AI timeouts. |
| **OpenRouter Free-Tier Gateway** | Technically Feasible with Guardrails | Server-side OpenAI-compatible adapter cleanly isolates model switching, provided rate limits, timeouts, Zod validation, and deterministic fallback are implemented. |

---

## 13. Strava Integration Review

### Well-Specified Areas
- Hybrid model (webhook enqueue + user `Sync Now` + optional daily reconciliation) avoids reliance on continuous background workers.
- OAuth2 server-side exchange, CSRF `state` check, 5-minute refresh buffer, HTTP 429 `Retry-After` handling, HTTP 401 reauthorization marking, page size 50, max 5 attempts (30/60/120s backoff), and idempotent upserts via external activity ID are solid.

### Gaps & Failure Modes to Address
1. **Webhook 2-Second Response Requirement:** Strava's webhook specification requires `200 OK` within 2 seconds. The Next.js Route Handler at `/api/webhooks/strava` must ONLY validate `subscription_id`/payload shape, insert into `sync_jobs` (ignoring duplicate `idempotency_key`), and return `200 OK` immediately. Never refresh tokens or call Strava API inline inside the webhook handler.
2. **Webhook Authenticity Verification:** Add `STRAVA_WEBHOOK_SUBSCRIPTION_ID` verification on incoming `POST` events and match `owner_id` against `strava_connections.provider_athlete_id`.
3. **Scope `activity:read` vs `activity:read_all`:** `activity:read` omits private ("Only You") Strava activities. Confirm with the user whether `activity:read_all` should be used.
4. **Update/Delete Semantics (`aspect_type`):**
   - `update` events may change title, sport_type (e.g., Run -> Ride or vice versa), or privacy. Ensure `sport_type` change re-evaluates whether the activity qualifies as a running session.
   - `delete` events set `is_deleted_at_provider = true`; define whether linked `workouts` revert from `completed`.
5. **Stream & Detail Call Budget:** Do not fetch `GET /activities/{id}/streams` during historical import loops; fetch summary lists (`GET /athlete/activities?per_page=50`) and defer detail/stream fetching to lazy per-activity inspection (or recent window only) to protect Strava rate quotas and serverless wall-clock time.
6. **Single Webhook per Strava App:** Vercel Preview deployments cannot register separate webhook callbacks against the same `STRAVA_CLIENT_ID`. Document using a separate Strava dev app for local/staging testing.

---

## 14. OpenRouter Integration Review

Cross-review of `AI_COACH_SPEC.md`, `AI_PROVIDER_STRATEGY.md`, and `ADR-005` shows high consistency:
- OpenRouter (`https://openrouter.ai/api/v1`) is the sole production gateway; Gemini Direct and 9Router are excluded from production.
- Server-only `OPENROUTER_API_KEY`, configurable `OPENROUTER_MODEL` and `OPENROUTER_FALLBACK_MODEL`, prioritized free variants, and strict prohibition on silent fallback to paid models.
- Minimized context (no tokens, no raw GPS/latlng, minimal injury context), strict Zod validation, `evidence_refs` verification against supplied context IDs, and deterministic fallback summaries.

### Remaining Gaps
1. **Conversational Q&A (`chat`) Contract:** `AI_COACH_SPEC.md` specifies JSON output only for `weekly_review` / `plan_adjustment`, not for `chat` responses or multi-turn message history truncation.
2. **Timeout Budget Fit:** `AI_REQUEST_TIMEOUT_MS=30000` plus retries and fallback can exceed Vercel Hobby serverless execution limits. Cap total request latency (e.g., 15-20s timeout, max 1 retry or 1 immediate fallback) and expose explicit loading/retry UX.
3. **Structured Output Capability Variance:** Not all `:free` models on OpenRouter support `response_format: { type: "json_schema" }` reliably. Maintain a tested allowlist with prompt-enforced JSON + strict Zod parsing fallback (`AI_PROVIDER_STRATEGY.md` Section 6).
4. **Upstream Data Retention:** Verify OpenRouter's data/prompt-logging policy and provider routing flags (e.g., zero-data-retention / disallow training routes where supported) before sending personal recovery/heart-rate context.
5. **Stale Proposal Linking:** Add `training_plan_id` FK to `ai_recommendations` and define a default `expires_at` window.

---

## 15. Training Methodology Review

`TRAINING_METHODOLOGY.md` is commendable for its epistemic humility: it avoids unverified medical claims, treats ACWR/readiness as decision support rather than injury guarantees, separates RPE/Pace/HR models, and forbids auto-stacking missed hard sessions.

### Specifications Needed for Deterministic Code (Milestone 4 & 7)
1. **Zone & Pace Calculation Rules:** Specify how pace targets are derived when a user has a recent race/time trial (and how stale a race result can be before falling back to RPE), plus how 5 HR zones are computed when `max_hr_bpm` or `lthr_bpm` is provided.
2. **Plan Generation Parameters:** Define default phase ratios for 5K / 10K / Half Marathon / Marathon / Custom across supported plan lengths (e.g., 6-20 weeks), configurable weekly mileage ramp caps, deload week frequency (e.g., every 3-4 weeks), maximum long-run proportion, and hard-session separation (minimum 48h).
3. **Training Load Calculation:** Define how `training_loads` handles synced Strava runs that lack `session_rpe` (manual RPE prompt vs. HR-TRIMP / duration fallback) and define the exact rolling window/EWMA formulas for `acute_load` and `chronic_load`.
4. **Rescheduling Guardrail Thresholds:** Specify which calendar checks in `BR-024` are hard blocks (e.g., duplicate workout if disallowed) vs. soft warnings (e.g., consecutive hard days, high-caution recovery flag).

---

## 16. Design System Review

### Findings
1. **Direct Direction Conflict (`DESIGN.md` vs. Prompt Section 8.8):**
   - `DESIGN.md` establishes a *"Calm performance aesthetic"*, *"restrained athletic green or deep blue; choose one"*, *"Avoid neon gradients"*, *"Modest corner radius"*, and *"persistent sidebar (desktop) / compact bottom navigation or accessible navigation drawer (mobile)"*.
   - Prompt Section 8.8 mandates *"Modern Gradient Athletic - Light First"*, *"Bold blue-purple gradient highlights"*, *"Rounded white cards"*, *"Compact pill controls"*, and *"Bottom tab navigation"*, referencing an absent three-smartphone visual mockup.
2. **Missing Token Definitions:** `DESIGN.md` currently lacks exact color hex/CSS variables, light-surface contrast tokens, typography family (currently unchosen), spacing scale, border-radius tokens, elevation shadows, and chart color tokens.
3. **Antislop Alignment Analysis (for future UI milestones):**
   - **R-01 (Color & Gradients):** If *"Modern Gradient Athletic"* with blue-purple gradient highlights is approved by the user, `DESIGN.md` must document the **explicit hierarchy purpose** (e.g., reserved strictly for the primary active-plan/hero summary card on mobile/desktop) and enforce WCAG AA contrast (`R-25`) across the entire gradient surface.
   - **R-11 (Border Radius):** *"Rounded white cards"* and *"compact pill controls"* must preserve clear radius differentiation (e.g., `rounded-2xl` cards, `rounded-xl` inputs, `rounded-full` filter/segment pills) rather than making every container pill-shaped.
   - **R-04 (Icons):** Lucide React is in the confirmed stack; use icons strictly where functionally meaningful (workout types, status indicators paired with text labels, navigation), avoiding decorative AI sparkles/orbs.
   - **R-27 (UI States) & R-32 (Accessibility):** `DESIGN.md` already specifies loading/empty/error/partial states, tabular numerals, non-color-only statuses, and WCAG 2.2 AA targets, which aligns strongly with `antislop`.

---

## 17. Security and Privacy Review

### Strong Foundations
- RLS on every user-owned table, tested with two distinct user identities (`DATABASE_SCHEMA.md` line 444).
- Server-only `SUPABASE_SERVICE_ROLE_KEY`, `STRAVA_CLIENT_SECRET`, `STRAVA_TOKEN_ENCRYPTION_KEY`, `STRAVA_WEBHOOK_VERIFY_TOKEN`, and `OPENROUTER_API_KEY`.
- Context minimization before AI inference (no GPS traces, no tokens, no raw credentials).
- Audit logging for critical plan changes and explicit disconnect/deletion requirements (`FR-19`, `BR-091`, `BR-092`).

### Security Gaps to Close Before Implementation
1. **OAuth Token Isolation:** Move `access_token_ciphertext` and `refresh_token_ciphertext` out of `authenticated`-readable RLS tables (or restrict via column/table separation to `service_role` only).
2. **Token Encryption Specification:** Specify AES-256-GCM with random 96-bit IV, auth tag, and key version prefix (`v1:iv:tag:ciphertext`) so future key rotation is possible.
3. **Webhook Verification:** Validate `STRAVA_WEBHOOK_SUBSCRIPTION_ID` and `owner_id` on `POST` webhook events, and protect any optional cron reconciliation route with a constant-time verified `CRON_SECRET`.
4. **Rate Limiting on Expensive Endpoints:** `SYSTEM_ARCHITECTURE.md` line 259 mentions rate-limiting expensive AI and sync actions, but no concrete mechanism (e.g., DB-backed daily/hourly quota check in `ai_coach_messages` / `sync_logs` since Redis is excluded for MVP) is defined.
5. **Log Redaction & Error Safety:** Enforce structured redaction for Authorization headers, Strava error payloads, and OpenRouter request headers in Vercel/Supabase logs.
6. **Account Deletion Workflow:** Define exact Supabase Admin `deleteUser` sequence + Strava `/oauth/deauthorize` call + `audit_logs` retention/anonymization rule.

---

## 18. Deployment Feasibility Review

Deploying on **Vercel Hobby + Supabase Free + OpenRouter free models** is **feasible for a single-user personal MVP**, provided expectations and operational constraints are verified against current provider terms before Milestone 9:

1. **Vercel Hobby:** Suitable for personal, non-commercial use. Must verify current serverless function `maxDuration`, bandwidth, build minutes, and Cron job limits (Hobby typically restricts Cron to low-frequency daily schedules with timing jitter).
2. **Supabase Free:** 500 MB database limit, egress limits, Edge Function invocation limits, and **inactivity pausing (historically after 7 days)** are the primary operational constraints. Keeping `activity_streams` out of PostgreSQL by default preserves DB capacity; hybrid manual `Sync Now` ensures sync does not break if Cron/automated workers are throttled or unavailable.
3. **Strava API:** Free developer tier works well for 1 athlete if historical imports fetch summaries (`per_page=50`) and avoid eager stream downloads for all past runs. Note: 1 webhook subscription per Strava client ID requires a separate app for dev/preview environments.
4. **OpenRouter Free Models:** Zero-cost variants have variable latency, rate limits (historically 20 RPM / 50 RPD on `:free` without purchased credits; subject to change), and evolving model availability. Caching weekly reviews by context fingerprint and providing deterministic non-AI summaries ensures the app remains fully usable when AI quotas are exhausted.

---

## 19. Recommended Corrections & Governance Proposal

### 19.1 Recommended Documentation Corrections (After Approval)
1. **Update `docs/DESIGN.md`:** Resolve the design direction conflict (Modern Gradient Athletic - Light First vs. calm green/blue), add concrete design tokens (colors, typography, radius scale, elevation, chart palette, three-dial settings), and attach/describe the mobile reference layout.
2. **Update `docs/ERD.md` and `docs/DATABASE_SCHEMA.md`:** Add `SYNC_JOBS` to `ERD.md`; add `timezone_name`, `preferred_training_days`, `max_hr_bpm`/`hr_zones`, `personal_records`, `oauth_states`, `ai_recommendations.training_plan_id`, `ON DELETE` rules, partial unique indexes on `workout_activities`, `workouts.workout_type` `CHECK` constraint, nullable disconnect tokens (or separate `strava_connection_tokens` table), `(user_id, provider, external_activity_id)` uniqueness, and fix duplicate `## 5.` heading.
3. **Update `docs/BUSINESS_RULES.md` & `docs/TRAINING_METHODOLOGY.md`:** Resolve `missed` derived vs. stored status, define Strava remote-delete effect on matched workouts, specify auto-matching criteria, and document deterministic Plan Engine defaults and training load fallback formulas.
4. **Update `docs/SYSTEM_ARCHITECTURE.md` & `docs/DEPLOYMENT_RUNBOOK.md`:** Finalize DB-backed `sync_jobs` (dropping ambiguous `pgmq` duality), clarify worker runtime host, add `STRAVA_WEBHOOK_SUBSCRIPTION_ID` and consolidated env vars, document Strava 2s webhook SLA and Supabase 7-day pause recovery.
5. **Update `docs/AI_COACH_SPEC.md`:** Add conversational Q&A schema/history cap, default recommendation expiry TTL, and manual edit `plan_version` increment rule.
6. **Align `docs/IMPLEMENTATION_CHECKLIST.md` & `docs/PRD.md` Sec 12:** Reconcile milestone numbering with the approved roadmap.

### 19.2 Phase 6: Development Governance Proposal (`AGENTS.md`)

Do **not** move existing files out of `docs/` or duplicate `DESIGN.md` / `IMPLEMENTATION_CHECKLIST.md` at the root right now. When approved to begin Milestone 0/1 governance setup, create a concise root `AGENTS.md` containing:

1. **Project Context:** Personal Running Coach overview, personal-use baseline with strict `user_id` isolation, pointer to `docs/` as primary specification source of truth.
2. **Technology Stack & Explicit Non-Goals:** Next.js App Router, React, TypeScript strict, Tailwind CSS, shadcn/ui, Recharts, Lucide React, Zod, Supabase (`@supabase/ssr`, PostgreSQL, Auth, RLS, Storage, Edge Functions/Queues), Strava API, OpenRouter (`https://openrouter.ai/api/v1`), Vitest, Playwright. Explicitly forbid introducing Laravel, Prisma, Redis, separate backend servers, Gemini Direct SDK, or 9Router in production.
3. **Architecture Boundaries:** Thin `app/` routes/Server Actions; all business rules in `server/domain/`; external APIs isolated in `server/integrations/` with normalized internal DTOs; database transactions/RPCs for atomic state changes.
4. **Coding & Data Conventions:** TypeScript strict (`noUncheckedIndexedAccess`, Zod boundary validation), canonical units (`meters`, `seconds`, `kilograms`, UTC `timestamptz`), `NULL` for unknown values (never zero), planned workouts separated from actual activities, no unapproved large refactors.
5. **Design & Antislop Rules:** Pointer to `docs/DESIGN.md` for tokens/direction and `antislop` rules (explicit `during`/`after` mode, WCAG AA contrast, loading/empty/error states on every data UI, keyboard accessibility, mobile-first responsiveness, no fabricated stats/claims, no em dashes in agent copy).
6. **Security & AI Agent Restrictions:**
   - Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRAVA_CLIENT_SECRET`, `STRAVA_TOKEN_ENCRYPTION_KEY`, `STRAVA_WEBHOOK_VERIFY_TOKEN`, or `OPENROUTER_API_KEY` to client bundles or logs.
   - Never bypass RLS or write features that let AI execute SQL, mutate DB directly, or modify active training plans without explicit user approval and server-side revalidation.
   - Never commit secrets or real Strava tokens/personal activity data in seeds or fixtures.
7. **Testing Requirements & Quality Gates:** Mandatory 12-step milestone workflow (explore -> plan -> user approval -> implement -> Vitest/Playwright -> `eslint` + `tsc --noEmit` -> responsive & a11y check -> security/RLS review -> `git diff` review -> docs update -> report -> STOP for next milestone approval).
8. **Documentation Maintenance Rules:** Update `docs/DATABASE_SCHEMA.md`, `docs/BUSINESS_RULES.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, and ADRs whenever schema, domain rules, or architectural decisions evolve.

---

## 20. Decisions Resolution Log (Milestone 0 Approved)

All eight decisions raised in the initial audit were explicitly reviewed and approved by the user on 2026-11-24 and reconciled across `docs/` and `AGENTS.md`:

| Decision ID | Approved Resolution | Reconciliation Status |
|---|---|---|
| **DEC-01** | **Modern Gradient Athletic - Light First** (`#F7F8FC` canvas, `#FFFFFF` cards, `#20212B`/`#697080` text, `#3478F6`/`#8B5CF6`/`#50C9CE` accents & selective focal gradient, Geist Sans + Geist Mono, 14-20px cards / 8-12px controls, mobile-first layout + bottom tab nav). | **Resolved** in `docs/DESIGN.md` and `AGENTS.md`. |
| **DEC-02** | **Strava OAuth Scope `activity:read_all`** so permitted public and private ("Only You") activities sync, with clear scope disclosure in UI. | **Resolved** in `BUSINESS_RULES.md`, `USER_FLOW.md`, `SYSTEM_ARCHITECTURE.md`, `DEPLOYMENT_RUNBOOK.md`, `ADR-003`. |
| **DEC-03** | **`missed` as Derived State** (`status = 'planned'` AND `scheduled_date < local_today` in runner `timezone_name`); persisted statuses remain `planned`, `completed`, `skipped`, `rescheduled`, `modified`; no midnight cron mutation or next-day roll-forward. | **Resolved** in `BUSINESS_RULES.md`, `DATABASE_SCHEMA.md`, `TRAINING_METHODOLOGY.md`, `USER_FLOW.md`, `DESIGN.md`. |
| **DEC-04** | **PostgreSQL `sync_jobs` + Single Next.js TS Worker (`server/jobs/sync-worker.ts`)** with atomic `claim_sync_jobs` RPC, `Sync Now`, and Vercel Hobby 1x/day Cron (`CRON_SECRET`). Sub-daily trigger (`pg_cron`+`pg_net`) isolated as a **Milestone 3 Implementation Spike** with 6 measurable criteria; Next.js `after()` is not treated as durable execution; fallback is Webhook-Enqueue + 1x/Day Cron + Manual `Sync Now`. | **Resolved (Baseline) + Isolated M3 Spike** in `SYSTEM_ARCHITECTURE.md`, `ADR-003`, `ADR-004`, `DEPLOYMENT_RUNBOOK.md`. |
| **DEC-05** | **Distinct Training Load Methods** (`srpe`, `hr_trimp_estimate`, `duration_estimate`) with non-blocking optional post-sync RPE input, explicit `method`, `unit`, `calculation_version`, `source_data`, `completeness`, and `is_estimated` metadata. | **Resolved** in `TRAINING_METHODOLOGY.md`, `DATABASE_SCHEMA.md`, `BUSINESS_RULES.md`, `AI_COACH_SPEC.md`, `USER_FLOW.md`. |
| **DEC-06** | **Configurable Deterministic Training Engine Defaults** (4-24w bounds, pace from recent race/TT or RPE fallback, phase ratios, 5-10% ramp cap, 3-4w step-back, 48h hard-session spacing, ~25-35% long-run cap) labeled as provisional defaults. | **Resolved** in `TRAINING_METHODOLOGY.md` and `AI_COACH_SPEC.md`. |
| **DEC-07** | **Milestone Ordering M0-M9** (Strava M3 -> Engine M4 -> Calendar M5 -> Recovery M6 -> Analytics M7 -> AI M8 -> QA/Deploy M9). | **Resolved** in `DEVELOPMENT_ROADMAP.md`, `IMPLEMENTATION_CHECKLIST.md`, `PRD.md`. |
| **DEC-08** | **Root `AGENTS.md` + Antislop `During` Mode** for all UI design and implementation milestones. | **Resolved** via root `AGENTS.md` and `docs/DESIGN.md`. |

---

## 21. Final Readiness Assessment

**Verdict: READY FOR MILESTONE 1 (Post-Milestone 0 Reconciliation).**

All eight user decisions (`DEC-01` through `DEC-08`) have been resolved and reconciled across the documentation suite, official provider quotas have been verified (with sub-daily background trigger validation cleanly isolated as a **Milestone 3 Implementation Spike**), and `AGENTS.md` establishes strict architecture, security, quality gate, and `antislop` `During` rules.

Milestone 1 (Project Foundation and Design System) has zero remaining blockers and awaits explicit user approval to begin.
