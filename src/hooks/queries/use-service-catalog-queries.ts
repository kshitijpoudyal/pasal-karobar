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
  const listKey = queryKeys.serviceCatalog.list(businessId);

  return useMutation({
    mutationFn: (serviceId: string) => {
      if (!businessId) {
        throw new Error("No business selected.");
      }
      return getClientAppServices().serviceCatalog.delete(serviceId, businessId);
    },
    onMutate: async (serviceId) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<ServiceRecord[]>(listKey);
      queryClient.setQueryData<ServiceRecord[]>(listKey, (current) =>
        current?.filter((service) => service.id !== serviceId),
      );
      return { previous };
    },
    onError: (_error, _serviceId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}
