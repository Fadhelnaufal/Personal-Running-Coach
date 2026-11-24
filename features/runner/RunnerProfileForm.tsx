"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveRunnerProfileAction, type RunnerFormState } from "@/features/runner/actions";
import type { RunnerProfileRow } from "@/lib/supabase/database.types";

const WEEKDAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 7, label: "Sun" },
] as const;

const COMMON_TIMEZONES = [
  "UTC",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
] as const;

const INITIAL_STATE: RunnerFormState = { status: "idle", message: null };

function formatMetersForInput(
  meters: number | null,
  unit: "km" | "mi"
): string {
  if (meters === null) return "";
  const divisor = unit === "km" ? 1000 : 1609.344;
  return (meters / divisor).toFixed(1).replace(/\.0$/, "");
}

function formatPaceForInput(
  secPerKm: number | null,
  unit: "min_per_km" | "min_per_mile"
): string {
  if (secPerKm === null) return "";
  const converted = unit === "min_per_km" ? secPerKm : Math.round(secPerKm * 1.609344);
  const mins = Math.floor(converted / 60);
  const secs = converted % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function RunnerProfileForm({ profile }: { profile: RunnerProfileRow }) {
  const [state, formAction, isPending] = React.useActionState(
    saveRunnerProfileAction,
    INITIAL_STATE
  );
  const [distanceUnit, setDistanceUnit] = React.useState<"km" | "mi">(
    profile.preferred_distance_unit
  );
  const [paceUnit, setPaceUnit] = React.useState<"min_per_km" | "min_per_mile">(
    profile.preferred_pace_unit
  );

  const injurySummary =
    profile.injury_history &&
    typeof profile.injury_history === "object" &&
    !Array.isArray(profile.injury_history) &&
    typeof profile.injury_history.summary === "string"
      ? profile.injury_history.summary
      : "";

  const timezoneOptions = COMMON_TIMEZONES.includes(
    profile.timezone_name as (typeof COMMON_TIMEZONES)[number]
  )
    ? COMMON_TIMEZONES
    : [profile.timezone_name, ...COMMON_TIMEZONES];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Runner Profile & Baseline</CardTitle>
        <CardDescription>
          Leave unknown metrics blank. Unfilled measurements remain Not recorded and are never
          assumed as zero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="display_name" className="text-xs font-medium text-[var(--text-primary)]">
                Display name
              </label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name ?? ""}
                placeholder="e.g., Alex"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="timezone_name" className="text-xs font-medium text-[var(--text-primary)]">
                Local timezone (IANA)
              </label>
              <select
                id="timezone_name"
                name="timezone_name"
                defaultValue={profile.timezone_name}
                className="flex min-h-[44px] w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                {timezoneOptions.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="experience_level"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Running experience
              </label>
              <select
                id="experience_level"
                name="experience_level"
                defaultValue={profile.experience_level ?? ""}
                className="flex min-h-[44px] w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                <option value="">Not recorded</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced recreational</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="weekly_running_days"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Target running days per week (1-7)
              </label>
              <Input
                id="weekly_running_days"
                name="weekly_running_days"
                type="number"
                min={1}
                max={7}
                defaultValue={profile.weekly_running_days ?? ""}
                placeholder="Not recorded"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="preferred_distance_unit"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Distance unit
              </label>
              <select
                id="preferred_distance_unit"
                name="preferred_distance_unit"
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as "km" | "mi")}
                className="flex min-h-[44px] w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="preferred_pace_unit"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Pace unit
              </label>
              <select
                id="preferred_pace_unit"
                name="preferred_pace_unit"
                value={paceUnit}
                onChange={(e) => setPaceUnit(e.target.value as "min_per_km" | "min_per_mile")}
                className="flex min-h-[44px] w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                <option value="min_per_km">Minutes per km (min/km)</option>
                <option value="min_per_mile">Minutes per mile (min/mi)</option>
              </select>
            </div>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-[var(--text-primary)]">
                Preferred training days
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => (
                  <label
                    key={`pref-${day.id}`}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] has-[:checked]:border-[var(--accent-blue)] has-[:checked]:bg-[var(--tint-blue)] has-[:checked]:text-[var(--accent-blue-strong)]"
                  >
                    <input
                      type="checkbox"
                      name="preferred_training_days"
                      value={day.id}
                      defaultChecked={profile.preferred_training_days?.includes(day.id) ?? false}
                      className="sr-only"
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-[var(--text-primary)]">
                Unavailable / fixed rest days
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => (
                  <label
                    key={`unavail-${day.id}`}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] has-[:checked]:border-[#fde68a] has-[:checked]:bg-[var(--status-warning-bg)] has-[:checked]:text-[var(--status-warning)]"
                  >
                    <input
                      type="checkbox"
                      name="unavailable_days"
                      value={day.id}
                      defaultChecked={profile.unavailable_days?.includes(day.id) ?? false}
                      className="sr-only"
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Optional recent baseline & physiology */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="recent_weekly_distance"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Recent weekly distance ({distanceUnit})
              </label>
              <Input
                id="recent_weekly_distance"
                name="recent_weekly_distance"
                type="number"
                step="0.1"
                min={0}
                defaultValue={formatMetersForInput(
                  profile.recent_weekly_distance_m,
                  profile.preferred_distance_unit
                )}
                placeholder="Not recorded"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="longest_recent_run"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Longest recent run ({distanceUnit})
              </label>
              <Input
                id="longest_recent_run"
                name="longest_recent_run"
                type="number"
                step="0.1"
                min={0}
                defaultValue={formatMetersForInput(
                  profile.longest_recent_run_m,
                  profile.preferred_distance_unit
                )}
                placeholder="Not recorded"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="easy_pace" className="text-xs font-medium text-[var(--text-primary)]">
                Easy pace ({paceUnit === "min_per_km" ? "mm:ss /km" : "mm:ss /mi"})
              </label>
              <Input
                id="easy_pace"
                name="easy_pace"
                defaultValue={formatPaceForInput(
                  profile.easy_pace_sec_per_km,
                  profile.preferred_pace_unit
                )}
                placeholder="e.g. 5:45"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="threshold_pace"
                className="text-xs font-medium text-[var(--text-primary)]"
              >
                Threshold pace ({paceUnit === "min_per_km" ? "mm:ss /km" : "mm:ss /mi"})
              </label>
              <Input
                id="threshold_pace"
                name="threshold_pace"
                defaultValue={formatPaceForInput(
                  profile.threshold_pace_sec_per_km,
                  profile.preferred_pace_unit
                )}
                placeholder="e.g. 4:25"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="resting_hr_bpm" className="text-xs font-medium text-[var(--text-primary)]">
                Resting HR (bpm)
              </label>
              <Input
                id="resting_hr_bpm"
                name="resting_hr_bpm"
                type="number"
                min={30}
                max={130}
                defaultValue={profile.resting_hr_bpm ?? ""}
                placeholder="Not recorded"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="max_hr_bpm" className="text-xs font-medium text-[var(--text-primary)]">
                Max HR (bpm)
              </label>
              <Input
                id="max_hr_bpm"
                name="max_hr_bpm"
                type="number"
                min={100}
                max={230}
                defaultValue={profile.max_hr_bpm ?? ""}
                placeholder="Not recorded"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lthr_bpm" className="text-xs font-medium text-[var(--text-primary)]">
                Lactate threshold HR (bpm)
              </label>
              <Input
                id="lthr_bpm"
                name="lthr_bpm"
                type="number"
                min={90}
                max={220}
                defaultValue={profile.lthr_bpm ?? ""}
                placeholder="Not recorded"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="weight_kg" className="text-xs font-medium text-[var(--text-primary)]">
                Weight (kg, optional)
              </label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                step="0.1"
                min={25}
                max={300}
                defaultValue={profile.weight_kg ?? ""}
                placeholder="Not recorded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="injury_notes" className="text-xs font-medium text-[var(--text-primary)]">
                Injury history / limitations (caution context only)
              </label>
              <textarea
                id="injury_notes"
                name="injury_notes"
                rows={3}
                defaultValue={injurySummary}
                placeholder="Optional notes on past injuries or sensitivities"
                className="w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-xs font-medium text-[var(--text-primary)]">
                General training notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={profile.notes ?? ""}
                placeholder="Schedule constraints, terrain access, or preferences"
                className="w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              />
            </div>
          </div>

          {state.status === "error" && state.message ? (
            <p
              role="alert"
              className="rounded-xl border border-[#fecaca] bg-[var(--status-danger-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--status-danger)]"
            >
              {state.message}
            </p>
          ) : null}

          {state.status === "success" && state.message ? (
            <p
              role="status"
              className="rounded-xl border border-[#bbf7d0] bg-[var(--status-success-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--status-success)]"
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving profile..." : "Save Runner Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
