import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { requireAuthenticatedUser } from "@/server/auth/session";

export default async function AppWorkspaceLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireAuthenticatedUser();

  return (
    <AppShell
      runnerName={profile.display_name ?? user.email ?? "Runner"}
    >
      {children}
    </AppShell>
  );
}
