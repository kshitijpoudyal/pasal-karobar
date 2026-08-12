"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { BusinessMemberRepository, ProfileRepository } from "@/repository/business-member.repository";
import { createSupabaseBrowserClient } from "@/supabase/client";
import type { BusinessMember, Profile } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export type ActiveMemberRow = {
  member: BusinessMember;
  profile: Profile | null;
};

export function useActiveMemberQuery(
  businessId: string,
  userId: string,
  options?: Omit<
    UseQueryOptions<ActiveMemberRow | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.members.active(businessId, userId),
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const members = new BusinessMemberRepository(supabase);
      const profiles = new ProfileRepository(supabase);
      const member = await members.findForUserAndBusiness(businessId, userId);
      if (!member) return null;
      const profile = await profiles.findById(userId);
      return { member, profile };
    },
    enabled: isSupabaseConfigured() && Boolean(businessId && userId),
    ...options,
  });
}
