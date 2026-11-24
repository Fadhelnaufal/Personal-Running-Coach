export type NavIconKey =
  | "dashboard"
  | "calendar"
  | "activities"
  | "analytics"
  | "recovery"
  | "coach"
  | "settings";

export interface NavRouteItem {
  id: NavIconKey;
  label: string;
  shortLabel: string;
  href: string;
  description: string;
  showInMobileBottomNav: boolean;
}

export const APP_NAV_ROUTES: readonly NavRouteItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    href: "/dashboard",
    description: "Training overview, active goal status, and next session",
    showInMobileBottomNav: true,
  },
  {
    id: "calendar",
    label: "Training Calendar",
    shortLabel: "Calendar",
    href: "/calendar",
    description: "Weekly and monthly planned training schedule",
    showInMobileBottomNav: true,
  },
  {
    id: "activities",
    label: "Activities",
    shortLabel: "Runs",
    href: "/activities",
    description: "Synced Strava activities and workout matches",
    showInMobileBottomNav: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "Stats",
    href: "/analytics",
    description: "Volume, pace comparability, and training load trends",
    showInMobileBottomNav: false,
  },
  {
    id: "recovery",
    label: "Recovery",
    shortLabel: "Recovery",
    href: "/recovery",
    description: "Daily check-ins, sleep, soreness, and readiness trends",
    showInMobileBottomNav: true,
  },
  {
    id: "coach",
    label: "AI Coach",
    shortLabel: "Coach",
    href: "/coach",
    description: "Weekly reviews, evidence-backed insights, and proposals",
    showInMobileBottomNav: true,
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "Settings",
    href: "/settings",
    description: "Runner profile, units, timezone, Strava, and data controls",
    showInMobileBottomNav: false,
  },
] as const;

export const MOBILE_BOTTOM_NAV_ROUTES = APP_NAV_ROUTES.filter(
  (route) => route.showInMobileBottomNav
);
