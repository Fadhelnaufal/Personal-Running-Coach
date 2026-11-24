"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  activatePrimaryGoalAction,
  createRunnerGoalAction,
  deleteGoalAction,
  updateGoalStatusAction,
  type RunnerFormState,
} from "@/features/runner/actions";
import type { RunnerGoalRow } from "@/lib/supabase/database.types";
import { formatDistance, formatDuration, type DistanceUnit } from "@/lib/utils/units";

const INITIAL_STATE: RunnerFormState = { status: "idle", message: null };

export function GoalManager({
  goals,
  distanceUnit,
}: {
  goals: RunnerGoalRow[];
  distanceUnit: DistanceUnit;
}) {
  const [state, formAction, isPending] = React.useActionState(
    createRunnerGoalAction,
    INITIAL_STATE
  );
  const [goalType, setGoalType] = React.useState<
    "5k" | "10k" | "half_marathon" | "marathon" | "custom"
  >("10k");

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Add Running Goal</CardTitle>
          <CardDescription>
            Only one active primary goal is allowed at a time. Setting a new active primary goal
            automatically archives any previous active primary goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="goal_type" className="text-xs font-medium text-[var(--text-primary)]">
                  Distance category
                </label>
                <select
                  id="goal_type"
                  name="goal_type"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as typeof goalType)}
                  className="flex min-h-[44px] w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                >
                  <option value="5k">5K (5.0 km)</option>
                  <option value="10k">10K (10.0 km)</option>
                  <option value="half_marathon">Half Marathon (21.1 km)</option>
                  <option value="marathon">Marathon (42.2 km)</option>
                  <option value="custom">Custom distance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="goal_title" className="text-xs font-medium text-[var(--text-primary)]">
                  Goal title
                </label>
                <Input
                  id="goal_title"
                  name="title"
                  required
                  placeholder="e.g., Autumn 10K Sub-45"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="goal_priority" className="text-xs font-medium text-[var(--text-primary)]">
                  Priority
                </label>
                <select
                  id="goal_priority"
                  name="priority"
                  defaultValue="primary"
                  className="flex min-h-[44px] w-full rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                >
                  <option value="primary">Primary goal</option>
                  <option value="secondary">Secondary goal</option>
                </select>
              </div>

              {goalType === "custom" ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="custom_distance"
                    className="text-xs font-medium text-[var(--text-primary)]"
                  >
                    Custom distance ({distanceUnit})
                  </label>
                  <Input
                    id="custom_distance"
                    name="custom_distance"
                    type="number"
                    step="0.1"
                    min={0.5}
                    required
                    placeholder={`e.g. 15 ${distanceUnit}`}
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="target_time" className="text-xs font-medium text-[var(--text-primary)]">
                  Target time (optional, hh:mm:ss or mm:ss)
                </label>
                <Input id="target_time" name="target_time" placeholder="e.g. 44:30 or 1:38:00" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="race_date" className="text-xs font-medium text-[var(--text-primary)]">
                  Race date (optional)
                </label>
                <Input id="race_date" name="race_date" type="date" />
              </div>
            </div>

            {state.status === "error" && state.message ? (
              <p
                role="alert"
                className="rounded-xl border border-[#fecaca] bg-[var(--status-danger-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--status-danger)]"
              >
                {state.message}
              </p>
            ) : null}

            {state.status === "success" && state.message ? (
              <p
                role="status"
                className="rounded-xl border border-[#bbf7d0] bg-[var(--status-success-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--status-success)]"
              >
                {state.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving goal..." : "Save Goal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Manage active, achieved, and archived goals.</CardDescription>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              No goals recorded yet. Add a primary goal above to anchor your baseline.
            </p>
          ) : (
            <ul className="space-y-3">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {goal.title}
                      </span>
                      <Badge variant={goal.priority === "primary" ? "purple" : "neutral"}>
                        {goal.priority === "primary" ? "Primary" : "Secondary"}
                      </Badge>
                      <Badge
                        variant={
                          goal.status === "active"
                            ? "success"
                            : goal.status === "achieved"
                              ? "blue"
                              : "neutral"
                        }
                      >
                        {goal.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatDistance(goal.target_distance_m, distanceUnit)} · Target time:{" "}
                      {formatDuration(goal.target_time_sec)} · Race date:{" "}
                      {goal.race_date ?? "Not recorded"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!(goal.priority === "primary" && goal.status === "active") ? (
                      <form action={activatePrimaryGoalAction.bind(null, goal.id)}>
                        <Button type="submit" size="sm" variant="pill">
                          Set Active Primary
                        </Button>
                      </form>
                    ) : null}
                    {goal.status === "active" ? (
                      <>
                        <form action={updateGoalStatusAction.bind(null, goal.id, "achieved")}>
                          <Button type="submit" size="sm" variant="outline">
                            Mark Achieved
                          </Button>
                        </form>
                        <form action={updateGoalStatusAction.bind(null, goal.id, "archived")}>
                          <Button type="submit" size="sm" variant="ghost">
                            Archive
                          </Button>
                        </form>
                      </>
                    ) : null}
                    <form action={deleteGoalAction.bind(null, goal.id)}>
                      <Button type="submit" size="sm" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
