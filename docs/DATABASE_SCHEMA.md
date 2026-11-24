# Database Schema
## Personal Running Coach

**Database:** PostgreSQL (Supabase, PG 15+)  
**Migration strategy:** SQL migrations through Supabase CLI  
**Primary key:** UUID (`gen_random_uuid()`)  
**Timestamp convention:** `timestamptz`, UTC  
**Canonical units:** meters, seconds, kilograms  
**Reconciled:** 2026-11-24 (`Milestone 0` final remediation: composite cross-user FKs, constraint audit, two-layer training load model)

This is an implementation-ready relational schema specification. Actual SQL migrations are created starting in Milestone 2 (not during Milestone 0).

---

## 1. Conventions

- `auth.users.id` is the authoritative user identity; every user-owned table includes `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`.
- **Cross-user relational integrity (defense-in-depth beyond RLS):** Every parent table referenced by another user-owned table defines `UNIQUE (id, user_id)`. Child tables enforce **composite foreign keys** `FOREIGN KEY (<parent_id>, user_id) REFERENCES <parent_table>(id, user_id)` so a row belonging to User A can never reference a parent record belonging to User B, even under `service_role` writes.
- **Nullable composite FK delete rule:** Where a composite FK references a nullable parent column, use PostgreSQL 15+ column-scoped `ON DELETE SET NULL (<fk_column>)` so deleting the parent clears only `<fk_column>` and never attempts to set `user_id` to `NULL`.
- Use `created_at timestamptz NOT NULL DEFAULT now()` and `updated_at timestamptz NOT NULL DEFAULT now()` on mutable tables.
- Use `numeric` where measurement precision matters; integer/smallint for counts, seconds, BPM, and scores.
- Unknown or unprovided values remain `NULL`; never coerce missing inputs to `0`.
- Enum-like columns use `text` with explicit `CHECK` constraints for straightforward SQL migration evolution.

---

## 2. Tables

### 2.1 `runner_profiles`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, UNIQUE, FK -> `auth.users(id) ON DELETE CASCADE` |
| `display_name` | `text` | nullable |
| `timezone_name` | `text` | NOT NULL DEFAULT `'UTC'`, valid IANA timezone (e.g. `Asia/Jakarta`) |
| `experience_level` | `text` | nullable, CHECK (`beginner`, `intermediate`, `advanced`) |
| `preferred_distance_unit` | `text` | NOT NULL DEFAULT `'km'`, CHECK (`km`, `mi`) |
| `preferred_pace_unit` | `text` | NOT NULL DEFAULT `'min_per_km'`, CHECK (`min_per_km`, `min_per_mile`) |
| `weekly_running_days` | `smallint` | nullable, CHECK (`1..7`) |
| `preferred_training_days` | `smallint[]` | nullable, ISO weekday numbers `1..7` (`1`=Mon .. `7`=Sun) |
| `unavailable_days` | `smallint[]` | nullable, ISO weekday numbers `1..7` |
| `recent_weekly_distance_m` | `numeric` | nullable, CHECK (`>= 0`) |
| `longest_recent_run_m` | `numeric` | nullable, CHECK (`>= 0`) |
| `easy_pace_sec_per_km` | `integer` | nullable, CHECK (`> 0`) |
| `threshold_pace_sec_per_km` | `integer` | nullable, CHECK (`> 0`) |
| `resting_hr_bpm` | `smallint` | nullable, CHECK (`30..130`) |
| `max_hr_bpm` | `smallint` | nullable, CHECK (`100..230`) |
| `lthr_bpm` | `smallint` | nullable, CHECK (`90..220`) |
| `hr_zones` | `jsonb` | nullable, explicit zone boundaries + derivation source (`measured`/`estimated`) |
| `weight_kg` | `numeric` | nullable, CHECK (`> 0`), optional body metric only when provided |
| `injury_history` | `jsonb` | nullable, structured limitations/caution notes |
| `notes` | `text` | nullable |
| `profile_completed_at` | `timestamptz` | nullable |
| `baseline_updated_at` | `timestamptz` | nullable (`BR-004`) |
| `baseline_source` | `text` | nullable (`manual`, `strava_derived`, `mixed`) |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Table constraint: `CHECK (max_hr_bpm IS NULL OR resting_hr_bpm IS NULL OR max_hr_bpm > resting_hr_bpm)`.

