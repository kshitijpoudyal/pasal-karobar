import type { SupabaseClient } from "@supabase/supabase-js";

import { createAppServices, type AppServices } from "@/services";
import { createSupabaseBrowserClient } from "@/supabase/client";
import type { Database } from "@/types/database";

let clientServices: AppServices | undefined;

export function getClientAppServices(): AppServices {
  if (!clientServices) {
    clientServices = createAppServices(createSupabaseBrowserClient());
  }
  return clientServices;
}

export function createAppServicesFromClient(
  supabase: SupabaseClient<Database>,
): AppServices {
  return createAppServices(supabase);
}

export function resetClientAppServices(): void {
  clientServices = undefined;
}
