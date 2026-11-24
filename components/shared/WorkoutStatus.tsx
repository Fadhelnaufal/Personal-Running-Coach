import { Calendar, CheckCircle2, Clock, Edit3, Forward, SkipForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type WorkoutDisplayStatus =
  | "planned"
  | "completed"
  | "skipped"
  | "rescheduled"
  | "modified"
  | "missed";

const STATUS_META: Record<
  WorkoutDisplayStatus,
  {
    label: string;
    variant: "blue" | "success" | "neutral" | "purple" | "warning";
    Icon: typeof Calendar;
  }
> = {
  planned: { label: "Planned", variant: "blue", Icon: Calendar },
  completed: { label: "Completed", variant: "success", Icon: CheckCircle2 },
  skipped: { label: "Skipped", variant: "neutral", Icon: SkipForward },
  rescheduled: { label: "Rescheduled", variant: "purple", Icon: Forward },
  modified: { label: "Modified", variant: "purple", Icon: Edit3 },
  missed: { label: "Missed (Unresolved)", variant: "warning", Icon: Clock },
};

export function WorkoutStatus({ status }: { status: WorkoutDisplayStatus }) {
  const { label, variant, Icon } = STATUS_META[status];
  return (
    <Badge variant={variant}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}
