import { z } from "zod";
import type { DistanceUnit, PaceUnit } from "@/lib/utils/units";

const METERS_PER_KM = 1000;
const METERS_PER_MILE = 1609.344;

export const STANDARD_GOAL_DISTANCES_M = {
  "5k": 5000,
  "10k": 10000,
  half_marathon: 21097.5,
  marathon: 42195,
} as const;

export function isValidIanaTimezone(timezoneName: string): boolean {
  const trimmed = timezoneName.trim();
  if (!trimmed) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

export function nullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(num)) {
    return Number.NaN;
  }
  return num;
}

export function parseDistanceToMeters(
  raw: string | number | null | undefined,
  unit: DistanceUnit
): number | null {
  const parsed = parseNullableNumber(raw);
  if (parsed === null) return null;
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error("Distance must be a non-negative number");
  }
  const multiplier = unit === "km" ? METERS_PER_KM : METERS_PER_MILE;
  return Math.round(parsed * multiplier * 100) / 100;
}

export function parsePaceToSecPerKm(
  raw: string | null | undefined,
  unit: PaceUnit
): number | null {
  const cleaned = nullableString(raw);
  if (cleaned === null) return null;

  let secondsInUnit: number;
  if (/^\d{1,2}:[0-5]\d$/.test(cleaned)) {
    const parts = cleaned.split(":");
    const mins = Number(parts[0]);
    const secs = Number(parts[1]);
    secondsInUnit = mins * 60 + secs;
  } else if (/^\d+$/.test(cleaned)) {
    secondsInUnit = Number(cleaned);
  } else {
    throw new Error("Pace must use mm:ss format (e.g. 5:15)");
  }

  if (secondsInUnit <= 0) {
    throw new Error("Pace must be greater than zero");
  }

  const secPerKm =
    unit === "min_per_km"
      ? secondsInUnit
      : secondsInUnit / (METERS_PER_MILE / METERS_PER_KM);
  return Math.round(secPerKm);
}

export function parseDurationInputToSeconds(raw: string | null | undefined): number | null {
  const cleaned = nullableString(raw);
  if (cleaned === null) return null;

  if (/^\d{1,2}:[0-5]\d:[0-5]\d$/.test(cleaned)) {
    const [h, m, s] = cleaned.split(":").map(Number);
    const total = (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
    if (total <= 0) throw new Error("Target time must be greater than zero");
    return total;
  }

  if (/^\d{1,3}:[0-5]\d$/.test(cleaned)) {
    const [m, s] = cleaned.split(":").map(Number);
    const total = (m ?? 0) * 60 + (s ?? 0);
    if (total <= 0) throw new Error("Target time must be greater than zero");
    return total;
  }

  throw new Error("Target time must use hh:mm:ss or mm:ss format");
}

const weekdayArraySchema = z
  .array(z.number().int().min(1).max(7))
  .transform((arr) => (arr.length === 0 ? null : Array.from(new Set(arr)).sort((a, b) => a - b)))
  .nullable();

export const runnerProfileUpdateSchema = z
  .object({
    display_name: z.string().trim().max(100).nullable(),
    timezone_name: z
      .string()
      .trim()
      .min(1, "Timezone is required")
      .refine(isValidIanaTimezone, "Must be a valid IANA timezone (e.g. Asia/Jakarta)"),
    experience_level: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
    preferred_distance_unit: z.enum(["km", "mi"]),
    preferred_pace_unit: z.enum(["min_per_km", "min_per_mile"]),
    weekly_running_days: z.number().int().min(1).max(7).nullable(),
    preferred_training_days: weekdayArraySchema,
    unavailable_days: weekdayArraySchema,
    recent_weekly_distance_m: z.number().min(0).max(500_000).nullable(),
    longest_recent_run_m: z.number().min(0).max(200_000).nullable(),
    easy_pace_sec_per_km: z.number().int().min(120).max(1200).nullable(),
    threshold_pace_sec_per_km: z.number().int().min(120).max(1000).nullable(),
    resting_hr_bpm: z.number().int().min(30).max(130).nullable(),
    max_hr_bpm: z.number().int().min(100).max(230).nullable(),
    lthr_bpm: z.number().int().min(90).max(220).nullable(),
    weight_kg: z.number().positive().max(300).nullable(),
    injury_notes: z.string().trim().max(1000).nullable(),
    notes: z.string().trim().max(2000).nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.max_hr_bpm !== null &&
      data.resting_hr_bpm !== null &&
      data.max_hr_bpm <= data.resting_hr_bpm
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_hr_bpm"],
        message: "Max HR must be greater than resting HR",
      });
    }

    if (data.preferred_training_days && data.unavailable_days) {
      const overlap = data.preferred_training_days.filter((day) =>
        data.unavailable_days?.includes(day)
      );
      if (overlap.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unavailable_days"],
          message: "Preferred and unavailable training days cannot overlap",
        });
      }
    }
  });

export type RunnerProfileUpdateInput = z.infer<typeof runnerProfileUpdateSchema>;

export const runnerGoalInputSchema = z.object({
  goal_type: z.enum(["5k", "10k", "half_marathon", "marathon", "custom"]),
  title: z.string().trim().min(2, "Goal title is required").max(120),
  target_distance_m: z.number().positive("Target distance must be positive").max(300_000),
  target_time_sec: z.number().int().positive().max(200_000).nullable(),
  race_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Race date must use YYYY-MM-DD format")
    .nullable(),
  priority: z.enum(["primary", "secondary"]),
  status: z.enum(["active", "achieved", "archived"]).default("active"),
});

export type RunnerGoalInput = z.infer<typeof runnerGoalInputSchema>;
