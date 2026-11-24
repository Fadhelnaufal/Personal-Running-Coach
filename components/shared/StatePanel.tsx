import * as React from "react";
import { AlertTriangle, Inbox, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PanelStateKind = "loading" | "empty" | "error" | "insufficient-data";

interface StatePanelProps {
  kind: PanelStateKind;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function StatePanel({ kind, title, description, action, className }: StatePanelProps) {
  if (kind === "loading") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={title}
        className={cn(
          "rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]",
          className
        )}
      >
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-4 w-36 rounded-md bg-[var(--bg-subtle)]" />
          <div className="h-7 w-48 rounded-md bg-[var(--bg-subtle)]" />
          <div className="h-3 w-full max-w-sm rounded-md bg-[var(--bg-subtle)]" />
        </div>
        <span className="sr-only">{description}</span>
      </div>
    );
  }

  const iconWrapClass =
    kind === "error"
      ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)]"
      : kind === "insufficient-data"
        ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)]"
        : "bg-[var(--tint-blue)] text-[var(--accent-blue-strong)]";

  const Icon =
    kind === "error" ? AlertTriangle : kind === "insufficient-data" ? Info : Inbox;

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconWrapClass)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="max-w-prose text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2 pt-1">{action}</div> : null}
    </div>
  );
}
