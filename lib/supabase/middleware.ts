import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnvStatus } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/calendar",
  "/activities",
  "/analytics",
  "/recovery",
  "/coach",
  "/settings",
  "/onboarding",
] as const;

const AUTH_ROUTE_PREFIXES = ["/login", "/signup"] as const;

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthRoutePath(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;
  const protectedPath = isProtectedAppPath(pathname);
  const authRoute = isAuthRoutePath(pathname);

  const envStatus = getPublicEnvStatus();
  if (!envStatus.configured) {
    if (protectedPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient<Database>(
    envStatus.env.NEXT_PUBLIC_SUPABASE_URL,
    envStatus.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  let isAuthenticated = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = user !== null;
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated && protectedPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && authRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.searchParams.delete("next");
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
