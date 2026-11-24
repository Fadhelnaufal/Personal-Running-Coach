import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/shared/StatePanel";
import { SyncStatus } from "@/components/shared/SyncStatus";

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)]">Strava Activities</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Activity Log
          </h1>
        </div>
        <SyncStatus state="not_connected" />
      </div>

      <StatePanel
        kind="empty"
        title="No synced activities yet"
        description="Strava OAuth (activity:read_all) and idempotent activity imports arrive in Milestone 3. Actual activities stay separated from planned workouts."
        action={
          <Button asChild size="sm">
            <Link href="/settings">Review Integration Settings</Link>
          </Button>
        }
      />
    </div>
  );
}
