import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/shared/StatePanel";

interface ChartFrameProps {
  title: string;
  timeframe: string;
  unit?: string;
  state: "loading" | "empty" | "error" | "ready";
  emptyMessage?: string;
  errorMessage?: string;
  completenessNote?: React.ReactNode;
  children?: React.ReactNode;
}

export function ChartFrame({
  title,
  timeframe,
  unit,
  state,
  emptyMessage = "No recorded sessions in this timeframe yet.",
  errorMessage = "Unable to load chart data right now.",
  completenessNote,
  children,
}: ChartFrameProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
            {unit ? `${timeframe} · ${unit}` : timeframe}
          </span>
        </div>
        {completenessNote ? <CardDescription>{completenessNote}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {state === "loading" ? (
          <StatePanel
            kind="loading"
            title={`Loading ${title}`}
            description="Fetching chart series."
            className="border-0 p-0 shadow-none"
          />
        ) : state === "error" ? (
          <StatePanel
            kind="error"
            title="Chart unavailable"
            description={errorMessage}
            className="border-0 p-0 shadow-none"
          />
        ) : state === "empty" ? (
          <StatePanel
            kind="empty"
            title="No data to chart"
            description={emptyMessage}
            className="border-0 p-0 shadow-none"
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
