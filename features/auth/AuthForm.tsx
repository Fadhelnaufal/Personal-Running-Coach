"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatePanel } from "@/components/shared/StatePanel";
import type { AuthActionState } from "@/app/(auth)/actions";

interface AuthFormProps {
  mode: "login" | "signup";
  action: (prevState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  nextPath?: string;
  envConfigured: boolean;
}

const INITIAL_STATE: AuthActionState = { error: null, message: null };

export function AuthForm({ mode, action, nextPath, envConfigured }: AuthFormProps) {
  const [state, formAction, isPending] = React.useActionState(action, INITIAL_STATE);
  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="space-y-1 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent-blue-strong)]">
            Personal Running Coach
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {isLogin ? "Sign In to Workspace" : "Create Runner Account"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isLogin
              ? "Access your private training plans, synced runs, and recovery log."
              : "Set up your private workspace protected by row-level security."}
          </p>
        </div>

        {!envConfigured ? (
          <StatePanel
            kind="insufficient-data"
            title="Supabase configuration required"
            description="Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable live sign-in."
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Runner Sign In" : "New Runner Registration"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter the email and password for your runner workspace."
                : "Use a valid email and a password of at least 8 characters."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="text-xs font-medium text-[var(--text-primary)]">
                  Email address
                </label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="runner@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-medium text-[var(--text-primary)]"
                >
                  Password
                </label>
                <Input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={8}
                  required
                  placeholder="Minimum 8 characters"
                />
              </div>

              {state.error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-[#fecaca] bg-[var(--status-danger-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--status-danger)]"
                >
                  {state.error}
                </p>
              ) : null}

              {state.message ? (
                <p
                  role="status"
                  className="rounded-xl border border-[#bbf7d0] bg-[var(--status-success-bg)] px-3.5 py-2.5 text-xs font-medium text-[var(--status-success)]"
                >
                  {state.message}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Sign In to Workspace"
                    : "Create Runner Account"}
              </Button>
            </form>

            <div className="mt-4 border-t border-[var(--border-subtle)] pt-4 text-center text-xs text-[var(--text-secondary)]">
              {isLogin ? (
                <span>
                  New runner?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-[var(--accent-blue-strong)] hover:underline"
                  >
                    Create an account
                  </Link>
                </span>
              ) : (
                <span>
                  Already have a workspace?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[var(--accent-blue-strong)] hover:underline"
                  >
                    Sign in
                  </Link>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
