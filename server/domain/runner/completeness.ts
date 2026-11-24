import type { RunnerGoalRow, RunnerProfileRow } from "@/lib/supabase/database.types";

export type BaselineSufficiency = "sufficient" | "partial" | "sparse";

export interface BaselineCompletenessResult {
  score: number;
  percentage: number;
  sufficiency: BaselineSufficiency;
  completedFields: string[];
  missingFields: string[];
}

export function calculateBaselineCompleteness(
  profile: RunnerProfileRow,
  activePrimaryGoal: RunnerGoalRow | null
): BaselineCompletenessResult {
  const checks: Array<{ key: string; label: string; present: boolean }> = [
    {
      key: "experience_level",
      label: "Running experience level",
      present: profile.experience_level !== null,
    },
    {
      key: "weekly_running_days",
      label: "Weekly running days",
      present: profile.weekly_running_days !== null,
    },
    {
      key: "availability_days",
      label: "Preferred or unavailable training days",
      present:
        (profile.preferred_training_days?.length ?? 0) > 0 ||
        (profile.unavailable_days?.length ?? 0) > 0,
    },
    {
      key: "recent_weekly_distance_m",
      label: "Recent weekly distance",
      present: profile.recent_weekly_distance_m !== null,
    },
    {
      key: "longest_recent_run_m",
      label: "Longest recent run",
      present: profile.longest_recent_run_m !== null,
    },
    {
      key: "pace_baseline",
      label: "Easy or threshold pace",
      present:
        profile.easy_pace_sec_per_km !== null || profile.threshold_pace_sec_per_km !== null,
    },
    {
      key: "hr_baseline",
      label: "Resting or max heart rate",
      present: profile.resting_hr_bpm !== null || profile.max_hr_bpm !== null,
    },
    {
      key: "primary_goal",
      label: "Active primary running goal",
      present: activePrimaryGoal !== null,
    },
  ];

  const completedFields = checks.filter((c) => c.present).map((c) => c.label);
  const missingFields = checks.filter((c) => !c.present).map((c) => c.label);
  const score = Math.round((completedFields.length / checks.length) * 100) / 100;
  const percentage = Math.round(score * 100);

  const hasVolumeAndFrequency =
    profile.recent_weekly_distance_m !== null && profile.weekly_running_days !== null;
  const hasPace =
    profile.easy_pace_sec_per_km !== null || profile.threshold_pace_sec_per_km !== null;

  let sufficiency: BaselineSufficiency = "sparse";
  if (hasVolumeAndFrequency && hasPace && activePrimaryGoal !== null) {
    sufficiency = "sufficient";
  } else if (hasVolumeAndFrequency || completedFields.length >= 4) {
    sufficiency = "partial";
  }

  return {
    score,
    percentage,
    sufficiency,
    completedFields,
    missingFields,
  };
}
