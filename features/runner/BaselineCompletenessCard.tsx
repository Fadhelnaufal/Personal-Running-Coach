import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaselineCompletenessResult } from "@/server/domain/runner/completeness";

export function BaselineCompletenessCard({
  completeness,
}: {
  completeness: BaselineCompletenessResult;
}) {
  const badgeVariant =
    completeness.sufficiency === "sufficient"
      ? "success"
      : completeness.sufficiency === "partial"
        ? "blue"
        : "warning";

  const sufficiencyLabel =
    completeness.sufficiency === "sufficient"
      ? "Ready for paced plans"
      : completeness.sufficiency === "partial"
        ? "Partial baseline (RPE fallback)"
        : "Sparse baseline";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Baseline Completeness</CardTitle>
          <Badge variant={badgeVariant}>{sufficiencyLabel}</Badge>
        </div>
        <CardDescription>
          Missing measurements stay unrecorded (NULL) and never trigger guessed pace targets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">Profile coverage</span>
            <span className="font-metric text-xl font-semibold text-[var(--text-primary)]">
              {completeness.percentage}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <div
              className="athletic-accent-bar h-full rounded-full transition-all"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>

        {completeness.missingFields.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Still missing ({completeness.missingFields.length}):
            </p>
            <ul className="grid grid-cols-1 gap-1 text-xs text-[var(--text-secondary)] sm:grid-cols-2">
              {completeness.missingFields.map((field) => (
                <li key={field} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-purple)]" aria-hidden="true" />
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs font-medium text-[var(--status-success)]">
            All core baseline fields are recorded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
