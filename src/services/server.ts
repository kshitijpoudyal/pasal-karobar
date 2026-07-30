import { createAppServices } from "@/services";
import { createSupabaseServerClient } from "@/supabase/server";

export async function getServerAppServices() {
  const supabase = await createSupabaseServerClient();
  return createAppServices(supabase);
}
