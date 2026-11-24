import { StatePanel } from "@/components/shared/StatePanel";
import { DataCompletenessNote } from "@/components/shared/DataCompletenessNote";

export default function CoachPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)]">AI Adaptive Coach</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Weekly Review & Proposals
        </h1>
      </div>

      <StatePanel
        kind="empty"
        title="No coaching reviews generated yet"
        description="OpenRouter weekly reviews, evidence references, and human-approved plan adjustment diffs will be enabled in Milestone 8."
      />

      <DataCompletenessNote
        title="Human-in-the-loop rule"
        message="AI Coach never writes directly to the database or changes an active training plan without explicit user approval."
      />
    </div>
  );
}
