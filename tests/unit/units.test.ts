import { describe, expect, it } from "vitest";
import {
  formatDistance,
  formatDuration,
  formatPace,
  MISSING_VALUE_LABEL,
} from "@/lib/utils/units";

describe("Canonical unit formatters", () => {
  it("keeps null and undefined values as Not recorded instead of zero", () => {
    expect(formatDistance(null)).toBe(MISSING_VALUE_LABEL);
    expect(formatDuration(undefined)).toBe(MISSING_VALUE_LABEL);
    expect(formatPace(null)).toBe(MISSING_VALUE_LABEL);
    expect(formatPace(0)).toBe(MISSING_VALUE_LABEL);
  });

  it("formats canonical meters into km and mi", () => {
    expect(formatDistance(10_000, "km", 2)).toBe("10.00 km");
    expect(formatDistance(1609.344, "mi", 2)).toBe("1.00 mi");
  });

  it("formats canonical seconds into mm:ss and h:mm:ss", () => {
    expect(formatDuration(275)).toBe("4:35");
    expect(formatDuration(3725)).toBe("1:02:05");
  });

  it("formats sec/km pace into min/km and min/mi", () => {
    expect(formatPace(300, "min_per_km")).toBe("5:00 /km");
    expect(formatPace(300, "min_per_mile")).toBe("8:03 /mi");
  });
});