### 2.2 `runner_goals`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `goal_type` | `text` | NOT NULL, CHECK (`5k`, `10k`, `half_marathon`, `marathon`, `custom`) |
| `title` | `text` | NOT NULL |
| `target_distance_m` | `numeric` | NOT NULL, CHECK (`> 0`) |
| `target_time_sec` | `integer` | nullable, CHECK (`> 0`) |
| `race_date` | `date` | nullable |
| `priority` | `text` | NOT NULL, CHECK (`primary`, `secondary`) |
| `status` | `text` | NOT NULL, CHECK (`active`, `achieved`, `archived`) |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (id, user_id)` (composite FK target)
- Partial unique index: `UNIQUE (user_id) WHERE priority = 'primary' AND status = 'active'`.

### 2.3 `personal_records`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `distance_key` | `text` | NOT NULL, CHECK (`5k`, `10k`, `half_marathon`, `marathon`, `custom`) |
| `distance_m` | `numeric` | NOT NULL, CHECK (`> 0`) |
| `elapsed_time_sec` | `integer` | NOT NULL, CHECK (`> 0`) |
| `achieved_on` | `date` | nullable |
| `source` | `text` | NOT NULL, CHECK (`manual_baseline`, `strava_activity`, `race_verified`) |
| `activity_id` | `uuid` | nullable; composite FK `(activity_id, user_id) -> activities(id, user_id) ON DELETE SET NULL (activity_id)` |
| `is_current` | `boolean` | NOT NULL DEFAULT `true` |
| `notes` | `text` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Index: `(user_id, distance_key, is_current)`.

### 2.4 `oauth_states`

Short-lived server-only table preventing OAuth CSRF across stateless serverless invocations.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `provider` | `text` | NOT NULL DEFAULT `'strava'` |
| `state_hash` | `text` | NOT NULL, UNIQUE (SHA-256 of cryptographic nonce) |
| `redirect_path` | `text` | nullable |
| `expires_at` | `timestamptz` | NOT NULL |
| `consumed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` | NOT NULL |

RLS enabled with **zero** `authenticated`/`anon` policies; accessed solely via server-side `service_role`.

### 2.5 `strava_connections`

Non-secret connection metadata safe for user-scoped status UI.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `provider` | `text` | NOT NULL DEFAULT `'strava'` |
| `provider_athlete_id` | `text` | NOT NULL |
| `scopes` | `text[]` | NOT NULL (baseline expects `activity:read_all`, `DEC-02`) |
| `status` | `text` | NOT NULL, CHECK (`connected`, `reauthorization_required`, `disconnected`) |
| `last_synced_at` | `timestamptz` | nullable |
| `disconnected_at` | `timestamptz` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (id, user_id)` (composite FK target ensuring token/activity/sync owner parity)
- `UNIQUE (user_id, provider, provider_athlete_id)`
- Partial unique index: `UNIQUE (user_id, provider) WHERE status <> 'disconnected'` (one active connection per user/provider for MVP).

### 2.6 `strava_connection_tokens` (Isolated Server-Only Token Storage)

Dedicated table isolating encrypted OAuth secrets from browser-accessible RLS queries and guaranteeing token owner equals connection owner.

