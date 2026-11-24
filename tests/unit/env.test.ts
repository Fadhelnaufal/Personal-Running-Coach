import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env";
import { parseServerEnv } from "@/server/config/env";

describe("Environment validation", () => {
  it("parses valid public environment variables", () => {
    const parsed = parsePublicEnv({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "https://demo.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-value",
    });

    expect(parsed.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe("https://demo.supabase.co");
  });

  it("throws without leaking secret values when public env is invalid", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_APP_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_URL: "https://demo.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      })
    ).toThrowError(/Invalid public environment configuration/);
  });

  it("validates server environment variables and applies safe AI timeout default", () => {
    const parsed = parseServerEnv({
      SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
      OPENROUTER_API_KEY: "or-secret",
    });

    expect(parsed.SUPABASE_SERVICE_ROLE_KEY).toBe("service-role-secret");
    expect(parsed.AI_REQUEST_TIMEOUT_MS).toBe(20_000);
  });

  it("never includes raw secret values in server env error messages", () => {
    const secretLike = "super-secret-value-123";
    let message = "";
    try {
      parseServerEnv({
        SUPABASE_SERVICE_ROLE_KEY: "",
        OPENROUTER_SITE_URL: secretLike,
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toContain("Invalid server environment configuration");
    expect(message).not.toContain(secretLike);
  });
});
