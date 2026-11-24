import { Badge } from "@/components/ui/badge";

export type WorkoutType =
  | "easy_run"
  | "recovery_run"
  | "long_run"
  | "steady_run"
  | "tempo_run"
  | "interval"
  | "repetition"
  | "hill_repeats"
  | "race_pace"
  | "strides"
  | "rest"
  | "cross_training";

const WORKOUT_TYPE_META: Record<
  WorkoutType,
  { label: string; variant: "blue" | "purple" | "cyan" | "neutral" }
> = {
  easy_run: { label: "Easy Run", variant: "blue" },
  recovery_run: { label: "Recovery Run", variant: "cyan" },
  long_run: { label: "Long Run", variant: "blue" },
  steady_run: { label: "Steady Run", variant: "blue" },
  tempo_run: { label: "Tempo / Threshold", variant: "purple" },
  interval: { label: "Intervals", variant: "purple" },
  repetition: { label: "Repetitions", variant: "purple" },
  hill_repeats: { label: "Hill Repeats", variant: "purple" },
  race_pace: { label: "Race Pace", variant: "purple" },
  strides: { label: "Strides", variant: "cyan" },
  rest: { label: "Rest Day", variant: "neutral" },
  cross_training: { label: "Cross Training", variant: "cyan" },
};

export function WorkoutTypeBadge({ type }: { type: WorkoutType }) {
  const meta = WORKOUT_TYPE_META[type];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
