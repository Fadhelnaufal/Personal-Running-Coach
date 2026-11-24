# Design Direction
## Personal Running Coach

**Authoritative Direction:** Modern Gradient Athletic - Light First (Approved `DEC-01`, 2026-11-24)  
**Antislop Mode:** `during` (anti-generic-design and quality rules applied while building, not deferred to post-hoc review)  
**Default Liveliness Dials:** `ENERGY 2 / RHYTHM 2 / MOTION 1` (balanced athletic clarity, structured section rhythm, subtle functional transitions only)

---

## 1. Design Intent

Create a crisp, light-first, data-rich running workspace that feels like a dedicated performance training companion rather than a generic SaaS admin template or an AI-generated dashboard.

Every screen must prioritize one clear focal point, explicit numbers with units and time periods, and honest disclosure of incomplete or estimated data.

---

## 2. Visual Principles & Anti-Generic-Design Rules

1. **Purpose-Driven Hierarchy:** Gradients, shadows, badges, and icons are allowed only when they serve an explicit visual hierarchy or functional need. Never stack glassmorphism, glowing backgrounds, decorative grids, or buzzword badges.
2. **Light-First Athletic Surfaces:** Clean off-white canvas (`#F7F8FC`) paired with crisp white cards (`#FFFFFF`) and cool neutral borders (`#E7EAF1`). Light mode is the MVP theme (no broken or half-implemented dark toggle).
3. **Selective Gradient Focal Points:** Use the signature blue-purple-cyan gradient strictly to anchor high-priority focal surfaces (such as the active training summary / today's key workout hero card or primary active plan banner). Never wash the entire page or every card in gradients.
4. **Data Honesty & Restraint:** Never display fabricated statistics, fake live metrics, or placeholder claims. Missing data renders explicitly as missing or "Not recorded", never as zero.
5. **No AI Template Clones:** Avoid uniform bento-grid filler, identical 3-column feature cards, decorative arrows (`->`) on every button, or generic "AI Powered" capsule badges.
6. **Deliberate Radius Hierarchy:** Cards (`14px-20px`), interactive controls (`8px-12px`), and compact filter/status pills (`9999px`) must maintain clear radius differentiation rather than making every element pill-shaped.
7. **Mobile-First Craft:** Mobile views are designed specifically for thumb-friendly single-column training use, not shrunk desktop tables.

---

## 3. Design Tokens

### Color Tokens

| Role | Token | Value | Usage & Rationale |
|---|---|---|---|
| App Background | `--bg-canvas` | `#F7F8FC` | Cool off-white canvas separating elevated white cards |
| Primary Surface | `--bg-surface` | `#FFFFFF` | Clean rounded content and metric cards |
| Subtle Surface | `--bg-subtle` | `#F1F4FA` | Secondary inset containers and table/chart tracks |
| Primary Text | `--text-primary` | `#20212B` | High-contrast charcoal for headings, metrics, and body |
| Secondary Text | `--text-secondary` | `#697080` | Muted cool slate for labels, units, and timestamps |
| Border | `--border-subtle` | `#E7EAF1` | Hairline structural separation without heavy drop shadows |
| Primary Accent (Blue) | `--accent-blue` | `#3478F6` | Primary actions, active navigation, distance/volume series |
| Secondary Accent (Purple) | `--accent-purple` | `#8B5CF6` | Threshold/intensity highlights, AI coach focal accents |
| Tertiary Accent (Cyan) | `--accent-cyan` | `#50C9CE` | Recovery/readiness positive trend series |
| Soft Blue | `--tint-blue` | `#EDF3FF` | Subtle badge/icon container for primary/easy sessions |
| Soft Purple | `--tint-purple` | `#F1EBFF` | Subtle container for quality/threshold or AI insight tags |
| Soft Cyan | `--tint-cyan` | `#E8FAFA` | Subtle container for recovery/completion highlights |
| Focal Gradient | `--gradient-athletic` | `linear-gradient(110deg, #3478F6 0%, #8B5CF6 58%, #50C9CE 100%)` | Focal hero/summary card only; white text (`#FFFFFF`) must pass WCAG AA across every stop |
| Semantic Success | `--status-success` | `#16A34A` | Completed workouts and healthy sync states (paired with icon/text) |
| Semantic Warning | `--status-warning` | `#D97706` | Caution recovery flag, stale proposal, partial sync |
| Semantic Critical | `--status-danger` | `#DC2626` | High-caution pain warning, sync failure, destructive confirmation |

**Contrast Rule (WCAG 2.2 AA):** Normal text requires >= 4.5:1 contrast; large text (18px+ or 14px bold+) requires >= 3:1. Verify contrast across the full gradient span (`#3478F6` to `#50C9CE`), darkening text overlays or gradient stops if cyan highlights reduce white-text contrast below 4.5:1. Do not place light gray secondary text on tinted surfaces without checking contrast.

### Typography

- **Primary Sans:** `Geist Sans` (`--font-geist-sans`) for UI headings, navigation, labels, and coach prose. Reason: crisp geometric legibility that balances athletic modernity with dense numeric readability.
- **Numeric / Data Mono:** `Geist Mono` (`--font-geist-mono`) with `tabular-nums` for paces, distances, splits, durations, HR/HRV values, and timestamps. Reason: vertical alignment of pace/volume columns and clear visual distinction between prose and measured telemetry. Do not use oversized monospace headings purely for "terminal" aesthetics.
- **Type Scale Hierarchy:** Clear jump between page title (`24px-28px` semibold), hero metric (`28px-36px` bold tabular), card title (`16px-18px` semibold), body (`14px-15px`), and metadata/units (`12px-13px`).

### Spacing, Radius, and Elevation

- **Spacing Scale:** `4px` base grid (`4, 8, 12, 16, 20, 24, 32, 48px`). Generous breathing room inside cards (`16px-20px` mobile, `20px-24px` desktop) and between sections (`16px-24px`).
- **Radius Scale:**
  - Cards & hero containers: `14px` to `20px` (`rounded-2xl` / `16px` standard card, `20px` focal hero card).
  - Buttons, inputs, select triggers: `8px` to `12px` (`rounded-lg` to `rounded-xl`).
  - Compact filter pills, workout type chips, status badges: `9999px` (`rounded-full`) used selectively for compact controls and status pills.
- **Borders & Shadows:** Prefer `1px solid #E7EAF1` borders with minimal elevation (`0 2px 10px rgba(32, 33, 43, 0.04)`). Reserve stronger shadow (`0 10px 25px rgba(52, 120, 246, 0.18)`) exclusively for the primary gradient hero card. Avoid nested cards inside cards.

---

## 4. Information Architecture & Layouts

### Primary Navigation
1. Dashboard (`/dashboard`)
2. Training Calendar (`/calendar`)
3. Activities (`/activities`)
4. Analytics (`/analytics`)
5. Recovery (`/recovery`)
6. AI Coach (`/coach`)
7. Settings (`/settings`)

Every navigation item must link to a real, accessible route. Never render dead links or non-functional buttons.

### Desktop Layout (`>= 1024px`)
- Persistent left sidebar (`240px-260px`) on `#FFFFFF` with `#E7EAF1` right border, clear active state (`#EDF3FF` tint + `#3478F6` label/indicator), and compact Strava sync status footer.
- Main content canvas on `#F7F8FC` with controlled max width (`1200px-1280px`) and multi-column grid where data density justifies it (e.g., Dashboard: 1 focal gradient summary card + asymmetric 2-column supporting metrics/next-workout layout; Calendar + detail side drawer/panel).

### Mobile Layout (`< 768px`)
Preserves the visual language of the previously provided three-smartphone reference (note: no image asset is stored inside the repository; the layout rules below codify its structure for running and training):
- **Compact App Bar:** Page title, contextual timeframe/plan badge, and quick action/sync trigger (`44px+` touch targets).
- **Bottom Tab Navigation:** Fixed bottom bar (`#FFFFFF`, top `#E7EAF1` hairline, safe-area inset aware) surfacing the 5 primary daily destinations (Dashboard, Calendar, Activities, Recovery, Coach) with Analytics and Settings cleanly accessible from Dashboard/More or header utility links so tabs never overcrowd or truncate.
- **Focal Gradient Hero Card:** One bold `--gradient-athletic` rounded card (`18px-20px`) near the top of key mobile views (e.g., Dashboard weekly training progress / active goal countdown) with crisp white typography and high-contrast numeric highlights.
- **Rounded White Supporting Cards:** Stacked `16px` rounded `#FFFFFF` cards with generous padding, compact pill filters/segment controls (e.g., `Week` / `Month`, `7D` / `4W` / `12W`), and scannable single-focus rows.
- **No Horizontal Overflow:** All charts, calendars, workout steps, and pill rows must fit cleanly within `375px` viewports without horizontal scrolling or clipped text.

### Tablet Layout (`768px - 1023px`)
- Collapsible/compact sidebar or responsive 2-column grid where Dashboard summary and Calendar detail panels coexist comfortably.

---

## 5. Page-Level Content & Card Hierarchy

### Dashboard
Purpose: Answer "How is my training going, and what should I focus on next?"
- **Focal Card (Gradient Hero):** Active goal, current training phase, weekly planned vs. completed progress.
- **Supporting Cards (White `#FFFFFF`):** Next scheduled workout, weekly distance & duration (`MetricValue`), latest synced Strava activity (`ActivityRow`), today's recovery check-in prompt/status, and pending AI Coach proposal alert (if any).
- Avoid displaying all analytics charts on the Dashboard.

### Training Calendar
- Week view as default (scrollable day list on mobile; 7-day grid + side detail panel on desktop); Month view as secondary toggle via compact pill control.
- Explicit visual distinction between rest days, easy/aerobic sessions, quality/threshold/interval sessions, and derived `missed` (past `planned`) sessions.
- Workout statuses (`planned`, `completed`, `skipped`, `rescheduled`, `modified`, plus derived `missed` label) always show text + icon + color.
- Rescheduling and modifications require accessible menu-based triggers and explicit confirmation dialogs.

### Activities
- Chronological list with compact pill filters (date range, sport type, matched/unmatched).
- Activity detail showing normalized metrics, calculation units, `session_rpe` quick input (optional 1-10 scale), available streams/laps, linked planned workout + match confidence, and manual link/unlink controls.

### Analytics
- Compact pill date-range selector (`4W`, `12W`, `6M`, `Custom`).
- Charts wrapped in `ChartFrame` (title, timeframe, unit, legend, empty state, and accessible summary).
- Weekly/monthly volume & duration, frequency & long-run progression, pace trends grouped by comparable effort/workout type, intensity distribution (only when sufficient data exists), and training load (`sRPE`, `hr_trimp_estimate`, `duration_estimate`) with explicit method badge and non-diagnostic caveat.

### Recovery
- Fast, guilt-free daily check-in using accessible `RecoveryScaleInput` controls (`44px+` tap targets).
- History & trend chart showing missing check-in days as explicit gaps (never interpolated as `0` or "normal").
- Clear notice that readiness flags (`normal`, `caution`, `high_caution`) are decision support, not medical diagnoses.

### AI Coach
- Structured Weekly Review separated into Highlights, Concerns, and Recommendations (`CoachEvidenceList` linking to real activity/metric IDs + `DataCompletenessNote`).
- Proposed plan changes displayed via `AdjustmentDiff` (affected dates, before/after comparison, tradeoffs, confidence, limitations) with explicit **Accept** and **Reject** buttons. Never use an ambiguous "Apply AI" auto-action.
- Grounded conversational Q&A panel with clear disclaimer when AI quota is exhausted and deterministic fallback summary is active.

### Settings
- Runner profile, units, `timezone_name`, training day availability, and goals.
- Strava connection (`activity:read_all` scope disclosure, `Sync Now`, sync history/logs, disconnect).
- AI Coach usage/model visibility, data export, and account deletion workflow.

---

## 6. Chart Visual Guidelines

- Use a constrained, colorblind-conscious palette derived from the core tokens: `#3478F6` (primary/actual volume), `#8B5CF6` (planned target / threshold load), `#50C9CE` (recovery / chronic baseline), `#697080` (secondary reference), `#D97706` (caution threshold).
- Never render placeholder/fake charts when data is absent; show an honest `ChartFrame` empty state explaining what data is needed.
- Always render axis units, readable mobile ticks, and accessible tabular summaries or screen-reader descriptions.

---

## 7. Core Components

- `MetricValue`: value (`Geist Mono` tabular), unit, period, source/estimate indicator.
- `WorkoutTypeBadge`: semantic category (`easy_run`, `tempo_run`, `interval`, etc.) with restrained tint.
- `WorkoutStatus`: text + icon + color (`planned`, `completed`, `skipped`, `rescheduled`, `modified`, derived `missed`).
- `TrainingWeekSummary`: planned vs. completed volume and session count.
- `ActivityRow`: date, distance, duration, pace, RPE badge, match state.
- `PaceDisplay`: formatted pace with explicit unit (`/km` or `/mi`).
- `RecoveryScaleInput`: accessible `1-10` / `1-5` keyboard and touch control (`>= 44px`).
- `ChartFrame`: title, timeframe, units, legend, completeness note, empty/loading/error states.
- `DataCompletenessNote`: explicit disclosure of missing or estimated inputs (`duration_estimate`, missing HR, skipped recovery days).
- `CoachEvidenceList`: verifiable references to supplied activity/metric records.
- `AdjustmentDiff`: clear before/after workout diff, tradeoffs, and expiry status.
- `SyncStatus`: connected, syncing, queued, partial, reauthorization required, failed.

---

## 8. States, Accessibility, and Content Tone

- **Mandatory UI States:** Every data-driven screen and card must implement **Loading** (clean skeleton matching final geometry), **Empty** (honest explanation + next action), **Error** (actionable retry without losing user context), and **Insufficient-Data** (clear limitation disclosure).
- **Accessibility (WCAG 2.2 AA):** Semantic landmarks (`nav`, `main`, `header`), logical heading hierarchy, full `Tab`/`Enter`/`Space`/`Escape` keyboard support, clearly visible focus rings (never `outline: none` without custom replacement), `prefers-reduced-motion` support, minimum `44px x 44px` mobile touch targets, and no color-only status indicators.
- **Content Tone:** Direct, calm, specific, non-judgmental. Never guilt-trip missed workouts, never fabricate claims, distinguish measured data from estimates, and never use AI hype buzzwords.
