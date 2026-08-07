"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  removeTransactionFromListCaches,
  restoreTransactionListSnapshots,
  snapshotTransactionLists,
  syncAfterTransactionChange,
} from "@/hooks/queries/transaction-query-cache";
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
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all });
      const listKey = queryKeys.transactions.list(businessId);
      const previous = queryClient.getQueryData<Transaction[]>(listKey);

      const optimistic: Transaction = {
        id: `optimistic-${Date.now()}`,
        business_id: businessId,
        type: input.type,
        service_id: input.type === "INCOME" ? input.service_id : null,
        expense_category_id:
          input.type === "EXPENSE" ? input.expense_category_id : null,
        subtotal: input.subtotal,
        tip: input.type === "INCOME" ? (input.tip ?? 0) : 0,
        total: input.total,
        payment_method: input.payment_method,
        note: input.note ?? null,
        transaction_date: input.transaction_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Transaction[]>(listKey, (current) =>
        current ? [optimistic, ...current] : [optimistic],
      );

      return { previous, listKey };
    },
    onError: (_error, _input, context) => {
      if (context?.listKey && context.previous) {
        queryClient.setQueryData(context.listKey, context.previous);
      }
    },
    onSettled: async () => {
      await syncAfterTransactionChange(queryClient);
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
      await syncAfterTransactionChange(queryClient);
    },
  });
}

export function useDeleteTransactionMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) =>
      getClientAppServices().transaction.delete(transactionId),
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all });
      const snapshots = snapshotTransactionLists(queryClient, businessId);
      removeTransactionFromListCaches(queryClient, businessId, transactionId);
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      if (context?.snapshots) {
        restoreTransactionListSnapshots(queryClient, context.snapshots);
      }
    },
    onSettled: async () => {
      await syncAfterTransactionChange(queryClient);
    },
  });
}
