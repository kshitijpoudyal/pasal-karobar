"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { ProfileRepository } from "@/repository/business-member.repository";
import { createSupabaseBrowserClient } from "@/supabase/client";
import type { Profile } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useProfilesByIdsQuery(
  userIds: string[],
  options?: Omit<UseQueryOptions<Profile[], Error>, "queryKey" | "queryFn">,
) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))].sort();

  return useQuery({
    queryKey: queryKeys.profiles.byIds(uniqueIds),
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const profiles = new ProfileRepository(supabase);
      return profiles.findByIds(uniqueIds);
    },
    enabled: isSupabaseConfigured() && uniqueIds.length > 0,
    ...options,
  });
}