| Column | Type | Constraints / Notes |
|---|---|---|
| `connection_id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `access_token_ciphertext` | `text` | NOT NULL, AES-256-GCM encrypted (`v1:<iv>:<tag>:<ciphertext>`) |
| `refresh_token_ciphertext` | `text` | NOT NULL, AES-256-GCM encrypted |
| `token_expires_at` | `timestamptz` | NOT NULL |
| `key_version` | `text` | NOT NULL DEFAULT `'v1'` (supports future key rotation) |
| `updated_at` | `timestamptz` | NOT NULL |

Constraints:
- Composite FK: `FOREIGN KEY (connection_id, user_id) REFERENCES strava_connections(id, user_id) ON DELETE CASCADE` (guarantees token owner consistency with connection owner).
- **Security:** Enable RLS with **no** `SELECT`/`INSERT`/`UPDATE`/`DELETE` policies for `anon` or `authenticated`. Only `service_role` server integration code may read, refresh, or delete rows. On disconnect (`BR-091`), delete the row in `strava_connection_tokens` and mark `strava_connections.status = 'disconnected'`.

### 2.7 `activities`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `strava_connection_id` | `uuid` | nullable; composite FK `(strava_connection_id, user_id) -> strava_connections(id, user_id) ON DELETE SET NULL (strava_connection_id)` |
| `provider` | `text` | NOT NULL DEFAULT `'strava'`, CHECK (`strava`, `manual`) |
| `external_activity_id` | `text` | nullable (required when `provider = 'strava'`) |
| `name` | `text` | NOT NULL |
| `sport_type` | `text` | NOT NULL |
| `started_at` | `timestamptz` | NOT NULL |
| `timezone_name` | `text` | nullable (parsed IANA name when available) |
| `distance_m` | `numeric` | nullable, CHECK (`>= 0`) |
| `moving_time_sec` | `integer` | nullable, CHECK (`>= 0`) |
| `elapsed_time_sec` | `integer` | nullable, CHECK (`>= 0`) |
| `elevation_gain_m` | `numeric` | nullable |
| `average_speed_mps` | `numeric` | nullable, CHECK (`>= 0`) |
| `max_speed_mps` | `numeric` | nullable, CHECK (`>= 0`) |
| `average_hr_bpm` | `smallint` | nullable, CHECK (`30..240`) |
| `max_hr_bpm` | `smallint` | nullable, CHECK (`30..240`) |
| `average_cadence` | `numeric` | nullable, CHECK (`>= 0`) |
| `calories_kcal` | `numeric` | nullable, CHECK (`>= 0`) |
| `session_rpe` | `smallint` | nullable, CHECK (`1..10`), user-entered post-run RPE (local field, never overwritten by Strava updates) |
| `local_notes` | `text` | nullable (local field, never overwritten by Strava updates) |
| `provider_updated_at` | `timestamptz` | nullable |
| `is_deleted_at_provider` | `boolean` | NOT NULL DEFAULT `false` |
| `deleted_at_provider_at` | `timestamptz` | nullable |
| `raw_summary` | `jsonb` | nullable, minimized provider summary only |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (id, user_id)` (composite FK target for `activity_streams`, `workout_activities`, `training_loads`, `personal_records`)
- `CHECK ((provider = 'strava' AND external_activity_id IS NOT NULL) OR (provider = 'manual' AND external_activity_id IS NULL))` (Note: `strava_connection_id` stays nullable so user-retained Strava history survives connection deletion per `ON DELETE SET NULL`.)
- Partial unique index: `UNIQUE (user_id, provider, external_activity_id) WHERE external_activity_id IS NOT NULL` (prevents duplicates even across Strava reconnections).
- Index: `(user_id, started_at DESC)`.

### 2.8 `activity_streams`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `activity_id` | `uuid` | NOT NULL; composite FK `(activity_id, user_id) -> activities(id, user_id) ON DELETE CASCADE` |
| `stream_type` | `text` | NOT NULL, CHECK (`time`, `distance`, `latlng`, `heartrate`, `cadence`, `velocity_smooth`, `altitude`) |
| `resolution` | `text` | NOT NULL, CHECK (`low`, `high`) |
| `data` | `jsonb` | nullable; lazy-loaded only; consider Supabase Storage object key if large streams proliferate |
| `data_points` | `integer` | NOT NULL, CHECK (`>= 0`) |
| `created_at` | `timestamptz` | NOT NULL |

Unique: `(activity_id, stream_type, resolution)`.

