import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RunnerProfileRow } from "@/lib/supabase/database.types";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function ensureRunnerProfile(userId: string): Promise<RunnerProfileRow> {
  const supabase = await createSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("runner_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Unable to read runner profile: ${fetchError.message}`);
  }
  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("runner_profiles")
    .upsert(
      {
        user_id: userId,
        timezone_name: "UTC",
        preferred_distance_unit: "km",
        preferred_pace_unit: "min_per_km",
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (insertError || !created) {
    throw new Error(`Unable to provision runner profile: ${insertError?.message ?? "unknown"}`);
  }

  return created;
}

export async function requireAuthenticatedUser(): Promise<{
  user: User;
  profile: RunnerProfileRow;
}> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const profile = await ensureRunnerProfile(user.id);
  return { user, profile };
}
