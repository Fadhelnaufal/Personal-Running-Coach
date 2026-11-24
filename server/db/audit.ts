import "server-only";
import { createSupabaseAdminClient } from "@/server/db/admin";
import type { Json } from "@/lib/supabase/database.types";

const REDACTED_KEYS = new Set([
  "access_token",
  "refresh_token",
  "access_token_ciphertext",
  "refresh_token_ciphertext",
  "authorization",
  "password",
  "secret",
  "api_key",
]);

export function sanitizeAuditSnapshot(value: unknown): Json | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditSnapshot(item));
  }
  if (typeof value === "object") {
    const output: { [key: string]: Json | undefined } = {};
    for (const [key, entry] of Object.entries(value)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = sanitizeAuditSnapshot(entry);
      }
    }
    return output;
  }
  return null;
}

export interface RecordAuditLogInput {
  userId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeSnapshot?: unknown;
  afterSnapshot?: unknown;
  metadata?: unknown;
}

export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("audit_logs").insert({
    user_id: input.userId,
    actor_user_id: input.actorUserId ?? input.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    before_snapshot: sanitizeAuditSnapshot(input.beforeSnapshot),
    after_snapshot: sanitizeAuditSnapshot(input.afterSnapshot),
    metadata: sanitizeAuditSnapshot(input.metadata),
  });

  if (error) {
    throw new Error(`Failed to persist audit log: ${error.message}`);
  }
}
