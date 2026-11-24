# User Flows
## Personal Running Coach

## 1. Onboarding

1. User opens application.
2. Sign up / sign in.
3. Server creates private user workspace and runner profile.
4. User enters experience, goals, availability, units, recent training, and optional health-related limitations.
5. System validates required fields and highlights missing baseline data.
6. User reviews profile summary.
7. User lands on dashboard with next steps.

**Edge cases:** user skips optional fields; profile remains incomplete and system does not invent values.

## 2. Connect Strava

1. User opens Integrations.
2. UI clearly explains requested scope (`activity:read_all`, allowing sync of both public and private/"Only You" activities) and disconnect/retention controls.
3. User selects Connect Strava.
4. Server creates cryptographic OAuth state, stores its hash in `oauth_states` bound to the user, and redirects to Strava authorization.
5. Strava redirects to callback.
6. Server validates state, exchanges code, encrypts tokens (`AES-256-GCM`), stores metadata in `strava_connections` and encrypted tokens in server-only `strava_connection_tokens`.
7. User chooses historical import scope if supported by product policy.
8. Import job is enqueued in `sync_jobs`.
9. UI shows `pending` / `processing` / `retry_wait` / `completed` / `partial` / `failed` status.
10. User can trigger **Sync Now**, retry failed jobs, or reconnect when `reauthorization_required`.

**Failure states:** denied consent, invalid/expired state, token exchange failure, rate limit (`429`), expired/revoked authorization (`401`), partial import.

## 3. Create a training plan

1. User selects Create Plan.
2. Chooses primary goal and distance.
3. Adds target time and race date if known.
4. Confirms baseline data and training availability.
5. System checks data completeness.
6. Training engine creates draft phases and workouts.
7. User reviews weekly volume, intensity distribution, key sessions, and rest days.
8. User edits available preferences or regenerates.
9. User activates plan.
10. Server transaction ensures there is no conflicting active plan.

## 4. Daily workout

1. User opens Calendar.
2. Selects today's workout.
3. Reads steps, target intensity (pace, HR, or RPE fallback), notes, and alternatives.
4. Completes workout outside the app.
5. Strava activity syncs (without blocking on subjective inputs); training load records initial method (`hr_trimp_estimate` or `duration_estimate` if RPE is not yet entered).
6. Matching service suggests a planned workout match.
7. User confirms or corrects the match and optionally enters quick post-run RPE (1-10), triggering `srpe` training load recalculation.
8. Workout status becomes `completed`; actual activity remains separate.

## 5. Missed workout

1. Workout `scheduled_date` passes earlier than the current date in the runner's `timezone_name` while persisted status remains `planned`.
2. UI presents the workout as `missed` (derived unresolved state; persisted DB status stays `planned`).
3. User opens workout and chooses `skip`, `reschedule`, or `modify`.
4. Engine evaluates upcoming load, hard-session spacing, recovery, and calendar conflicts.
5. System proposes or validates the user's choice.
6. User confirms.
7. Calendar, `plan_version`, and audit history update.

No automatic next-day roll-forward.

## 6. Recovery check-in

1. User opens Recovery.
2. Enters sleep, fatigue, soreness, stress, motivation, optional HR/HRV.
3. Server validates ranges and date.
4. Check-in is saved.
5. Recovery view shows recent history and trends.
6. Training engine may use the data in the next review.

## 7. Weekly review with AI

1. User selects Weekly Review.
2. Server loads plan, completed workouts, activity metrics, and recovery data.
3. Deterministic analytics engine calculates summaries and flags.
4. Server sends minimized, structured context to OpenRouter through the AI Provider Adapter.
5. Configured model returns a review and optional adjustment proposal; server parses and validates it.
6. Server validates output and stores recommendation.
7. User reviews evidence, confidence, limitations, and impacted workouts.
8. User accepts or rejects proposal.
9. If accepted, server checks plan version and revalidates proposal.
10. Server applies changes transactionally and records audit history.

## 8. Disconnect Strava

1. User opens Integrations.
2. Selects Disconnect.
3. Confirmation explains sync will stop.
4. Server revokes token where supported and deletes/invalidates local credentials.
5. Pending jobs are cancelled or safely ignored.
6. Existing imported activity history follows the user's retention choice and privacy policy.

## 9. Account/data deletion

1. User requests deletion.
2. System explains affected data and irreversible consequences.
3. User confirms.
4. Server schedules deletion workflow.
5. Tokens and integrations are revoked/deleted.
6. Personal records and derived data are deleted or anonymized according to policy.
7. Completion is logged without retaining unnecessary personal data.


## 10. Hybrid Strava synchronization

1. Strava sends a subscribed event to the public webhook endpoint.
2. Next.js Route Handler validates the challenge/event and stores a minimal idempotent job in Supabase.
3. Handler responds quickly; it does not run historical import or fetch large activity payloads inline.
4. User can open Integrations and trigger **Sync now** to process pending work and request incremental synchronization.
5. A bounded worker invocation claims jobs, fetches the activity from Strava, upserts data, and records the result.
6. Optional daily reconciliation checks for missed events; it is not required for the core manual sync path.
7. UI exposes last successful sync, queued work, failures, retry, and reconnect states.

The webhook path captures changes; manual sync is the reliable user-controlled processing path for the free-first MVP.
