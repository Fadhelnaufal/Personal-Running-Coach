import { describe, expect, it } from "vitest";
import {
  isValidIanaTimezone,
  parseDistanceToMeters,
  parseDurationInputToSeconds,
  parsePaceToSecPerKm,
  runnerGoalInputSchema,
  runnerProfileUpdateSchema,
} from "@/server/domain/runner/schemas";
import { calculateBaselineCompleteness } from "@/server/domain/runner/completeness";
import { sanitizeAuditSnapshot } from "@/server/db/audit";
import type { RunnerGoalRow, RunnerProfileRow } from "@/lib/supabase/database.types";

function makeBlankProfile(): RunnerProfileRow {
  return {
    id: "prof-1",
    user_id: "user-1",
    display_name: null,
    timezone_name: "UTC",
    experience_level: null,
    preferred_distance_unit: "km",
    preferred_pace_unit: "min_per_km",
    weekly_running_days: null,
    preferred_training_days: null,
    unavailable_days: null,
    recent_weekly_distance_m: null,
    longest_recent_run_m: null,
    easy_pace_sec_per_km: null,
    threshold_pace_sec_per_km: null,
    resting_hr_bpm: null,
    max_hr_bpm: null,
    lthr_bpm: null,
    hr_zones: null,
    weight_kg: null,
    injury_history: null,
    notes: null,
    profile_completed_at: null,
    baseline_updated_at: null,
    baseline_source: null,
    created_at: "2026-11-24T00:00:00Z",
    updated_at: "2026-11-24T00:00:00Z",
  };
}

describe("Runner domain validation and NULL preservation", () => {
  it("preserves blank inputs as null instead of coercing to zero", () => {
    expect(parseDistanceToMeters("", "km")).toBeNull();
    expect(parseDistanceToMeters(null, "mi")).toBeNull();
    expect(parsePaceToSecPerKm("", "min_per_km")).toBeNull();
    expect(parseDurationInputToSeconds("  ")).toBeNull();
  });

  it("converts distance, pace, and duration inputs to canonical units", () => {
    expect(parseDistanceToMeters("10", "km")).toBe(10000);
    expect(parseDistanceToMeters("5", "mi")).toBe(8046.72);
    expect(parsePaceToSecPerKm("5:15", "min_per_km")).toBe(315);
    expect(parseDurationInputToSeconds("44:30")).toBe(2670);
    expect(parseDurationInputToSeconds("1:35:00")).toBe(5700);
  });

  it("validates IANA timezones and cross-field constraints", () => {
    expect(isValidIanaTimezone("Asia/Jakarta")).toBe(true);
    expect(isValidIanaTimezone("Mars/Olympus")).toBe(false);

    const invalidHr = runnerProfileUpdateSchema.safeParse({
      display_name: "Alex",
      timezone_name: "Asia/Jakarta",
      experience_level: "advanced",
      preferred_distance_unit: "km",
      preferred_pace_unit: "min_per_km",
      weekly_running_days: 5,
      preferred_training_days: [1, 3, 5],
      unavailable_days: [7],
      recent_weekly_distance_m: null,
      longest_recent_run_m: null,
      easy_pace_sec_per_km: null,
      threshold_pace_sec_per_km: null,
      resting_hr_bpm: 180,
      max_hr_bpm: 175,
      lthr_bpm: null,
      weight_kg: null,
      injury_notes: null,
      notes: null,
    });
    expect(invalidHr.success).toBe(false);

    const overlappingDays = runnerProfileUpdateSchema.safeParse({
      display_name: null,
      timezone_name: "Asia/Jakarta",
      experience_level: null,
      preferred_distance_unit: "km",
      preferred_pace_unit: "min_per_km",
      weekly_running_days: null,
      preferred_training_days: [2, 4],
      unavailable_days: [4, 7],
      recent_weekly_distance_m: null,
      longest_recent_run_m: null,
      easy_pace_sec_per_km: null,
      threshold_pace_sec_per_km: null,
      resting_hr_bpm: null,
      max_hr_bpm: null,
      lthr_bpm: null,
      weight_kg: null,
      injury_notes: null,
      notes: null,
    });
    expect(overlappingDays.success).toBe(false);
  });

  it("validates goal schema cleanly", () => {
    const validGoal = runnerGoalInputSchema.safeParse({
      goal_type: "10k",
      title: "Spring 10K",
      target_distance_m: 10000,
      target_time_sec: 2670,
      race_date: "2027-04-15",
      priority: "primary",
      status: "active",
    });
    expect(validGoal.success).toBe(true);
  });

  it("computes baseline completeness and sufficiency honestly", () => {
    const blank = makeBlankProfile();
    const emptyResult = calculateBaselineCompleteness(blank, null);
    expect(emptyResult.percentage).toBe(0);
    expect(emptyResult.sufficiency).toBe("sparse");
    expect(emptyResult.missingFields.length).toBe(8);

    const fullProfile: RunnerProfileRow = {
      ...blank,
      experience_level: "advanced",
      weekly_running_days: 5,
      preferred_training_days: [1, 2, 4, 6, 7],
      recent_weekly_distance_m: 50000,
      longest_recent_run_m: 18000,
      easy_pace_sec_per_km: 330,
      resting_hr_bpm: 50,
    };
    const goal: RunnerGoalRow = {
      id: "goal-1",
      user_id: "user-1",
      goal_type: "half_marathon",
      title: "Half Marathon",
      target_distance_m: 21097.5,
      target_time_sec: 5700,
      race_date: null,
      priority: "primary",
      status: "active",
      created_at: "2026-11-24T00:00:00Z",
      updated_at: "2026-11-24T00:00:00Z",
    };

    const fullResult = calculateBaselineCompleteness(fullProfile, goal);
    expect(fullResult.percentage).toBe(100);
    expect(fullResult.sufficiency).toBe("sufficient");
    expect(fullResult.missingFields).toEqual([]);
  });

  it("redacts sensitive keys in audit snapshots", () => {
    const sanitized = sanitizeAuditSnapshot({
      display_name: "Alex",
      access_token: "secret-1",
      nested: { refresh_token: "secret-2", password: "pw" },
    });

    expect(sanitized).toEqual({
      display_name: "Alex",
      access_token: "[REDACTED]",
      nested: { refresh_token: "[REDACTED]", password: "[REDACTED]" },
    });
  });
});
