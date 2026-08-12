import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getRequiredSupabasePublicEnv } from "@/utils/env";

export function createSupabaseAdminClient() {
  const { url } = getRequiredSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Required for staff account creation.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
