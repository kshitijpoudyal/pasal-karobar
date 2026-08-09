"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { scheduleAfterTransactionChange } from "@/hooks/queries/transaction-query-cache";
import { getClientAppServices } from "@/services/client";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/services/schemas";
import type { Customer } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useCustomersQuery(
  businessId: string,
  options?: Omit<UseQueryOptions<Customer[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.customers.list(businessId),
    queryFn: () => getClientAppServices().customer.listByBusinessId(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useCustomerQuery(
  customerId: string,
  options?: Omit<
    UseQueryOptions<Customer | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.customers.detail(customerId),
    queryFn: () => getClientAppServices().customer.getById(customerId),
    enabled: isSupabaseConfigured() && Boolean(customerId),
    ...options,
  });
}

export function useCreateCustomerMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) =>
      getClientAppServices().customer.create(businessId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.list(businessId),
      });
    },
  });
}

export function useUpdateCustomerMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      input,
    }: {
      customerId: string;
      input: UpdateCustomerInput;
    }) => getClientAppServices().customer.update(customerId, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customers.list(businessId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customers.detail(variables.customerId),
      });
    },
  });
}

export async function syncAfterCustomerLinkedTransaction(
  queryClient: ReturnType<typeof useQueryClient>,
  _businessId: string,
): Promise<void> {
  scheduleAfterTransactionChange(queryClient);
}
