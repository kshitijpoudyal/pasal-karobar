"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getClientAppServices } from "@/services/client";
import type { CreateBusinessInput, UpdateBusinessInput } from "@/services/schemas";
import type { Business } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useBusinessListQuery(
  options?: Omit<UseQueryOptions<Business[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.business.list(),
    queryFn: () => getClientAppServices().business.listForCurrentUser(),
    enabled: isSupabaseConfigured(),
    ...options,
  });
}

export function useBusinessQuery(
  businessId: string,
  options?: Omit<UseQueryOptions<Business | null, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.business.detail(businessId),
    queryFn: () => getClientAppServices().business.getById(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBusinessInput) =>
      getClientAppServices().business.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.business.all });
    },
  });
}

export function useUpdateBusinessMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBusinessInput) =>
      getClientAppServices().business.update(businessId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.business.all });
    },
  });
}

export function useDeleteBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessId: string) =>
      getClientAppServices().business.delete(businessId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.business.all });
    },
  });
}
