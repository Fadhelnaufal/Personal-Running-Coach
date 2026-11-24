# Training Methodology
## Personal Running Coach

**Purpose:** Define endurance training principles, deterministic Training Plan Engine defaults, and safety boundaries. This document is not a substitute for a qualified coach or healthcare clinician.  
**Reconciled:** 2026-11-24 (`DEC-03`, `DEC-05`, `DEC-06`)

---

## 1. Evidence-Informed Methodology Principles

1. **Individualization:** Programs start from the runner's demonstrated recent history, goals, availability, and constraints.
2. **Specificity:** Training gradually progresses toward the physiological demands of the target event.
3. **Progressive overload:** Load increases incrementally across one or a small number of dimensions rather than spiking abruptly.
4. **Recovery & adaptation:** Adaptation occurs alongside recovery; rest and lighter weeks are structural components of training.
5. **Consistency:** A realistic, sustainable schedule outperforms an aggressive template that causes burnout or dropout.
6. **Reversibility:** Interruptions, illness, or life stress reduce capacity; plans must remain adaptable.
7. **Transparency:** Every pace, HR, or RPE prescription must communicate its basis (`measured`, `estimated`, or `rpe_fallback`) and data limitations.

---

## 2. Required Baseline & Sufficiency Rules

Before generating a plan, collect:
- Recent 4-8 weeks running volume (from Strava history or manual input).
- Weekly running frequency (`weekly_running_days`) and `preferred_training_days` / `unavailable_days`.
- Longest recent run.
- Recent race result or time trial (distance, elapsed time, date).
- Typical easy effort/pace, resting HR / max HR / LTHR (only if known).
- Goal distance, optional target time, optional race date.
- Current pain, injury history, or limitations.

### Baseline Sufficiency & Data Completeness Tiers
- **Never fabricate missing values:** Unknown inputs remain `NULL` and are never coerced to `0`.
- **Sufficiency classification (recorded in `training_plans.generated_from_snapshot`):**
  - `sufficient`: Recent 4-8 weeks volume + frequency/availability + credible recent race/time-trial (< 16 weeks) all present. Pace bands and structured quality workouts may be generated within provisional guardrails.
  - `partial`: Recent volume and availability are known, **but** no credible recent race/time-trial exists (or > 16 weeks old without corroborating evidence). Generate structure using **RPE + talk-test guidance** (`target_pace_*` left `NULL`) and disclose missing pace baseline.
  - `sparse`: Recent weekly mileage or frequency history is missing/fragmented. Use conservative entry frequency/duration defaults, flag low baseline completeness, omit or minimize high-intensity threshold/interval blocks, and prioritize easy aerobic consistency + optional strides until 3-4 weeks of consistent history accumulate.
- **Explicit uncertainty warnings:** Every generated plan preview must surface which baseline fields were missing or estimated and how that narrowed prescription specificity.

---

## 3. Training Phases

Not every plan requires all phases; short blocks compress or omit early base/speed phases as needed.

| Phase | Purpose | Typical Focus |
|---|---|---|
| `base` (Base Building) | Establish routine and aerobic foundation | Easy volume, moderate long run, optional strides |
| `aerobic` (Aerobic Development) | Build aerobic durability | Steady volume, easy/steady runs |
| `threshold` (Threshold Development) | Raise sustainable aerobic effort | Tempo / threshold blocks |
| `speed` (Speed Development) | Improve running economy and neuromuscular turnover | Structured intervals / repetitions |
| `race_specific` (Race-Specific) | Align specificity to event demands | Race-pace segments, event-specific long runs |
| `taper` (Tapering) | Shed accumulated fatigue before race day | Progressive volume reduction while retaining brief intensity |
| `recovery` (Recovery/Transition) | Post-event or post-cycle restoration | Easy running, rest, reflection |

---

## 4. Workout Taxonomy

Persisted `workouts.workout_type` values:
- `easy_run`: Light conversational effort.
- `recovery_run`: Very light effort; optional after demanding sessions.
- `long_run`: Extended aerobic duration/distance for endurance.
- `steady_run`: Moderate aerobic effort below lactate threshold.
- `tempo_run`: Sustained effort around threshold.
- `interval`: Structured work bouts with timed/distance recovery.
- `repetition`: Faster short bouts with full recovery.
- `hill_repeats`: Controlled uphill efforts with jog/walk down recovery.
- `race_pace`: Target event pace specificity.
- `strides`: Short controlled accelerations with full recovery.
- `rest`: Planned non-running recovery day.
- `cross_training`: Non-running aerobic work when enabled by user.

---

## 5. Intensity Source Hierarchy

