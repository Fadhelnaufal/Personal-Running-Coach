import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicEnvStatus } from "@/lib/env";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { requireAuthenticatedUser } from "@/server/auth/session";
import { getRunnerWorkspaceData } from "@/server/domain/runner/service";
import { BaselineCompletenessCard } from "@/features/runner/BaselineCompletenessCard";
import { RunnerProfileForm } from "@/features/runner/RunnerProfileForm";
import { GoalManager } from "@/features/runner/GoalManager";

export default async function SettingsPage() {
  const publicEnv = getPublicEnvStatus();
  const { user } = await requireAuthenticatedUser();
  const { profile, goals, completeness } = await getRunnerWorkspaceData(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)]">Workspace Settings</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Runner Profile, Goals & Integrations
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/onboarding">Open Guided Onboarding</Link>
        </Button>
      </div>

      <BaselineCompletenessCard completeness={completeness} />
      <RunnerProfileForm profile={profile} />
      <GoalManager goals={goals} distanceUnit={profile.preferred_distance_unit} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Public Environment Status</CardTitle>
              <Badge variant={publicEnv.configured ? "success" : "warning"}>
                {publicEnv.configured ? "Configured" : "Setup Pending"}
              </Badge>
            </div>
            <CardDescription>
              Client-safe Supabase and app URL configuration validation (no secrets exposed).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-secondary)]">
            {publicEnv.configured ? (
              <p>Public Supabase URL and anonymous client key format validated.</p>
            ) : (
              <p>
                Missing or invalid public env keys:{" "}
                <code className="font-metric text-xs text-[var(--text-primary)]">
                  {publicEnv.missingKeys.join(", ")}
                </code>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strava Integration</CardTitle>
            <CardDescription>
              OAuth2 (`activity:read_all`), encrypted token isolation, and hybrid sync arrive in
              Milestone 3.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SyncStatus
              state="not_connected"
              detail="Connect Strava in Milestone 3 to import your running history."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