### 2.9 `training_plans`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `goal_id` | `uuid` | nullable; composite FK `(goal_id, user_id) -> runner_goals(id, user_id) ON DELETE SET NULL (goal_id)` |
| `title` | `text` | NOT NULL |
| `status` | `text` | NOT NULL, CHECK (`draft`, `active`, `paused`, `completed`, `cancelled`) |
| `start_date` | `date` | NOT NULL |
| `end_date` | `date` | nullable |
| `target_distance_m` | `numeric` | NOT NULL, CHECK (`> 0`) |
| `target_time_sec` | `integer` | nullable, CHECK (`> 0`) |
| `race_date` | `date` | nullable |
| `sessions_per_week` | `smallint` | NOT NULL, CHECK (`1..7`) |
| `plan_version` | `integer` | NOT NULL DEFAULT `1`, CHECK (`>= 1`) (incremented on AI or manual plan/calendar changes) |
| `methodology_version` | `text` | NOT NULL |
| `generated_from_snapshot` | `jsonb` | NOT NULL, baseline inputs, defaults used, and completeness |
| `activated_at` | `timestamptz` | nullable |
| `completed_at` | `timestamptz` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (id, user_id)` (composite FK target for `training_phases`, `workouts`, `ai_recommendations`, `plan_adjustments`)
- `CHECK (end_date IS NULL OR end_date >= start_date)`
- Partial unique index: `UNIQUE (user_id) WHERE status = 'active'`.

### 2.10 `training_phases`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `training_plan_id` | `uuid` | NOT NULL; composite FK `(training_plan_id, user_id) -> training_plans(id, user_id) ON DELETE CASCADE` |
| `name` | `text` | NOT NULL |
| `phase_type` | `text` | NOT NULL, CHECK (`base`, `aerobic`, `threshold`, `speed`, `race_specific`, `taper`, `recovery`) |
| `start_date` | `date` | NOT NULL |
| `end_date` | `date` | NOT NULL |
| `sort_order` | `smallint` | NOT NULL, CHECK (`>= 1`) |
| `objective` | `text` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints:
- `UNIQUE (id, user_id)` (composite FK target for `workouts`)
- `CHECK (end_date >= start_date)`.

### 2.11 `workouts`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `training_plan_id` | `uuid` | NOT NULL; composite FK `(training_plan_id, user_id) -> training_plans(id, user_id) ON DELETE CASCADE` |
| `training_phase_id` | `uuid` | nullable; composite FK `(training_phase_id, user_id) -> training_phases(id, user_id) ON DELETE SET NULL (training_phase_id)` |
| `scheduled_date` | `date` | NOT NULL (runner local calendar date; preserved when derived as `missed`) |
| `scheduled_start_at` | `timestamptz` | nullable |
| `workout_type` | `text` | NOT NULL, CHECK (`easy_run`, `recovery_run`, `long_run`, `steady_run`, `tempo_run`, `interval`, `repetition`, `hill_repeats`, `race_pace`, `strides`, `rest`, `cross_training`) |
| `title` | `text` | NOT NULL |
| `description` | `text` | nullable |
| `target_distance_m` | `numeric` | nullable, CHECK (`>= 0`) |
| `target_duration_sec` | `integer` | nullable, CHECK (`>= 0`) |
| `target_pace_min_sec_per_km` | `integer` | nullable, CHECK (`> 0`) |
| `target_pace_max_sec_per_km` | `integer` | nullable, CHECK (`> 0`) |
| `target_hr_zone` | `text` | nullable |
| `target_rpe_min` | `smallint` | nullable, CHECK (`1..10`) |
| `target_rpe_max` | `smallint` | nullable, CHECK (`1..10`) |
| `status` | `text` | NOT NULL, CHECK (`planned`, `completed`, `skipped`, `rescheduled`, `modified`) (`DEC-03`: `missed` is derived, never persisted here) |
| `completion_note` | `text` | nullable |
| `rescheduled_from_workout_id` | `uuid` | nullable; composite self-FK `(rescheduled_from_workout_id, user_id) -> workouts(id, user_id) ON DELETE SET NULL (rescheduled_from_workout_id)` |
| `sort_order` | `smallint` | NOT NULL, CHECK (`>= 1`) |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (id, user_id)` (composite FK target for `workout_steps`, `workout_activities`, `workouts` self-FK)
- `CHECK (target_pace_min_sec_per_km IS NULL OR target_pace_max_sec_per_km IS NULL OR target_pace_min_sec_per_km <= target_pace_max_sec_per_km)` (faster sec/km <= slower sec/km)
- `CHECK (target_rpe_min IS NULL OR target_rpe_max IS NULL OR target_rpe_min <= target_rpe_max)`
- Indexes: `(user_id, scheduled_date)`, `(training_plan_id, scheduled_date)`.

### 2.12 `workout_steps`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `workout_id` | `uuid` | NOT NULL; composite FK `(workout_id, user_id) -> workouts(id, user_id) ON DELETE CASCADE` |
| `step_type` | `text` | NOT NULL, CHECK (`warmup`, `work`, `steady`, `strides`, `recovery`, `rest`, `cooldown`) |
| `label` | `text` | NOT NULL |
| `repetitions` | `smallint` | nullable, CHECK (`>= 1`) |
| `distance_m` | `numeric` | nullable, CHECK (`> 0`) |
| `duration_sec` | `integer` | nullable, CHECK (`> 0`) |
| `target_pace_min_sec_per_km` | `integer` | nullable, CHECK (`> 0`) |
| `target_pace_max_sec_per_km` | `integer` | nullable, CHECK (`> 0`) |
| `target_hr_zone` | `text` | nullable |
| `target_rpe_min` | `smallint` | nullable, CHECK (`1..10`) |
| `target_rpe_max` | `smallint` | nullable, CHECK (`1..10`) |
| `instructions` | `text` | nullable |
| `sort_order` | `smallint` | NOT NULL, CHECK (`>= 1`) |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints:
- `CHECK (target_pace_min_sec_per_km IS NULL OR target_pace_max_sec_per_km IS NULL OR target_pace_min_sec_per_km <= target_pace_max_sec_per_km)`
- `CHECK (target_rpe_min IS NULL OR target_rpe_max IS NULL OR target_rpe_min <= target_rpe_max)`.

