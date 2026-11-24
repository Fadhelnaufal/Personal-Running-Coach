import { Badge } from "@/components/ui/badge";
import { MISSING_VALUE_LABEL } from "@/lib/utils/units";
import { cn } from "@/lib/utils/cn";

interface MetricValueProps {
  label: string;
  value: string | null | undefined;
  unit?: string;
  period?: string;
  sourceLabel?: string;
  isEstimated?: boolean;
  className?: string;
}

export function MetricValue({
  label,
  value,
  unit,
  period,
  sourceLabel,
  isEstimated = false,
  className,
}: MetricValueProps) {
  const isMissing = value === null || value === undefined || value.trim() === "";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
        {sourceLabel ? (
          <Badge variant={isEstimated ? "warning" : "neutral"}>{sourceLabel}</Badge>
        ) : null}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-metric text-2xl font-semibold tracking-tight",
            isMissing ? "text-[var(--text-secondary)] text-base font-sans font-medium" : "text-[var(--text-primary)]"
          )}
        >
          {isMissing ? MISSING_VALUE_LABEL : value}
        </span>
        {!isMissing && unit ? (
          <span className="text-xs font-medium text-[var(--text-secondary)]">{unit}</span>
        ) : null}
      </div>

      {period ? <span className="text-xs text-[var(--text-secondary)]">{period}</span> : null}
    </div>
  );
}
