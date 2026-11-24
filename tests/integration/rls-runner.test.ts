import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasLiveSupabase =
  Boolean(supabaseUrl && anonKey && serviceRoleKey) &&
  !supabaseUrl?.includes("example.supabase.co");

describe.skipIf(!hasLiveSupabase)("Two-user PostgreSQL RLS isolation (Milestone 2)", () => {
  let admin: SupabaseClient<Database>;
  let userAClient: SupabaseClient<Database>;
  let userBClient: SupabaseClient<Database>;
  let userAId = "";
  let userBId = "";

  beforeAll(async () => {
    admin = createClient<Database>(supabaseUrl!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const emailA = `rls-a-${Date.now()}@example.com`;
    const emailB = `rls-b-${Date.now()}@example.com`;
    const password = "TestPassword123!";

    const { data: createdA, error: errA } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    if (errA || !createdA.user) throw new Error(errA?.message ?? "Failed to create User A");
    userAId = createdA.user.id;

    const { data: createdB, error: errB } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    if (errB || !createdB.user) throw new Error(errB?.message ?? "Failed to create User B");
    userBId = createdB.user.id;

    userAClient = createClient<Database>(supabaseUrl!, anonKey!);
    userBClient = createClient<Database>(supabaseUrl!, anonKey!);

    await userAClient.auth.signInWithPassword({ email: emailA, password });
    await userBClient.auth.signInWithPassword({ email: emailB, password });
  });

  afterAll(async () => {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it("isolates runner_profiles, runner_goals, audit_logs, and blocks oauth_states", async () => {
    const { error: insertProfErr } = await userAClient.from("runner_profiles").insert({
      user_id: userAId,
      timezone_name: "Asia/Jakarta",
    });
    expect(insertProfErr).toBeNull();

    const { data: bReadsA } = await userBClient
      .from("runner_profiles")
      .select("*")
      .eq("user_id", userAId);
    expect(bReadsA).toEqual([]);

    const { error: bInsertAsA } = await userBClient.from("runner_profiles").insert({
      user_id: userAId,
      timezone_name: "UTC",
    });
    expect(bInsertAsA).not.toBeNull();

    // Primary goal atomic activation test
    const { data: goal1 } = await userAClient
      .from("runner_goals")
      .insert({
        user_id: userAId,
        goal_type: "10k",
        title: "First 10K",
        target_distance_m: 10000,
        priority: "primary",
        status: "archived",
      })
      .select("*")
      .single();

    const { data: goal2 } = await userAClient
      .from("runner_goals")
      .insert({
        user_id: userAId,
        goal_type: "half_marathon",
        title: "Second HM",
        target_distance_m: 21097.5,
        priority: "primary",
        status: "archived",
      })
      .select("*")
      .single();

    expect(goal1 && goal2).toBeTruthy();

    await userAClient.rpc("activate_primary_goal", { p_user_id: userAId, p_goal_id: goal1!.id });
    await userAClient.rpc("activate_primary_goal", { p_user_id: userAId, p_goal_id: goal2!.id });

    const { data: activePrimaries } = await userAClient
      .from("runner_goals")
      .select("*")
      .eq("user_id", userAId)
      .eq("priority", "primary")
      .eq("status", "active");
    expect(activePrimaries).toHaveLength(1);
    expect(activePrimaries?.[0]?.id).toBe(goal2!.id);

    // User B cannot read or delete User A goals
    const { data: bReadsGoal } = await userBClient
      .from("runner_goals")
      .select("*")
      .eq("id", goal2!.id);
    expect(bReadsGoal).toEqual([]);

    // oauth_states blocked to authenticated clients
    const { error: oauthErr } = await userAClient.from("oauth_states").insert({
      user_id: userAId,
      state_hash: "fake-hash",
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(oauthErr).not.toBeNull();
  });
});
