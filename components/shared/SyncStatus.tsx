import { AlertCircle, CheckCircle2, Clock, Link2Off, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SyncState =
  | "not_connected"
  | "connected"
  | "syncing"
  | "queued"
  | "partial"
  | "reauthorization_required"
  | "error";

interface SyncStatusProps {
  state: SyncState;
  detail?: string;
}

const SYNC_META: Record<
  SyncState,
  {
    label: string;
    variant: "neutral" | "blue" | "success" | "warning" | "danger";
    Icon: typeof CheckCircle2;
  }
> = {
  not_connected: {
    label: "Strava not connected",
    variant: "neutral",
    Icon: Link2Off,
  },
  connected: {
    label: "Strava connected",
    variant: "success",
    Icon: CheckCircle2,
  },
  syncing: {
    label: "Syncing runs",
    variant: "blue",
    Icon: RefreshCw,
  },
  queued: {
    label: "Sync queued",
    variant: "blue",
    Icon: Clock,
  },
  partial: {
    label: "Partial sync",
    variant: "warning",
    Icon: AlertCircle,
  },
  reauthorization_required: {
    label: "Reconnect Strava",
    variant: "warning",
    Icon: AlertCircle,
  },
  error: {
    label: "Sync error",
    variant: "danger",
    Icon: AlertCircle,
  },
};

export function SyncStatus({ state, detail }: SyncStatusProps) {
  const { label, variant, Icon } = SYNC_META[state];

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={variant} className="w-fit">
        <Icon
          className={state === "syncing" ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"}
          aria-hidden="true"
        />
        <span>{label}</span>
      </Badge>
      {detail ? <p className="text-xs text-[var(--text-secondary)]">{detail}</p> : null}
    </div>
  );
}
