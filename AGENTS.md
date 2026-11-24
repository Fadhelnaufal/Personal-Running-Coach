# AGENTS.md - Personal Running Coach

This file is the authoritative operational manual for AI coding agents working in this repository. Follow every rule below strictly across all milestones.

---

## 1. Project Identity

**Personal Running Coach** is a personal-use, responsive web application that turns real Strava running data and manual recovery check-ins into structured training plans, deterministic performance analytics, and human-approved adaptive AI coaching insights.

- Initially built for one primary experienced recreational runner.
- All user-owned tables still enforce strict `user_id` ownership and Row Level Security (RLS) so multi-user isolation holds by design.

---

## 2. Source of Truth (`docs/`)

All project specifications remain inside `docs/`. Do not duplicate or move them to the root directory.

- **Product requirements:** `docs/PRD.md`
- **Business rules (`BR-001`..`BR-103`):** `docs/BUSINESS_RULES.md`
- **Database ERD & schema:** `docs/ERD.md`, `docs/DATABASE_SCHEMA.md`
- **System architecture:** `docs/SYSTEM_ARCHITECTURE.md`
- **Design tokens & UI rules:** `docs/DESIGN.md`
- **AI Coach & OpenRouter strategy:** `docs/AI_COACH_SPEC.md`, `docs/AI_PROVIDER_STRATEGY.md`
- **Training methodology & defaults:** `docs/TRAINING_METHODOLOGY.md`
- **User flows:** `docs/USER_FLOW.md`
- **Roadmap & checklist:** `docs/DEVELOPMENT_ROADMAP.md`, `docs/IMPLEMENTATION_CHECKLIST.md`
- **ADRs:** `docs/ADR/ADR-001` through `ADR-005`

---

## 3. Confirmed Tech Stack & Architectural Boundaries

### Approved Stack
- **Frontend / App:** Next.js App Router, React, TypeScript (strict mode), Tailwind CSS, shadcn/ui, Recharts, Lucide React, Zod.
- **Backend / Managed Infra:** Supabase PostgreSQL (SQL migrations via Supabase CLI), Supabase Auth (`@supabase/ssr`), Supabase Storage, Supabase RLS, `pg_cron`/`pg_net` (spike-gated).
- **Integrations:** Strava API (`activity:read_all`), OpenRouter OpenAI-compatible API (`https://openrouter.ai/api/v1`).
- **Hosting:** Vercel Hobby + Supabase Free (Rp0/\$0 target, subject to provider quotas).
- **Quality & Testing:** ESLint, Prettier, Vitest, Playwright.

### Explicit Non-Goals (Do Not Introduce Without Approved ADR)
- No Laravel, separate dedicated backend server, Redis, Prisma, permanent worker server, Gemini Direct SDK, or production 9Router.
- Do not add Drizzle ORM unless a concrete technical blocker justifies a separate ADR.

### Directory & Layer Boundaries
- `app/`: Thin routing, layouts, Server Components, Route Handlers, and Server Actions (transport + Zod parsing + session verification only).
- `features/`: UI feature modules and client state.
- `components/ui/` & `components/shared/`: Reusable design-system primitives.
- `server/domain/`: Pure, deterministic domain engines (`runner`, `training`, `activities`, `analytics`, `recovery`, `ai-coach`). Must not import provider SDK types.
- `server/integrations/`: Isolated external adapters (`strava`, `openrouter`, `ai-provider`).
- `server/jobs/`: Bounded queue worker (`sync-worker.ts`) processing PostgreSQL `sync_jobs`. Single Next.js TypeScript codebase (avoid duplicating business logic across Node.js and Deno Edge Functions).
- `supabase/migrations/`: Ordered SQL migrations and RLS policies.

---

## 4. Coding Standards & Domain Data Rules

- **TypeScript:** `strict: true`, `noUncheckedIndexedAccess: true`. Validate all untrusted external inputs, webhooks, form payloads, and AI outputs with **Zod**.
- **Naming:** `snake_case` for SQL tables/columns; `camelCase` for TypeScript variables/functions; `PascalCase` for React components/types; kebab-case for routes and non-component files.
- **Canonical Units & Time:** Distance in **meters**, duration in **seconds**, weight in **kilograms**, timestamps in **UTC `timestamptz`**. Always convert local calendar dates using `runner_profiles.timezone_name` (IANA string).
- **Honest `NULL` Semantics:** Unknown or unprovided measurements stay `NULL` in DB and render as missing/"Not recorded" in UI. Never coerce missing inputs to `0`.
- **Planned vs. Actual Separation:** `workouts` (planned) and `activities` (actual) are separate tables linked via `workout_activities` (`is_primary = true` unique per workout and per activity). Unlinking never deletes either record.
- **Derived `missed` Status:** `missed` is a derived UI/query state (`status = 'planned' AND scheduled_date < local_today`). Never add a 6th `missed` DB enum, never auto-roll missed workouts forward, and never require a midnight cron mutation.
- **Training Load Integrity:** Keep `srpe`, `hr_trimp_estimate`, and `duration_estimate` distinct with `unit`, `method`, `calculation_version`, `source_data`, `completeness`, and `is_estimated`. Never equate proxy estimates with user-reported sRPE.
- **Local Scope:** Keep changes scoped to the active milestone. Do not perform unrequested broad refactors.

---

## 5. Security, RLS, Strava & OpenRouter Rules

