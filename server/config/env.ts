import "server-only";
import { z } from "zod";

export const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  STRAVA_CLIENT_ID: z.string().min(1).optional(),
  STRAVA_CLIENT_SECRET: z.string().min(1).optional(),
  STRAVA_TOKEN_ENCRYPTION_KEY: z.string().min(32).optional(),
  STRAVA_WEBHOOK_VERIFY_TOKEN: z.string().min(1).optional(),
  STRAVA_WEBHOOK_SUBSCRIPTION_ID: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1).optional(),
  OPENROUTER_FALLBACK_MODEL: z.string().min(1).optional(),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_APP_NAME: z.string().min(1).optional(),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().max(120_000).default(20_000),
  AI_MAX_REQUESTS_PER_DAY: z.coerce.number().int().positive().optional(),
  AI_MAX_TOKENS: z.coerce.number().int().positive().optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function normalizeEmptyToUndefined(
  source: Record<string, string | undefined>
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    normalized[key] = value === "" ? undefined : value;
  }
  return normalized;
}

export function parseServerEnv(
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): ServerEnv {
  const result = serverEnvSchema.safeParse(normalizeEmptyToUndefined(source));
  if (!result.success) {
    // Log only variable names, never raw values.
    const fields = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration (${fields})`);
  }
  return result.data;
}

export function getServerEnv(): ServerEnv {
  return parseServerEnv();
}
