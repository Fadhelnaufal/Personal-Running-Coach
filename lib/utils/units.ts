export type DistanceUnit = "km" | "mi";
export type PaceUnit = "min_per_km" | "min_per_mile";

const METERS_PER_KM = 1000;
const METERS_PER_MILE = 1609.344;

export const MISSING_VALUE_LABEL = "Not recorded";

export function formatDistance(
  meters: number | null | undefined,
  unit: DistanceUnit = "km",
  decimals = 2
): string {
  if (meters === null || meters === undefined || Number.isNaN(meters)) {
    return MISSING_VALUE_LABEL;
  }
  const divisor = unit === "km" ? METERS_PER_KM : METERS_PER_MILE;
  const value = meters / divisor;
  return `${value.toFixed(decimals)} ${unit}`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return MISSING_VALUE_LABEL;
  }
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function formatPace(
  secPerKm: number | null | undefined,
  unit: PaceUnit = "min_per_km"
): string {
  if (secPerKm === null || secPerKm === undefined || Number.isNaN(secPerKm) || secPerKm <= 0) {
    return MISSING_VALUE_LABEL;
  }
  const convertedSec = unit === "min_per_km" ? secPerKm : secPerKm * (METERS_PER_MILE / METERS_PER_KM);
  const rounded = Math.round(convertedSec);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  const suffix = unit === "min_per_km" ? "/km" : "/mi";
  return `${mins}:${String(secs).padStart(2, "0")} ${suffix}`;
}