Use the highest-confidence supported intensity source in order:
1. **Pace zones** (only when a credible recent race result or time trial within the configured recency window exists).
2. **Heart-rate zones** (only when consistent HR data and known `max_hr_bpm` / `lthr_bpm` exist; never invent max HR solely from `220 - age` without labeling it an unverified estimate).
3. **RPE / Talk Test** (universal safe fallback whenever pace or HR baselines are sparse or external factors like heat/terrain dominate).

Do not mix zone models silently. HR is affected by heat, hydration, stress, elevation, fatigue, and optical sensor drift; pace is affected by terrain, wind, and GPS accuracy.

### Suggested RPE Scale (1-10)

| RPE | Description | Typical Use |
|---|---|---|
| 1-2 | Very easy | Recovery / warm-up |
| 3-4 | Easy, conversational | Easy run / aerobic base |
| 5-6 | Moderate / steady | Steady aerobic efforts |
| 7-8 | Hard, controlled | Threshold / intervals |
| 9 | Very hard | Short repetitions / race effort |
| 10 | Maximal | Rarely prescribed in routine training |

---

## 6. Deterministic Training Plan Engine Configuration (`DEC-06`)

The Training Plan Engine is **100% deterministic**. The parameters below are **provisional product configuration defaults**, not universal physiological laws. Every parameter must live in a typed, configurable engine config object (logged inside `training_plans.generated_from_snapshot`) and require future validation against real training outcomes.

| Parameter | Provisional Default | Rationale | When NOT to Apply / Override Rule |
|---|---|---|---|
| **Plan duration bounds** | `4` to `24` weeks (default `12` weeks if no `race_date` is set) | Fewer than 4 weeks limits meaningful adaptation; >24 weeks is better split into staged cycles | Warn if `race_date` is `< 4` weeks away (shift to short maintenance/taper mode); split `> 24` weeks into base + race-specific blocks |
| **Phase allocation** | Taper: `1-2` weeks (for `>= 8` week race plans); Race-Specific: ~`20-25%`; Threshold/Speed: ~`25-35%`; Base/Aerobic: remaining early weeks | Progresses from general aerobic durability to event specificity and fatigue dissipation | Omit `taper` for non-race custom fitness plans; compress `threshold`/`speed` when baseline completeness is low |
| **Pace zone derivation** | Derived from recent race/time-trial (< 16 weeks) using standardized pace-ratio bands relative to estimated threshold/VDOT equivalent | Keeps pace targets grounded in demonstrated fitness rather than aspirational goal time | Do **not** generate exact min/km targets when no credible recent race/TT exists; fall back to RPE (`DEC-06`) |
| **Weekly volume progression cap** | Max ~`5-10%` weekly volume increase (or small absolute step, e.g. `+3-5 km` for low-volume baselines) | Prevents abrupt volume spikes when building from low or moderate mileage | Hold volume flat or reduce if recent adherence is `< 75%`, recovery flags show `caution`/`high_caution`, or injury history is active |
| **Step-back (deload) cadence** | Every `3rd` or `4th` week (volume reduced ~`15-25%`) | Schedules periodic fatigue dissipation during progressive build blocks | Skip or adjust deload placement only when aligning around a final `taper` week |
| **Hard-session spacing** | Minimum `48 hours` (at least 1 easy or rest day) between quality sessions (`tempo_run`, `interval`, `repetition`, `hill_repeats`, `race_pace`) and `long_run` where feasible | Reduces consecutive high-stress musculoskeletal and neuromuscular load | Never schedule back-to-back quality sessions by default; allow user manual override only with explicit conflict warning |
| **Long-run proportion guardrail** | Target ~`25-35%` of weekly volume (higher end only for lower-frequency 3-day/week schedules, capped to avoid excessive single-session strain) | Balances endurance stimulus with sustainable recovery across the week | Cap more conservatively if `longest_recent_run_m` is much shorter than target long run or if user runs `<= 3` days/week on sparse baseline |
| **Easy-intensity majority** | ~`75-85%` of weekly volume at easy/recovery effort (`RPE 2-4`) for endurance plans | Supports aerobic development while preserving freshness for key sessions | Adjust only for very low weekly frequency where steady running replaces a dedicated second quality workout |

### Goal Feasibility Validation
- Before activating a plan, compare `target_time_sec` and `race_date` against recent PRs, recent pace, and current weekly volume.
- If target time or weekly ramp appears unrealistic relative to current evidence, surface an **explicit feasibility warning** and propose a conservative milestone or adjusted pace band rather than silently prescribing unsafe workouts. Never guarantee race outcomes.

---

## 7. Missed Workout Policy (`DEC-03`)

