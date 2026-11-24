"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/server/auth/session";
import {
  nullableString,
  parseDistanceToMeters,
  parseDurationInputToSeconds,
  parseNullableNumber,
  parsePaceToSecPerKm,
  STANDARD_GOAL_DISTANCES_M,
} from "@/server/domain/runner/schemas";
import {
  createRunnerGoal,
  deleteRunnerGoal,
  setPrimaryGoal,
  updateGoalStatus,
  updateRunnerProfile,
} from "@/server/domain/runner/service";
import type { DistanceUnit, PaceUnit } from "@/lib/utils/units";

export interface RunnerFormState {
  status: "idle" | "success" | "error";
  message: string | null;
}

function parseDayCheckboxes(formData: FormData, field: string): number[] | null {
  const values = formData
    .getAll(field)
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  return values.length === 0 ? null : Array.from(new Set(values)).sort((a, b) => a - b);
}

export async function saveRunnerProfileAction(
  _prevState: RunnerFormState,
  formData: FormData
): Promise<RunnerFormState> {
  try {
    const { user } = await requireAuthenticatedUser();
    const distanceUnit =
      formData.get("preferred_distance_unit") === "mi" ? ("mi" as DistanceUnit) : ("km" as DistanceUnit);
    const paceUnit =
      formData.get("preferred_pace_unit") === "min_per_mile"
        ? ("min_per_mile" as PaceUnit)
        : ("min_per_km" as PaceUnit);

    const expRaw = nullableString(formData.get("experience_level"));
    const experience_level =
      expRaw === "beginner" || expRaw === "intermediate" || expRaw === "advanced" ? expRaw : null;

    const weeklyDaysRaw = parseNullableNumber(formData.get("weekly_running_days"));
    const restingHrRaw = parseNullableNumber(formData.get("resting_hr_bpm"));
    const maxHrRaw = parseNullableNumber(formData.get("max_hr_bpm"));
    const lthrRaw = parseNullableNumber(formData.get("lthr_bpm"));
    const weightRaw = parseNullableNumber(formData.get("weight_kg"));

    await updateRunnerProfile(user.id, {
      display_name: nullableString(formData.get("display_name")),
      timezone_name: String(formData.get("timezone_name") ?? "UTC").trim(),
      experience_level,
      preferred_distance_unit: distanceUnit,
      preferred_pace_unit: paceUnit,
      weekly_running_days: weeklyDaysRaw,
      preferred_training_days: parseDayCheckboxes(formData, "preferred_training_days"),
      unavailable_days: parseDayCheckboxes(formData, "unavailable_days"),
      recent_weekly_distance_m: parseDistanceToMeters(
        formData.get("recent_weekly_distance")?.toString() ?? null,
        distanceUnit
      ),
      longest_recent_run_m: parseDistanceToMeters(
        formData.get("longest_recent_run")?.toString() ?? null,
        distanceUnit
      ),
      easy_pace_sec_per_km: parsePaceToSecPerKm(
        formData.get("easy_pace")?.toString() ?? null,
        paceUnit
      ),
      threshold_pace_sec_per_km: parsePaceToSecPerKm(
        formData.get("threshold_pace")?.toString() ?? null,
        paceUnit
      ),
      resting_hr_bpm: restingHrRaw,
      max_hr_bpm: maxHrRaw,
      lthr_bpm: lthrRaw,
      weight_kg: weightRaw,
      injury_notes: nullableString(formData.get("injury_notes")),
      notes: nullableString(formData.get("notes")),
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/onboarding");

    return { status: "success", message: "Runner profile saved." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save runner profile.",
    };
  }
}

export async function createRunnerGoalAction(
  _prevState: RunnerFormState,
  formData: FormData
): Promise<RunnerFormState> {
  try {
    const { user, profile } = await requireAuthenticatedUser();
    const goalTypeRaw = String(formData.get("goal_type") ?? "10k");
    const goal_type =
      goalTypeRaw === "5k" ||
      goalTypeRaw === "10k" ||
      goalTypeRaw === "half_marathon" ||
      goalTypeRaw === "marathon" ||
      goalTypeRaw === "custom"
        ? goalTypeRaw
        : "custom";

    const distanceUnit = profile.preferred_distance_unit;
    const target_distance_m =
      goal_type === "custom"
        ? (parseDistanceToMeters(formData.get("custom_distance")?.toString() ?? null, distanceUnit) ??
          0)
        : STANDARD_GOAL_DISTANCES_M[goal_type];

    const priority = formData.get("priority") === "secondary" ? "secondary" : "primary";

    await createRunnerGoal(user.id, {
      goal_type,
      title: String(formData.get("title") ?? "").trim(),
      target_distance_m,
      target_time_sec: parseDurationInputToSeconds(
        formData.get("target_time")?.toString() ?? null
      ),
      race_date: nullableString(formData.get("race_date")),
      priority,
      status: "active",
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/onboarding");

    return { status: "success", message: "Goal saved." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create goal.",
    };
  }
}

export async function activatePrimaryGoalAction(goalId: string): Promise<void> {
  const { user } = await requireAuthenticatedUser();
  await setPrimaryGoal(user.id, goalId);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function updateGoalStatusAction(
  goalId: string,
  status: "active" | "achieved" | "archived"
): Promise<void> {
  const { user } = await requireAuthenticatedUser();
  await updateGoalStatus(user.id, goalId, status);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function deleteGoalAction(goalId: string): Promise<void> {
  const { user } = await requireAuthenticatedUser();
  await deleteRunnerGoal(user.id, goalId);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
