"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { APP_NAV_ROUTES, MOBILE_BOTTOM_NAV_ROUTES } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";
import { NavIcon } from "@/components/shared/NavIcon";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { signOutAction } from "@/app/(auth)/actions";

interface AppShellProps {
  runnerName?: string;
  children: React.ReactNode;
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="athletic-hero-surface inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2">
        <path d="M4 17h5l3-10 4 10h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function AppShell({ runnerName = "Runner", children }: AppShellProps) {
  const pathname = usePathname();

  const currentRoute =
    APP_NAV_ROUTES.find(
      (route) => pathname === route.href || pathname.startsWith(`${route.href}/`)
    ) ?? APP_NAV_ROUTES[0];

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-canvas)]">
      {/* Desktop persistent left sidebar */}
      <aside
        aria-label="Primary desktop navigation"
        className="hidden lg:flex lg:w-[256px] lg:shrink-0 lg:flex-col lg:justify-between lg:border-r lg:border-[var(--border-subtle)] lg:bg-[var(--bg-surface)] lg:px-4 lg:py-6"
      >
        <div className="flex flex-col gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
          >
            <BrandMark />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight text-[var(--text-primary)]">
                Personal Running Coach
              </span>
              <span className="truncate text-xs text-[var(--text-secondary)]">{runnerName}</span>
            </div>
          </Link>

          <nav aria-label="Workspace sections" className="flex flex-col gap-1">
            {APP_NAV_ROUTES.map((route) => {
              const isActive =
                pathname === route.href || pathname.startsWith(`${route.href}/`);
              return (
                <Link
                  key={route.id}
                  href={route.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]",
                    isActive
                      ? "bg-[var(--tint-blue)] text-[var(--accent-blue-strong)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <NavIcon name={route.id} className="h-[18px] w-[18px] shrink-0" />
                  <span>{route.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5">
            <SyncStatus
              state="not_connected"
              detail="Connect Strava in Settings to sync your runs."
            />
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-[44px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main viewport column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact mobile/tablet top app bar */}
        <header className="sticky top-0 z-30 flex min-h-[60px] items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 lg:hidden">
          <Link
            href="/dashboard"
            className="flex min-h-[44px] items-center gap-2.5 rounded-lg pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
          >
            <BrandMark />
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-[var(--text-primary)]">
                RunCoach
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {currentRoute?.label ?? "Dashboard"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/analytics"
              aria-label="Analytics"
              aria-current={pathname.startsWith("/analytics") ? "page" : undefined}
              className={cn(
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]",
                pathname.startsWith("/analytics")
                  ? "bg-[var(--tint-blue)] text-[var(--accent-blue-strong)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              )}
            >
              <NavIcon name="analytics" className="h-5 w-5" />
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              aria-current={pathname.startsWith("/settings") ? "page" : undefined}
              className={cn(
                "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]",
                pathname.startsWith("/settings")
                  ? "bg-[var(--tint-blue)] text-[var(--accent-blue-strong)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              )}
            >
              <NavIcon name="settings" className="h-5 w-5" />
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Sign Out"
                className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile floating rounded bottom tab navigation */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 py-1 shadow-[var(--shadow-floating)] lg:hidden"
      >
        <ul className="grid grid-cols-5 items-center gap-1">
          {MOBILE_BOTTOM_NAV_ROUTES.map((route) => {
            const isActive =
              pathname === route.href || pathname.startsWith(`${route.href}/`);
            return (
              <li key={route.id}>
                <Link
                  href={route.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]",
                    isActive
                      ? "bg-[var(--tint-blue)] text-[var(--accent-blue-strong)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <NavIcon name={route.id} className="h-[18px] w-[18px]" />
                  <span className="max-w-full truncate">{route.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
