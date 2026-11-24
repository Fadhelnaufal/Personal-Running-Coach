import { StatePanel } from "@/components/shared/StatePanel";
import { DataCompletenessNote } from "@/components/shared/DataCompletenessNote";

export default function RecoveryPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)]">Recovery & Readiness</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Daily Check-in
        </h1>
      </div>

      <StatePanel
        kind="empty"
        title="No recovery check-ins recorded"
        description="Daily sleep, fatigue, soreness, stress, motivation, and optional HR/HRV logging arrive in Milestone 6. Unfilled days remain explicitly missing."
      />

      <DataCompletenessNote
        title="Decision support only"
        message="Recovery flags are informational training signals, not medical diagnoses or injury guarantees."
      />
    </div>
  );
}
