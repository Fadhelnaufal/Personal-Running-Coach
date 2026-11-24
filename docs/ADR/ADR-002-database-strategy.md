# ADR-002: Database Strategy

- Status: Accepted
- Decision: Supabase PostgreSQL with SQL migrations, RLS, and generated TypeScript types.
- Context: data is relational: plans, phases, workouts, actual activities, recovery, recommendations, and analytics.
- Decision details:
  - PostgreSQL is the system of record.
  - Supabase client for ordinary CRUD.
  - SQL functions/RPC for atomic multi-row operations and complex aggregation where appropriate.
  - Generated database types committed or reproducibly generated.
  - No ORM required initially; Drizzle may be evaluated later if useful.
- Consequences:
  - Strong relational constraints and analytics queries.
  - RLS policies and migration discipline are mandatory.
  - Keep provider payloads and streams out of primary relational rows where possible.

## Milestone 0 Reconciliation (2026-11-24)
- **Server-only secret isolation:** Strava OAuth tokens are isolated in `strava_connection_tokens` and OAuth CSRF nonces in `oauth_states`, both with RLS enabled and zero policies for `anon`/`authenticated` (`service_role` only).
- **Cross-user relational integrity:** Parent user-owned tables expose `UNIQUE (id, user_id)` and child tables enforce composite `(referenced_id, user_id)` foreign keys (using column-scoped `ON DELETE SET NULL (<fk_col>)` on nullable FKs) so database constraints block cross-user references independent of RLS.
- **Two-layer training load model:** `training_loads` stores strictly per-activity session loads (`UNIQUE (activity_id)`), while `daily_training_load_summaries` stores deterministic per-day aggregates and rolling 7d/28d snapshots (`UNIQUE (user_id, summary_date)`).
- **Schema completeness:** Added `runner_profiles.timezone_name`, `preferred_training_days`, `unavailable_days`, `personal_records`, `ai_recommendations.training_plan_id`, `workout_activities` partial primary-match unique indexes, and `(user_id, provider, external_activity_id)` activity deduplication.
- **Durable queue (`DEC-04`):** Confirmed PostgreSQL `sync_jobs` table with atomic `claim_sync_jobs` RPC (`FOR UPDATE SKIP LOCKED` + lease expiry) as the MVP queue storage instead of introducing `pgmq`.
