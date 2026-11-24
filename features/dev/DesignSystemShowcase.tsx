"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricValue } from "@/components/shared/MetricValue";
import { StatePanel, type PanelStateKind } from "@/components/shared/StatePanel";
import { WorkoutStatus } from "@/components/shared/WorkoutStatus";
import { WorkoutTypeBadge } from "@/components/shared/WorkoutTypeBadge";
import { DataCompletenessNote } from "@/components/shared/DataCompletenessNote";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { ChartFrame } from "@/components/shared/ChartFrame";
import { MISSING_VALUE_LABEL } from "@/lib/utils/units";

export function DesignSystemShowcase() {
  const [previewState, setPreviewState] = React.useState<PanelStateKind>("empty");
  const [unitPreference, setUnitPreference] = React.useState<"km" | "mi">("km");

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <p className="text-xs font-medium text-[var(--accent-purple-strong)]">
            Development Route Only
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Design System & State Verification
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Internal reference for Modern Gradient Athletic tokens, shared components, and UI states.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                System Info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Design System Token Summary</DialogTitle>
                <DialogDescription>
                  Modern Gradient Athletic - Light First tokens, accessible controls, and honest
                  missing-data rendering.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                <p>
                  Every unrecorded measurement renders as &quot;{MISSING_VALUE_LABEL}&quot; instead
                  of zero.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <WorkoutTypeBadge type="easy_run" />
                  <WorkoutTypeBadge type="tempo_run" />
                  <WorkoutStatus status="planned" />
                  <WorkoutStatus status="missed" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild size="sm">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Interactive state & unit verification */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Foundational UI Controls & State Verification</CardTitle>
              <CardDescription>
                Interactive primitives demonstrating Empty, Loading, Insufficient Data, and Error
                states alongside unit formatting.
              </CardDescription>
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={unitPreference}
                onValueChange={(value) => setUnitPreference(value as "km" | "mi")}
              >
                <SelectTrigger aria-label="Preview display unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers (km)</SelectItem>
                  <SelectItem value="mi">Miles (mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-subtle)] p-4">
              <MetricValue
                label="Sample Missing Metric"
                value={null}
                unit={unitPreference}
                period="Current week"
                sourceLabel="Unrecorded"
              />
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] p-4">
              <MetricValue
                label="Display Unit Selected"
                value={unitPreference === "km" ? "0.00" : "0.00"}
                unit={unitPreference}
                period="Unit formatter preview"
                sourceLabel="Preview"
                isEstimated
              />
            </div>
            <div className="flex flex-col justify-between gap-2 rounded-xl border border-[var(--border-subtle)] p-4">
              <label htmlFor="dev-input-sample" className="text-xs font-medium text-[var(--text-secondary)]">
                Form Input Control
              </label>
              <Input id="dev-input-sample" placeholder="e.g., 10K Tempo" />
            </div>
          </div>

          <Tabs
            value={previewState}
            onValueChange={(value) => setPreviewState(value as PanelStateKind)}
          >
            <TabsList aria-label="UI state selector">
              <TabsTrigger value="empty">Empty</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="insufficient-data">Insufficient Data</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>

            <TabsContent value="empty">
              <StatePanel
                kind="empty"
                title="No synced activities yet"
                description="Empty state guides the runner toward connecting Strava or creating a plan."
                action={
                  <Button asChild size="sm" variant="pill">
                    <Link href="/activities">Go to Activities</Link>
                  </Button>
                }
              />
            </TabsContent>
            <TabsContent value="loading">
              <StatePanel
                kind="loading"
                title="Loading training summary"
                description="Skeleton loading indicator preserving card layout."
              />
            </TabsContent>
            <TabsContent value="insufficient-data">
              <StatePanel
                kind="insufficient-data"
                title="Baseline incomplete"
                description="Missing baseline fields remain NULL and fall back to RPE guidance rather than guessed paces."
              />
            </TabsContent>
            <TabsContent value="error">
              <StatePanel
                kind="error"
                title="Unable to reach external provider"
                description="Actionable error fallback preserves workspace navigation when external providers are unavailable."
                action={
                  <Button size="sm" variant="secondary" onClick={() => setPreviewState("empty")}>
                    Reset State
                  </Button>
                }
              />
            </TabsContent>
          </Tabs>

          <DataCompletenessNote
            title="Completeness disclosure component"
            message="Used on Analytics, Recovery, and AI Coach surfaces whenever inputs rely on estimates or partial logs."
          />
        </CardContent>
      </Card>

      {/* Badges, statuses, and chart shells */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Semantic Badges & Statuses</CardTitle>
            <CardDescription>Icon + text + color pairings meeting WCAG AA contrast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="blue">Blue Tint</Badge>
              <Badge variant="purple">Purple Tint</Badge>
              <Badge variant="cyan">Cyan Tint</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <WorkoutTypeBadge type="easy_run" />
              <WorkoutTypeBadge type="long_run" />
              <WorkoutTypeBadge type="tempo_run" />
              <WorkoutTypeBadge type="interval" />
              <WorkoutTypeBadge type="rest" />
            </div>
            <div className="flex flex-wrap gap-2">
              <WorkoutStatus status="planned" />
              <WorkoutStatus status="completed" />
              <WorkoutStatus status="skipped" />
              <WorkoutStatus status="rescheduled" />
              <WorkoutStatus status="modified" />
              <WorkoutStatus status="missed" />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <SyncStatus state="not_connected" />
              <SyncStatus state="connected" />
              <SyncStatus state="partial" />
              <SyncStatus state="error" />
            </div>
          </CardContent>
        </Card>

        <ChartFrame
          title="ChartFrame Empty State"
          timeframe="Last 12 weeks"
          unit={unitPreference}
          state="empty"
          emptyMessage="ChartFrame guarantees explicit timeframe, units, and empty/error states before data arrives."
        />
      </div>
    </div>
  );
}