### 2.13 `workout_activities`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `workout_id` | `uuid` | NOT NULL; composite FK `(workout_id, user_id) -> workouts(id, user_id) ON DELETE CASCADE` |
| `activity_id` | `uuid` | NOT NULL; composite FK `(activity_id, user_id) -> activities(id, user_id) ON DELETE CASCADE` |
| `match_method` | `text` | NOT NULL, CHECK (`automatic`, `manual`) |
| `match_confidence` | `numeric` | nullable, CHECK (`>= 0 AND <= 1`) |
| `is_primary` | `boolean` | NOT NULL DEFAULT `true` |
| `matched_at` | `timestamptz` | NOT NULL |
| `matched_by` | `uuid` | nullable, FK -> `auth.users(id) ON DELETE SET NULL` |
| `created_at` | `timestamptz` | NOT NULL |

Constraints:
- `UNIQUE (workout_id, activity_id)`
- Partial unique index: `UNIQUE (workout_id) WHERE is_primary = true`
- Partial unique index: `UNIQUE (activity_id) WHERE is_primary = true`.

### 2.14 `recovery_logs`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `log_date` | `date` | NOT NULL (local calendar date in runner timezone) |
| `timezone_name` | `text` | NOT NULL |
| `sleep_duration_min` | `integer` | nullable, CHECK (`0..1440`) |
| `sleep_quality` | `smallint` | nullable, CHECK (`1..5`) |
| `fatigue` | `smallint` | nullable, CHECK (`1..10`) |
| `soreness` | `smallint` | nullable, CHECK (`1..10`) |
| `stress` | `smallint` | nullable, CHECK (`1..10`) |
| `motivation` | `smallint` | nullable, CHECK (`1..10`) |
| `resting_hr_bpm` | `smallint` | nullable, CHECK (`30..130`) |
| `hrv_ms` | `numeric` | nullable, CHECK (`> 0`) |
| `pain_notes` | `text` | nullable |
| `general_notes` | `text` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Unique: `(user_id, log_date)`.

### 2.15 `performance_metrics`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `metric_key` | `text` | NOT NULL |
| `period_type` | `text` | NOT NULL, CHECK (`daily`, `weekly`, `monthly`) |
| `period_start` | `date` | NOT NULL |
| `period_end` | `date` | NOT NULL |
| `value_numeric` | `numeric` | nullable |
| `unit` | `text` | NOT NULL |
| `source` | `text` | NOT NULL, CHECK (`calculated`, `manual`, `provider`) |
| `completeness` | `numeric` | nullable, CHECK (`>= 0 AND <= 1`) |
| `calculation_version` | `text` | NOT NULL |
| `metadata` | `jsonb` | nullable |
| `calculated_at` | `timestamptz` | NOT NULL |

Constraints:
- `CHECK (period_end >= period_start)`
- `UNIQUE (user_id, metric_key, period_type, period_start, calculation_version)`.

### 2.16 `training_loads` (Per-Activity Session Load)

