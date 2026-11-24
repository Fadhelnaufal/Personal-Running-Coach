import { DashboardOverview } from "@/features/dashboard/DashboardOverview";
import { requireAuthenticatedUser } from "@/server/auth/session";
import { getRunnerWorkspaceData } from "@/server/domain/runner/service";

export default async function DashboardPage() {
  const { user } = await requireAuthenticatedUser();
  const { profile, activePrimaryGoal, completeness } = await getRunnerWorkspaceData(user.id);

  return (
    <DashboardOverview
      profile={profile}
      activePrimaryGoal={activePrimaryGoal}
      completeness={completeness}
    />
  );
}
