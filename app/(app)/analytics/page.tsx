import { ChartFrame } from "@/components/shared/ChartFrame";
import { DataCompletenessNote } from "@/components/shared/DataCompletenessNote";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)]">Performance Analytics</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Trends & Training Load
        </h1>
      </div>

      <DataCompletenessNote
        title="Analytics engine scheduled for Milestone 7"
        message="Volume, comparable pace progression, and separated training load methods (sRPE, HR-TRIMP estimate, duration estimate) will render here once activity data exists."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Weekly Distance"
          timeframe="Last 12 weeks"
          unit="km"
          state="empty"
          emptyMessage="Connect Strava or log runs in later milestones to view weekly volume trends."
        />
        <ChartFrame
          title="Acute & Chronic Training Load"
          timeframe="Rolling 7d / 28d"
          unit="au"
          state="empty"
          emptyMessage="Training load charts appear once sessions and optional RPE inputs are recorded."
        />
      </div>
    </div>
  );
}