Stores strictly **one per-activity session load** row (`1:1` with `activities`), keeping `srpe`, `hr_trimp_estimate`, and `duration_estimate` distinct (`DEC-05`). Rolling 7-day acute and 28-day chronic snapshots live separately in `daily_training_load_summaries`.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `activity_id` | `uuid` | NOT NULL, UNIQUE; composite FK `(activity_id, user_id) -> activities(id, user_id) ON DELETE CASCADE` |
| `log_date` | `date` | NOT NULL (local calendar date of `activity.started_at` in runner/activity `timezone_name`) |
| `duration_min` | `numeric` | nullable, CHECK (`>= 0`) |
| `session_rpe` | `smallint` | nullable, CHECK (`1..10`) |
| `session_load_au` | `numeric` | nullable, CHECK (`>= 0`) |
| `unit` | `text` | NOT NULL DEFAULT `'au'` |
| `method` | `text` | NOT NULL, CHECK (`srpe`, `hr_trimp_estimate`, `duration_estimate`) |
| `is_estimated` | `boolean` | NOT NULL |
| `source_data` | `jsonb` | NOT NULL (inputs present: `duration_min`, `rpe`, `avg_hr`, `resting_hr`, `max_hr`) |
| `completeness` | `numeric` | NOT NULL, CHECK (`>= 0 AND <= 1`) |
| `calculation_version` | `text` | NOT NULL |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (activity_id)` (ensures RPE updates deterministically recalculate and upsert the single session load row in-place with zero duplicate records)
- `CHECK ((method = 'srpe' AND is_estimated = false AND session_rpe IS NOT NULL) OR (method IN ('hr_trimp_estimate', 'duration_estimate') AND is_estimated = true))`
- Index: `(user_id, log_date DESC)`.

### 2.17 `daily_training_load_summaries` (Per-Day Aggregate & Rolling 7d/28d Snapshots)

Materialized daily aggregate and rolling load snapshot table, deterministically recomputed per `(user_id, summary_date)` from `training_loads` whenever an activity is synced, deleted, or its `session_rpe` is updated.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `summary_date` | `date` | NOT NULL (local calendar date) |
| `session_count` | `integer` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) |
| `srpe_load_au` | `numeric` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) (sum of `srpe` sessions that day) |
| `hr_trimp_load_au` | `numeric` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) (sum of `hr_trimp_estimate` sessions that day) |
| `duration_estimate_load_au` | `numeric` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) (sum of `duration_estimate` sessions that day) |
| `combined_load_au` | `numeric` | nullable, CHECK (`>= 0`) (optional display aggregate only when method breakdown is attached; never treats estimates as sRPE) |
| `acute_load_7d` | `numeric` | nullable, CHECK (`>= 0`) (rolling 7-day snapshot) |
| `chronic_load_28d` | `numeric` | nullable, CHECK (`>= 0`) (rolling 28-day snapshot) |
| `method_breakdown` | `jsonb` | NOT NULL (session counts and AU totals per method) |
| `completeness` | `numeric` | NOT NULL, CHECK (`>= 0 AND <= 1`) (share of load/sessions using user-reported `srpe`) |
| `has_estimated_inputs` | `boolean` | NOT NULL |
| `calculation_version` | `text` | NOT NULL |
| `recalculated_at` | `timestamptz` | NOT NULL |

Unique: `(user_id, summary_date)` (prevents duplicate daily snapshots across recalculations).

### 2.18 `ai_coach_sessions`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `session_type` | `text` | NOT NULL, CHECK (`weekly_review`, `chat`, `goal_review`, `recovery_review`) |
| `title` | `text` | nullable |
| `context_fingerprint` | `text` | nullable (for caching unchanged weekly reviews) |
| `context_snapshot` | `jsonb` | minimized, versioned |
| `status` | `text` | NOT NULL, CHECK (`active`, `completed`, `failed`) |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraint: `UNIQUE (id, user_id)` (composite FK target for `ai_coach_messages`, `ai_recommendations`).

### 2.19 `ai_coach_messages`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `session_id` | `uuid` | NOT NULL; composite FK `(session_id, user_id) -> ai_coach_sessions(id, user_id) ON DELETE CASCADE` |
| `role` | `text` | NOT NULL, CHECK (`user`, `assistant`, `system`) |
| `content` | `text` | NOT NULL |
| `structured_payload` | `jsonb` | nullable |
| `provider` | `text` | NOT NULL DEFAULT `'openrouter'` |
| `model_name` | `text` | nullable |
| `provider_request_id` | `text` | nullable |
| `prompt_version` | `text` | nullable |
| `schema_version` | `text` | nullable |
| `latency_ms` | `integer` | nullable, CHECK (`>= 0`) |
| `token_usage` | `jsonb` | nullable |
| `created_at` | `timestamptz` | NOT NULL |

### 2.20 `ai_recommendations`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `session_id` | `uuid` | NOT NULL; composite FK `(session_id, user_id) -> ai_coach_sessions(id, user_id) ON DELETE CASCADE` |
| `training_plan_id` | `uuid` | nullable; composite FK `(training_plan_id, user_id) -> training_plans(id, user_id) ON DELETE CASCADE` (cascade avoids violating the `plan_adjustment` check on plan removal during account deletion; plans are preserved in normal lifecycle per `BR-013`) |
| `recommendation_type` | `text` | NOT NULL, CHECK (`plan_adjustment`, `recovery`, `insight`) |
| `ai_provider` | `text` | NOT NULL DEFAULT `'openrouter'` |
| `ai_model` | `text` | nullable |
| `provider_request_id` | `text` | nullable |
| `prompt_version` | `text` | nullable |
| `schema_version` | `text` | nullable |
| `status` | `text` | NOT NULL, CHECK (`pending`, `accepted`, `rejected`, `expired`, `superseded`) |
| `summary` | `text` | NOT NULL |
| `rationale` | `text` | NOT NULL |
| `evidence` | `jsonb` | NOT NULL |
| `proposal` | `jsonb` | nullable |
| `confidence` | `numeric` | nullable, CHECK (`>= 0 AND <= 1`) |
| `limitations` | `text[]` | NOT NULL DEFAULT `'{}'` |
| `based_on_plan_version` | `integer` | nullable, CHECK (`>= 1`) |
| `expires_at` | `timestamptz` | nullable |
| `decided_at` | `timestamptz` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `UNIQUE (id, user_id)` (composite FK target for `plan_adjustments`)
- `CHECK (recommendation_type <> 'plan_adjustment' OR (training_plan_id IS NOT NULL AND based_on_plan_version IS NOT NULL))`
- Index: `(user_id, status, created_at DESC)`.

### 2.21 `plan_adjustments`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `training_plan_id` | `uuid` | NOT NULL; composite FK `(training_plan_id, user_id) -> training_plans(id, user_id) ON DELETE CASCADE` |
| `recommendation_id` | `uuid` | nullable; composite FK `(recommendation_id, user_id) -> ai_recommendations(id, user_id) ON DELETE SET NULL (recommendation_id)` |
| `adjustment_type` | `text` | NOT NULL |
| `before_snapshot` | `jsonb` | NOT NULL |
| `after_snapshot` | `jsonb` | NOT NULL |
| `reason` | `text` | NOT NULL |
| `applied_at` | `timestamptz` | NOT NULL |
| `applied_by` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `created_at` | `timestamptz` | NOT NULL |

### 2.22 `sync_logs`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `connection_id` | `uuid` | nullable; composite FK `(connection_id, user_id) -> strava_connections(id, user_id) ON DELETE SET NULL (connection_id)` |
| `provider` | `text` | NOT NULL DEFAULT `'strava'` |
| `sync_type` | `text` | NOT NULL |
| `status` | `text` | NOT NULL, CHECK (`queued`, `processing`, `succeeded`, `partial`, `failed`) |
| `started_at` / `finished_at` | `timestamptz` | nullable |
| `imported_count` | `integer` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) |
| `updated_count` | `integer` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) |
| `error_code` | `text` | nullable |
| `error_message_safe` | `text` | nullable |
| `metadata` | `jsonb` | nullable |
| `created_at` | `timestamptz` | NOT NULL |

### 2.23 `sync_jobs`

Durable PostgreSQL job queue (`DEC-04`).

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `connection_id` | `uuid` | nullable; composite FK `(connection_id, user_id) -> strava_connections(id, user_id) ON DELETE SET NULL (connection_id)` |
| `provider` | `text` | NOT NULL DEFAULT `'strava'` |
| `job_type` | `text` | NOT NULL (`strava.initial_import`, `strava.incremental_sync`, `strava.activity_upsert`, `strava.activity_delete`, etc.) |
| `payload` | `jsonb` | NOT NULL (minimal identifiers/cursors only; no secrets) |
| `idempotency_key` | `text` | NOT NULL, UNIQUE |
| `status` | `text` | NOT NULL, CHECK (`pending`, `processing`, `retry_wait`, `completed`, `failed`) |
| `attempts` | `smallint` | NOT NULL DEFAULT `0`, CHECK (`>= 0`) |
| `max_attempts` | `smallint` | NOT NULL DEFAULT `5`, CHECK (`>= 1`) |
| `next_run_at` | `timestamptz` | NOT NULL DEFAULT `now()` |
| `locked_at` | `timestamptz` | nullable |
| `locked_by` | `text` | nullable |
| `lease_expires_at` | `timestamptz` | nullable |
| `error_classification` | `text` | nullable (`rate_limit`, `auth_required`, `transient_network`, `invalid_payload`, `permanent`) |
| `last_error_code` | `text` | nullable |
| `last_error_safe` | `text` | nullable |
| `finished_at` | `timestamptz` | nullable |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL |

Constraints & Indexes:
- `CHECK (attempts <= max_attempts)`
- Index: `(status, next_run_at)`, `(status, lease_expires_at)`, `(user_id, created_at DESC)`.

### 2.24 `audit_logs`

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `auth.users(id) ON DELETE CASCADE` |
| `actor_user_id` | `uuid` | nullable, FK -> `auth.users(id) ON DELETE SET NULL` |
| `action` | `text` | NOT NULL |
| `entity_type` | `text` | NOT NULL |
| `entity_id` | `uuid` | nullable |
| `before_snapshot` | `jsonb` | nullable |
| `after_snapshot` | `jsonb` | nullable |
| `metadata` | `jsonb` | nullable |
| `created_at` | `timestamptz` | NOT NULL |

Do not store secrets or excessive sensitive details in snapshots.

---

## 3. Index and Constraint Checklist

- Composite `(referenced_id, user_id)` foreign keys on all user-owned parent-child relationships (`UNIQUE (id, user_id)` on `runner_goals`, `strava_connections`, `activities`, `training_plans`, `training_phases`, `workouts`, `ai_coach_sessions`, `ai_recommendations`).
- Column-scoped `ON DELETE SET NULL (<fk_col>)` on nullable composite FKs so `user_id` is never nulled on parent delete.
- Partial unique active plan index: `training_plans (user_id) WHERE status = 'active'`.
- Partial unique active primary goal index: `runner_goals (user_id) WHERE priority = 'primary' AND status = 'active'`.
- Partial unique active Strava connection index: `strava_connections (user_id, provider) WHERE status <> 'disconnected'`.
- Strava external ID check + partial unique activity dedup index: `activities (user_id, provider, external_activity_id) WHERE external_activity_id IS NOT NULL`.
- Partial unique primary match indexes on `workout_activities (workout_id) WHERE is_primary = true` and `(activity_id) WHERE is_primary = true`.
- Unique `(user_id, log_date)` on `recovery_logs`; unique `(activity_id)` on `training_loads`; unique `(user_id, summary_date)` on `daily_training_load_summaries`.
- Training load consistency check (`srpe` requires `is_estimated = false` and `session_rpe IS NOT NULL`; estimates require `is_estimated = true`).
- Date, pace (`min <= max` numerically in `sec_per_km`), and RPE (`min <= max`) ordering `CHECK` constraints on `training_plans`, `training_phases`, `workouts`, `workout_steps`, and `performance_metrics`.
- AI plan adjustment check (`recommendation_type <> 'plan_adjustment' OR (training_plan_id IS NOT NULL AND based_on_plan_version IS NOT NULL)`).
- Unique `idempotency_key` on `sync_jobs` and `state_hash` on `oauth_states`.
- Indexes: `activities (user_id, started_at DESC)`, `workouts (user_id, scheduled_date)`, `workouts (training_plan_id, scheduled_date)`, `sync_jobs (status, next_run_at)`, `sync_jobs (status, lease_expires_at)`, `ai_recommendations (user_id, status, created_at DESC)`, `training_loads (user_id, log_date DESC)`, `daily_training_load_summaries (user_id, summary_date DESC)`.
- Transactions / PostgreSQL RPCs for plan activation, accepted AI plan adjustments, and `claim_sync_jobs` (`FOR UPDATE SKIP LOCKED`).

---

## 4. RLS and Token Security Baseline

Enable RLS on every table in Section 2.

- **Standard user-owned tables:**
  - `SELECT`: `auth.uid() = user_id`
  - `INSERT`: `auth.uid() = user_id`
  - `UPDATE`: `auth.uid() = user_id` in both `USING` and `WITH CHECK`
  - `DELETE`: `auth.uid() = user_id`
- **Server-only tables (`strava_connection_tokens`, `oauth_states`):**
  - Enable RLS with **zero** policies for `anon` or `authenticated`. Access exclusively via trusted server-side `service_role` code.
- **`sync_jobs`:**
  - `SELECT` allowed for `auth.uid() = user_id` (displaying queue progress/errors safely without exposing secrets); `INSERT`/`UPDATE` mutations performed via `service_role` or atomic RPCs.
- **Encryption & Key Rotation:**
  - Strava access and refresh tokens are encrypted server-side using **AES-256-GCM** with a 32-byte `STRAVA_TOKEN_ENCRYPTION_KEY` (`v1:<iv>:<auth_tag>:<ciphertext>`) before persistence in `strava_connection_tokens`.
  - Storing `key_version` enables future key rotation by supporting decryption of older `v1` records while encrypting new writes with `v2` during token refresh or batch re-encryption.
- **Verification:** Test RLS and cross-user composite FK rejection using at least two distinct user identities in Milestone 2 and regression tests.

---

## 5. Migration Implementation Notes

- Generate schema in small, ordered SQL migrations in `supabase/migrations/`.
- Add constraints and indexes cleanly per milestone.
- Generate TypeScript types from the Supabase schema (`supabase gen types typescript`).
- Keep seed data synthetic; never commit real Strava tokens or personal activity data.

---

## 6. AI Provider Metadata and Secrets

- Store provider/model identifiers, request IDs, prompt/schema versions, latency, and token/usage metadata only when returned by OpenRouter.
- Never store `OPENROUTER_API_KEY` in application tables; store it in server-side environment secrets.
- Persist only minimized context snapshots required for reproducibility and audit, with no raw GPS coordinates, Strava tokens, or credentials.
- Model IDs are configuration strings, not foreign keys to a static catalogue.