- **RLS Everywhere:** Enable RLS on every table (`auth.uid() = user_id` for user-owned data). Always verify RLS with at least two distinct test user identities.
- **Server-Only Secrets:** Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRAVA_CLIENT_SECRET`, `STRAVA_TOKEN_ENCRYPTION_KEY`, `STRAVA_WEBHOOK_VERIFY_TOKEN`, `STRAVA_WEBHOOK_SUBSCRIPTION_ID`, `OPENROUTER_API_KEY`, or `CRON_SECRET` via `NEXT_PUBLIC_*`, client bundles, or logs.
- **Isolated Token & State Tables:** Store Strava tokens encrypted with **AES-256-GCM** (`v1:<iv>:<tag>:<ciphertext>`) inside `strava_connection_tokens` and CSRF nonces inside `oauth_states`. Both tables must have RLS enabled with **zero** `anon`/`authenticated` policies (`service_role` only).
- **Strava Sync Rules:**
  - Scope: `activity:read_all` (disclosed clearly on connect).
  - Webhook `GET` challenge and `POST` enqueue must respond in `< 2s`, validating `subscription_id` and `owner_id`, inserting minimal `sync_jobs` idempotently, and never running imports inline.
  - Worker claims `sync_jobs` atomically (`claim_sync_jobs` with `FOR UPDATE SKIP LOCKED` + `lease_expires_at`), fetches summaries (`per_page=50`), deduplicates on `(user_id, provider, external_activity_id)`, refreshes tokens with a 5-minute buffer, respects `429 Retry-After`, transitions `401` to `reauthorization_required`, and retries up to 5 times (`30s`, `60s`, `120s`, then bounded exponential backoff with jitter).
- **OpenRouter & AI Guardrails:**
  - Server-side adapter only (`https://openrouter.ai/api/v1`). Model ID (`OPENROUTER_MODEL`) and optional fallback are environment configuration; prioritize `:free` models and **never silently fall back to paid models**.
  - Minimize context (strip tokens, raw GPS `latlng`, and unneeded PII).
  - Validate outputs with Zod and verify all `evidence_refs` against supplied context IDs.
  - AI must **never** execute SQL, mutate the database directly, bypass deterministic training validation, or alter an active plan without explicit user approval and server-side `training_plan_id` + `plan_version` revalidation.
  - Provide deterministic non-AI fallback summaries when OpenRouter is unavailable or rate-limited.

---

## 6. Training Methodology Guardrails

- Deterministic Training Plan Engine outputs are governed by configurable defaults in `docs/TRAINING_METHODOLOGY.md` (provisional defaults, not universal physiological laws).
- Never generate exact min/km pace targets without credible recent race/time-trial data; fall back to RPE/talk-test and surface explicit warnings.
- Never diagnose injuries or guarantee race outcomes; advise stopping exercise and seeking clinical care for severe/worsening pain or red-flag symptoms.

---

## 7. Design System & Antislop `During` Workflow

- **Authoritative Visual Direction:** **Modern Gradient Athletic - Light First** (`docs/DESIGN.md`).
  - Canvas `#F7F8FC`, white cards `#FFFFFF`, border `#E7EAF1`, text `#20212B` / `#697080`, accents `#3478F6` / `#8B5CF6` / `#50C9CE`, gradient reserved selectively for focal hero surfaces.
  - Typography: `Geist Sans` for UI + `Geist Mono` (`tabular-nums`) for metrics.
  - Radius hierarchy: cards `14px-20px`, controls `8px-12px`, compact pills `9999px`.
- **Antislop Mode (`during`):** Apply anti-generic-design discipline while writing UI code (never defer to after completion):
  - **Mobile-first craft:** Dedicated mobile layout (compact app bar, bottom tab navigation, focal gradient card, rounded white supporting cards, compact pill controls, `>= 44px` tap targets, zero horizontal overflow on `375px`).
  - **Desktop craft:** Persistent left sidebar + purposeful multi-column layout.
  - **Real data only:** Never invent stats, claims, or fake chart previews; render explicit empty, loading, error, and insufficient-data states on every data view.
  - **Accessibility (WCAG 2.2 AA):** Verify >= 4.5:1 normal / >= 3:1 large text contrast across all gradient stops, full keyboard navigation (`Tab`, `Enter`, `Space`, `Escape`), visible focus rings, and non-color-only status labels.
  - **Clean UI craft:** No dead links/buttons, no generic AI buzzword badges, no em dash (`U+2014`) in UI copy, and verify interactive controls in a running build before declaring a UI milestone complete.

---

## 8. Testing, Maintenance & Milestone Approval Gates

### Testing Requirements
- **Unit (`Vitest`):** Domain calculations, pace/load math, engine guardrails, Zod schemas, crypto roundtrips, retry/backoff logic.
- **Integration:** Two-user PostgreSQL RLS isolation tests, atomic plan activation & `claim_sync_jobs` concurrency/lease tests, mocked Strava & OpenRouter contract tests.
- **E2E (`Playwright`):** Critical flows across mobile (`375px`) and desktop (`1280px+`) viewports.

### Mandatory 12-Step Milestone Workflow
1. Explore existing code and `docs/`.
2. Analyze requirements, `BR-*` rules, and schema constraints.
3. Prepare an implementation plan for the active milestone only.
4. Present the plan for explicit user approval.
5. Implement only the approved scope.
6. Run relevant `Vitest` and `Playwright` tests, `eslint`, and `tsc --noEmit`.
7. Verify responsive UI (mobile + desktop), accessibility, and all UI states.
8. Review security, RLS, and secret boundaries.
9. Review the full `git diff`.
10. Update `docs/` (`DATABASE_SCHEMA.md`, `BUSINESS_RULES.md`, `IMPLEMENTATION_CHECKLIST.md`, ADRs) if specifications changed.
11. Report completed work, test evidence, and remaining issues.
12. **STOP.** Never automatically start the next milestone without explicit user approval.
