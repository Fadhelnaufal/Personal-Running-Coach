import "server-only";
import { createClient } from "@supabase/supabase-js";
import { parsePublicEnv } from "@/lib/env";
import { getServerEnv } from "@/server/config/env";
import type { Database } from "@/lib/supabase/database.types";

export function createSupabaseAdminClient() {
  const publicEnv = parsePublicEnv();
  const serverEnv = getServerEnv();

  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
