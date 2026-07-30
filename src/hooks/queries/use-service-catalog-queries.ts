"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getClientAppServices } from "@/services/client";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "@/services/schemas";
import type { ServiceRecord } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useServiceCatalogQuery(
  businessId: string,
  options?: Omit<
    UseQueryOptions<ServiceRecord[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.serviceCatalog.list(businessId),
    queryFn: () =>
      getClientAppServices().serviceCatalog.listByBusinessId(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useCreateServiceMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceInput) =>
      getClientAppServices().serviceCatalog.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.serviceCatalog.list(businessId),
      });
    },
  });
}

export function useUpdateServiceMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      input,
    }: {
      serviceId: string;
      input: UpdateServiceInput;
    }) => getClientAppServices().serviceCatalog.update(serviceId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.serviceCatalog.list(businessId),
      });
    },
  });
}

export function useDeleteServiceMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) =>
      getClientAppServices().serviceCatalog.delete(serviceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.serviceCatalog.list(businessId),
      });
    },
  });
}
