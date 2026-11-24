import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuthenticatedUser } from "@/server/auth/session";
import { getRunnerWorkspaceData } from "@/server/domain/runner/service";
import { BaselineCompletenessCard } from "@/features/runner/BaselineCompletenessCard";
import { RunnerProfileForm } from "@/features/runner/RunnerProfileForm";
import { GoalManager } from "@/features/runner/GoalManager";

export default async function OnboardingPage() {
  const { user } = await requireAuthenticatedUser();
  const { profile, goals, completeness } = await getRunnerWorkspaceData(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)]">Runner Onboarding</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Set Up Your Running Baseline
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Continue to Dashboard</Link>
        </Button>
      </div>

      <BaselineCompletenessCard completeness={completeness} />
      <RunnerProfileForm profile={profile} />
      <GoalManager goals={goals} distanceUnit={profile.preferred_distance_unit} />
    </div>
  );
}
