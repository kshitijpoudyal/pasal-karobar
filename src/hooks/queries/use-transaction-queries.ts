"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { TransactionListFilters } from "@/repository";
import { getClientAppServices } from "@/services/client";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/services/schemas";
import type { Transaction } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useTransactionsQuery(
  businessId: string,
  filters?: TransactionListFilters,
  options?: Omit<
    UseQueryOptions<Transaction[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.transactions.list(businessId, filters),
    queryFn: () =>
      getClientAppServices().transaction.listByBusinessId(businessId, filters),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useTransactionQuery(
  transactionId: string,
  options?: Omit<
    UseQueryOptions<Transaction | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId),
    queryFn: () => getClientAppServices().transaction.getById(transactionId),
    enabled: isSupabaseConfigured() && Boolean(transactionId),
    ...options,
  });
}

export function useCreateTransactionMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      getClientAppServices().transaction.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary(businessId),
      });
    },
  });
}

export function useUpdateTransactionMutation(
  businessId: string,
  transactionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTransactionInput) =>
      getClientAppServices().transaction.update(transactionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary(businessId),
      });
    },
  });
}

export function useDeleteTransactionMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) =>
      getClientAppServices().transaction.delete(transactionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary(businessId),
      });
    },
  });
}
