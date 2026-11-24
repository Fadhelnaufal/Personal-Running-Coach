"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicEnvStatus } from "@/lib/env";

const authCredentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface AuthActionState {
  error: string | null;
  message: string | null;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const envStatus = getPublicEnvStatus();
  if (!envStatus.configured) {
    return {
      error: "Supabase public environment configuration is not set.",
      message: null,
    };
  }

  const parsed = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid sign-in details.",
      message: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Invalid email or password, or account not yet confirmed.",
      message: null,
    };
  }

  const nextPath = formData.get("next");
  const safeNext =
    typeof nextPath === "string" && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  redirect(safeNext);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const envStatus = getPublicEnvStatus();
  if (!envStatus.configured) {
    return {
      error: "Supabase public environment configuration is not set.",
      message: null,
    };
  }

  const parsed = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid sign-up details.",
      message: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${envStatus.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
      message: null,
    };
  }

  if (data.session) {
    redirect("/onboarding");
  }

  return {
    error: null,
    message: "Account created. Check your email confirmation link before signing in.",
  };
}

export async function signOutAction(): Promise<void> {
  const envStatus = getPublicEnvStatus();
  if (envStatus.configured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
