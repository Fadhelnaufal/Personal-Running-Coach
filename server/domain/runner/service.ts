import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RunnerGoalRow, RunnerProfileRow } from "@/lib/supabase/database.types";
import { recordAuditLog } from "@/server/db/audit";
import {
  runnerGoalInputSchema,
  runnerProfileUpdateSchema,
  type RunnerGoalInput,
  type RunnerProfileUpdateInput,
} from "@/server/domain/runner/schemas";
import { calculateBaselineCompleteness } from "@/server/domain/runner/completeness";

export interface RunnerWorkspaceData {
  profile: RunnerProfileRow;
  goals: RunnerGoalRow[];
  activePrimaryGoal: RunnerGoalRow | null;
  completeness: ReturnType<typeof calculateBaselineCompleteness>;
}

export async function getRunnerWorkspaceData(userId: string): Promise<RunnerWorkspaceData> {
  const supabase = await createSupabaseServerClient();

  const [{ data: profile, error: profileError }, { data: goals, error: goalsError }] =
    await Promise.all([
      supabase.from("runner_profiles").select("*").eq("user_id", userId).single(),
      supabase
        .from("runner_goals")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

  if (profileError || !profile) {
    throw new Error(`Failed to load runner profile: ${profileError?.message ?? "missing"}`);
  }
  if (goalsError) {
    throw new Error(`Failed to load runner goals: ${goalsError.message}`);
  }

  const goalList = goals ?? [];
  const activePrimaryGoal =
    goalList.find((g) => g.priority === "primary" && g.status === "active") ?? null;

  return {
    profile,
    goals: goalList,
    activePrimaryGoal,
    completeness: calculateBaselineCompleteness(profile, activePrimaryGoal),
  };
}

export async function updateRunnerProfile(
  userId: string,
  rawInput: RunnerProfileUpdateInput
): Promise<RunnerProfileRow> {
  const parsed = runnerProfileUpdateSchema.parse(rawInput);
  const supabase = await createSupabaseServerClient();

  const { data: before, error: readError } = await supabase
    .from("runner_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (readError || !before) {
    throw new Error(`Runner profile not found: ${readError?.message ?? "missing"}`);
  }

  const nowIso = new Date().toISOString();
  const isCompleted =
    parsed.experience_level !== null && parsed.weekly_running_days !== null;

  const { data: updated, error: updateError } = await supabase
    .from("runner_profiles")
    .update({
      display_name: parsed.display_name,
      timezone_name: parsed.timezone_name,
      experience_level: parsed.experience_level,
      preferred_distance_unit: parsed.preferred_distance_unit,
      preferred_pace_unit: parsed.preferred_pace_unit,
      weekly_running_days: parsed.weekly_running_days,
      preferred_training_days: parsed.preferred_training_days,
      unavailable_days: parsed.unavailable_days,
      recent_weekly_distance_m: parsed.recent_weekly_distance_m,
      longest_recent_run_m: parsed.longest_recent_run_m,
      easy_pace_sec_per_km: parsed.easy_pace_sec_per_km,
      threshold_pace_sec_per_km: parsed.threshold_pace_sec_per_km,
      resting_hr_bpm: parsed.resting_hr_bpm,
      max_hr_bpm: parsed.max_hr_bpm,
      lthr_bpm: parsed.lthr_bpm,
      weight_kg: parsed.weight_kg,
      injury_history: parsed.injury_notes ? { summary: parsed.injury_notes } : null,
      notes: parsed.notes,
      baseline_updated_at: nowIso,
      baseline_source: "manual",
      profile_completed_at: isCompleted ? (before.profile_completed_at ?? nowIso) : null,
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update runner profile: ${updateError?.message ?? "unknown"}`);
  }

  await recordAuditLog({
    userId,
    action: "runner_profile.updated",
    entityType: "runner_profiles",
    entityId: updated.id,
    beforeSnapshot: before,
    afterSnapshot: updated,
  });

  return updated;
}

export async function createRunnerGoal(
  userId: string,
  rawInput: RunnerGoalInput
): Promise<RunnerGoalRow> {
  const parsed = runnerGoalInputSchema.parse(rawInput);
  const supabase = await createSupabaseServerClient();

  const activatingPrimary = parsed.priority === "primary" && parsed.status === "active";

  // Insert as archived first when activating primary so atomic RPC switches active primary cleanly.
  const { data: inserted, error: insertError } = await supabase
    .from("runner_goals")
    .insert({
      user_id: userId,
      goal_type: parsed.goal_type,
      title: parsed.title,
      target_distance_m: parsed.target_distance_m,
      target_time_sec: parsed.target_time_sec,
      race_date: parsed.race_date,
      priority: parsed.priority,
      status: activatingPrimary ? "archived" : parsed.status,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    throw new Error(`Failed to create goal: ${insertError?.message ?? "unknown"}`);
  }

  let finalGoal = inserted;
  if (activatingPrimary) {
    const { data: activated, error: rpcError } = await supabase.rpc("activate_primary_goal", {
      p_user_id: userId,
      p_goal_id: inserted.id,
    });
    if (rpcError || !activated) {
      throw new Error(`Failed to activate primary goal: ${rpcError?.message ?? "unknown"}`);
    }
    finalGoal = activated;
  }

  await recordAuditLog({
    userId,
    action: "runner_goal.created",
    entityType: "runner_goals",
    entityId: finalGoal.id,
    afterSnapshot: finalGoal,
  });

  return finalGoal;
}

export async function setPrimaryGoal(userId: string, goalId: string): Promise<RunnerGoalRow> {
  const supabase = await createSupabaseServerClient();
  const { data: before } = await supabase
    .from("runner_goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  const { data: activated, error } = await supabase.rpc("activate_primary_goal", {
    p_user_id: userId,
    p_goal_id: goalId,
  });

  if (error || !activated) {
    throw new Error(`Failed to set primary goal: ${error?.message ?? "unknown"}`);
  }

  await recordAuditLog({
    userId,
    action: "runner_goal.activated_primary",
    entityType: "runner_goals",
    entityId: goalId,
    beforeSnapshot: before ?? null,
    afterSnapshot: activated,
  });

  return activated;
}

export async function updateGoalStatus(
  userId: string,
  goalId: string,
  status: "active" | "achieved" | "archived"
): Promise<RunnerGoalRow> {
  const supabase = await createSupabaseServerClient();
  const { data: before, error: readError } = await supabase
    .from("runner_goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (readError || !before) {
    throw new Error(`Goal not found: ${readError?.message ?? "missing"}`);
  }

  if (status === "active" && before.priority === "primary") {
    return setPrimaryGoal(userId, goalId);
  }

  const { data: updated, error: updateError } = await supabase
    .from("runner_goals")
    .update({ status })
    .eq("id", goalId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update goal status: ${updateError?.message ?? "unknown"}`);
  }

  await recordAuditLog({
    userId,
    action: "runner_goal.status_updated",
    entityType: "runner_goals",
    entityId: goalId,
    beforeSnapshot: before,
    afterSnapshot: updated,
  });

  return updated;
}

export async function deleteRunnerGoal(userId: string, goalId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: before, error: readError } = await supabase
    .from("runner_goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (readError || !before) {
    throw new Error(`Goal not found: ${readError?.message ?? "missing"}`);
  }

  const { error: deleteError } = await supabase
    .from("runner_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to delete goal: ${deleteError.message}`);
  }

  await recordAuditLog({
    userId,
    action: "runner_goal.deleted",
    entityType: "runner_goals",
    entityId: goalId,
    beforeSnapshot: before,
  });
}
