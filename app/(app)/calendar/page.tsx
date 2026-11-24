import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatePanel } from "@/components/shared/StatePanel";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)]">Training Calendar</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Schedule Overview
        </h1>
      </div>

      <Tabs defaultValue="week">
        <TabsList aria-label="Calendar view toggle">
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <StatePanel
            kind="empty"
            title="No workouts scheduled this week"
            description="Training plan generation (Milestone 4) and interactive calendar management (Milestone 5) will populate daily sessions here. Missed workouts never auto-roll forward."
            action={
              <Button asChild size="sm">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="month">
          <StatePanel
            kind="empty"
            title="Monthly view awaiting active training plan"
            description="Once a training plan is activated, monthly phases and daily workout statuses will appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
