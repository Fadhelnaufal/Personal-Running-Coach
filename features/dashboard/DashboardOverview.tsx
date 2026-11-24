import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricValue } from "@/components/shared/MetricValue";
import { StatePanel } from "@/components/shared/StatePanel";
import { SyncStatus } from "@/components/shared/SyncStatus";
import type { RunnerGoalRow, RunnerProfileRow } from "@/lib/supabase/database.types";
import type { BaselineCompletenessResult } from "@/server/domain/runner/completeness";
import { formatDistance, formatDuration } from "@/lib/utils/units";

interface DashboardOverviewProps {
  profile: RunnerProfileRow;
  activePrimaryGoal: RunnerGoalRow | null;
  completeness: BaselineCompletenessResult;
}

export function DashboardOverview({
  profile,
  activePrimaryGoal,
  completeness,
}: DashboardOverviewProps) {
  const unit = profile.preferred_distance_unit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-[var(--text-secondary)]">Training Overview</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Training Dashboard
        </h1>
      </div>

      {/* Focal gradient hero card */}
      <section
        aria-label="Training plan status"
        className="athletic-hero-surface rounded-[20px] p-5 text-white sm:p-7"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              {activePrimaryGoal ? "Active Primary Goal" : "Training Plan Status"}
            </span>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {activePrimaryGoal ? activePrimaryGoal.title : "No active training plan"}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/90">
              {activePrimaryGoal
                ? `Target distance: ${formatDistance(activePrimaryGoal.target_distance_m, unit)} · Target time: ${formatDuration(activePrimaryGoal.target_time_sec)} · Baseline completeness: ${completeness.percentage}%.`
                : `Your runner baseline is currently ${completeness.percentage}% complete. Finish onboarding or add a primary goal to prepare your upcoming training schedule.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild className="bg-white text-[var(--text-primary)] hover:bg-white/90">
              <Link href={completeness.percentage < 50 ? "/onboarding" : "/settings"}>
                {completeness.percentage < 50 ? "Complete Baseline" : "Open Settings"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/35 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/calendar">Open Calendar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core summary metrics */}
      <section aria-label="Weekly summary metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <MetricValue
              label="Weekly Distance"
              value={null}
              unit={unit}
              period="Current week"
              sourceLabel="No runs logged"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <MetricValue
              label="Next Planned Session"
              value={null}
              period="Training Calendar"
              sourceLabel="No active plan"
            />
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-5">
            <MetricValue
              label="Latest Recovery Check-in"
              value={null}
              period={`Today (${profile.timezone_name})`}
              sourceLabel="Not recorded"
            />
          </CardContent>
        </Card>
      </section>

      {/* Structured product sections: Upcoming Training & Recent Activities */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section aria-labelledby="upcoming-training-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="upcoming-training-heading"
              className="text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg"
            >
              Upcoming Training
            </h2>
            <Link
              href="/calendar"
              className="inline-flex min-h-[44px] items-center rounded-lg px-2 text-xs font-medium text-[var(--accent-blue-strong)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              View Calendar
            </Link>
          </div>
          <StatePanel
            kind="empty"
            title="No upcoming workouts scheduled"
            description="Activate a training plan to see your upcoming runs, key sessions, and planned rest days."
            action={
              <Button asChild size="sm" variant="pill">
                <Link href="/calendar">Go to Calendar</Link>
              </Button>
            }
          />
        </section>

        <section aria-labelledby="recent-activities-heading" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="recent-activities-heading"
              className="text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg"
            >
              Recent Activities
            </h2>
            <SyncStatus state="not_connected" />
          </div>
          <StatePanel
            kind="empty"
            title="No running activities synced"
            description="Connect your Strava account to import completed runs and match them with planned sessions."
            action={
              <Button asChild size="sm" variant="pill">
                <Link href="/activities">Go to Activities</Link>
              </Button>
            }
          />
        </section>
      </div>
    </div>
  );
}
