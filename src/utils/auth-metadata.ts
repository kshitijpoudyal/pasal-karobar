import type { User } from "@supabase/supabase-js";

export function canCreateBusiness(user: User | null | undefined): boolean {
  return user?.user_metadata?.can_create_business === true;
}

export function displayNameFromUser(user: User | null | undefined): string | null {
  const fromMeta = user?.user_metadata?.display_name;
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    return fromMeta.trim();
  }
  return null;
}