- `missed` is a **derived presentation state** (`status = 'planned'` AND `scheduled_date < local_today` in the runner's `timezone_name`).
- Never automatically stack, roll forward, or convert a missed workout into a double session the next day.
- User actions on an unresolved missed workout: `skip`, `reschedule` (with conflict/load/recovery check), or `modify`. Preserve original `scheduled_date` history.

---

## 8. Training Load Data Model & Method Distinctions (`DEC-05`)

Training load is modeled across **two distinct database layers** so per-activity calculations, multi-session days, rest days, and rolling windows remain deterministic without duplicate or stale records:

1. **Per-Activity Session Load (`training_loads`, `1:1` per activity):**
   - Stores exactly one row per activity (`UNIQUE (activity_id)`).
   - Every row records `method`, `unit` (`au`), `calculation_version`, `source_data`, `completeness`, and `is_estimated`.
   - When the runner adds or edits `session_rpe` after Strava sync, the single `training_loads` row is recalculated **in-place** (`method = 'srpe'`, `is_estimated = false`), preventing duplicate session records.
2. **Per-Day Aggregate & Rolling Load Snapshots (`daily_training_load_summaries`, `1:1` per local date):**
   - Stores one row per `(user_id, summary_date)` in the runner's `timezone_name`, recomputed deterministically forward from the affected activity's `log_date` whenever an activity syncs, is deleted, or updates `session_rpe`.
   - **Per-day aggregates** keep methods separated (`srpe_load_au`, `hr_trimp_load_au`, `duration_estimate_load_au`, plus `method_breakdown` and `completeness`) so proxy estimates are never silently merged into `srpe` totals.
   - **Rolling 7-day acute load (`acute_load_7d`) and rolling 28-day chronic load (`chronic_load_28d`)** are persisted as **versioned daily snapshots** on `daily_training_load_summaries` (covering rest days as zero-session calendar days within active windows). Rolling window math (7d/28d rolling daily average or EWMA) is tagged in `calculation_version`.

### Calculation Methods (Never Equated or Silently Converted)

1. **`srpe` (Preferred, User-Reported; `is_estimated = false`):**
   - Formula: `session_load_au = duration_min * session_rpe` (`au`, where `session_rpe` is user-entered `1-10`).
   - Recalculated automatically if the user enters or updates `session_rpe` after Strava sync.
2. **`hr_trimp_estimate` (Estimated Fallback; `is_estimated = true`):**
   - Used only when `session_rpe` is `NULL` **and** activity `average_hr_bpm` plus runner `resting_hr_bpm` and `max_hr_bpm` (`max_hr_bpm > resting_hr_bpm`) are all present. Never fabricate resting or max HR.
   - **Selected Method (Banister-style exponential TRIMP):**
     - `hr_reserve_fraction = clamp((avg_hr - resting_hr) / (max_hr - resting_hr), 0, 1)`
     - `trimp_estimate = duration_min * hr_reserve_fraction * 0.64 * exp(1.92 * hr_reserve_fraction)`
   - **Assumptions & Limitations:** Assumes steady-state aerobic HR linearity; uses a single sex-neutral weighting exponent (`1.92`) as a provisional MVP configuration (not a universal physiological constant); sensitive to optical wrist-HR cadence lock, heat/dehydration cardiac drift, HR lag during short intervals, and uncalibrated `max_hr_bpm`/`resting_hr_bpm`.
   - **Validation Requirement:** Must be treated strictly as a directional estimated signal (`is_estimated = true`), never equated to `srpe` arbitrary units, and evaluated against the runner's recorded `srpe` sessions before calibrating future engine weights.
3. **`duration_estimate` (Proxy Fallback; `is_estimated = true`):**
   - Used only when both `session_rpe` and valid HR inputs are absent, using `duration_min` (provisional baseline multiplier `duration_min * 3.5` AU proxy, clearly tagged as a duration-only proxy).
   - Must **never** be presented as equivalent to `srpe` or `hr_trimp_estimate`; UI and AI Coach must disclose that session intensity was unknown.

### Rolling Acute/Chronic Caveat
- Acute/chronic load ratios are decision-support signals only and must never be presented as deterministic injury thresholds or medical predictors.

---

## 9. Recovery, Adaptation & Safety Guardrails

- Deterministic recovery flags: `normal`, `caution`, `high_caution` (missing inputs reduce confidence rather than indicating positive readiness).
- **Safety rules (Non-Negotiable):**
  - No medical diagnosis, prescription, or injury-free guarantee.
  - Never recommend running through severe or worsening pain.
  - Advise stopping exercise and seeking qualified clinical evaluation for red-flag symptoms (chest pain, fainting, severe breathlessness, acute neurological symptoms, or sharp/worsening pain).
  - AI recommendations cannot override deterministic safety guardrails.
