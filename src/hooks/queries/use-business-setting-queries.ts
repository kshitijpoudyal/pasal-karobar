"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getClientAppServices } from "@/services/client";
import type { UpsertBusinessSettingInput } from "@/services/schemas";
import type { BusinessSetting } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useBusinessSettingsQuery(
  businessId: string,
  options?: Omit<
    UseQueryOptions<BusinessSetting[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.businessSettings.list(businessId),
    queryFn: () =>
      getClientAppServices().businessSetting.listByBusinessId(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useBusinessSettingQuery(
  businessId: string,
  settingKey: string,
  options?: Omit<
    UseQueryOptions<BusinessSetting | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.businessSettings.detail(businessId, settingKey),
    queryFn: () =>
      getClientAppServices().businessSetting.get(businessId, settingKey),
    enabled:
      isSupabaseConfigured() && Boolean(businessId) && Boolean(settingKey),
    ...options,
  });
}

export function useUpsertBusinessSettingMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertBusinessSettingInput) =>
      getClientAppServices().businessSetting.upsert(input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.businessSettings.list(businessId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.businessSettings.detail(
          businessId,
          variables.setting_key,
        ),
      });
    },
  });
}

export function useDeleteBusinessSettingMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settingKey: string) =>
      getClientAppServices().businessSetting.delete(businessId, settingKey),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.businessSettings.list(businessId),
      });
    },
  });
}
