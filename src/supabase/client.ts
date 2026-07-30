import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getRequiredSupabasePublicEnv } from "@/utils/env";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  const { url, anonKey } = getRequiredSupabasePublicEnv();

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}

export function resetSupabaseBrowserClient(): void {
  browserClient = undefined;
}
