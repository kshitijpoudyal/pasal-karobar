"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStaffMember,
  listStaffMembers,
  removeStaffMember,
  type CreateStaffMemberInput,
  type StaffMemberView,
} from "@/actions/staff-members";
import { queryKeys } from "@/constants/query-keys";
import { isSupabaseConfigured } from "@/utils/env";

export function useStaffMembersQuery(
  businessId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.staff.list(businessId),
    queryFn: () => listStaffMembers(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId) && enabled,
  });
}

export function useCreateStaffMemberMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateStaffMemberInput, "businessId">) =>
      createStaffMember({ ...input, businessId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.staff.list(businessId),
      });
    },
  });
}

export function useRemoveStaffMemberMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeStaffMember(businessId, memberId),
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.staff.list(businessId) });
      const previous = queryClient.getQueryData<StaffMemberView[]>(
        queryKeys.staff.list(businessId),
      );
      queryClient.setQueryData<StaffMemberView[]>(
        queryKeys.staff.list(businessId),
        (current) => current?.filter((row) => row.id !== memberId) ?? [],
      );
      return { previous };
    },
    onError: (_error, _memberId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.staff.list(businessId), context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.staff.list(businessId),
      });
    },
  });
}
