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
  replaceTransactionInListCaches,
  restoreTransactionListSnapshots,
  scheduleAfterTransactionChange,
  snapshotTransactionLists,
} from "@/hooks/queries/transaction-query-cache";
import { enqueueOutboxEntry, type OutboxEntry } from "@/offline/outbox-store";
import { notifyOutboxChanged } from "@/offline/outbox-events";
import {
  buildPendingTransaction,
  isBrowserOnline,
  isPendingSyncTransactionId,
  pendingSyncTransactionId,
} from "@/offline/pending-transaction";
import type { IncomeSummaryRow } from "@/repository/transaction.repository";
import type { TransactionListFilters } from "@/repository";
import { getClientAppServices } from "@/services/client";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/services/schemas";
import type { Transaction } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";
import { useActiveMember } from "@/providers/active-member-provider";

export type CreateTransactionMutationVariables = CreateTransactionInput & {
  offlineClientId?: string;
  optimisticCustomerId?: string | null;
  offlineCustomerName?: string;
};

function stripOfflineMeta(
  input: CreateTransactionMutationVariables,
): CreateTransactionInput {
  const {
    offlineClientId: _offlineClientId,
    optimisticCustomerId: _optimisticCustomerId,
    offlineCustomerName: _offlineCustomerName,
    ...payload
  } = input;
  return payload;
}

function shouldQueueOffline(input: CreateTransactionMutationVariables): boolean {
  return Boolean(input.offlineClientId) || !isBrowserOnline();
}

function resolveOfflineClientId(input: CreateTransactionMutationVariables): string {
  return input.offlineClientId ?? crypto.randomUUID();
}

export function useTransactionsQuery(
  businessId: string,
  filters?: TransactionListFilters,
  options?: Omit<UseQueryOptions<Transaction[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.transactions.list(businessId, filters),
    queryFn: () =>
      getClientAppServices().transaction.listByBusinessId(businessId, filters),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useIncomeSummaryQuery(
  businessId: string,
  options?: Omit<UseQueryOptions<IncomeSummaryRow[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: queryKeys.transactions.incomeSummary(businessId),
    queryFn: () =>
      getClientAppServices().transaction.listIncomeSummaryByBusinessId(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useTransactionQuery(
  transactionId: string,
  options?: Omit<UseQueryOptions<Transaction | null, Error>, "queryKey" | "queryFn">,
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
  const { userId } = useActiveMember();

  return useMutation({
    networkMode: "always",
    mutationFn: async (input: CreateTransactionMutationVariables) => {
      const payload = stripOfflineMeta(input);
      if (shouldQueueOffline(input)) {
        const clientId = resolveOfflineClientId(input);
        const entry: OutboxEntry = {
          clientId,
          businessId: payload.business_id,
          payload,
          createdAt: new Date().toISOString(),
          status: "pending",
          recordedByUserId: userId || null,
          ...(input.offlineCustomerName
            ? { customerName: input.offlineCustomerName }
            : {}),
          ...(input.optimisticCustomerId !== undefined
            ? { optimisticCustomerId: input.optimisticCustomerId }
            : {}),
        };
        await enqueueOutboxEntry(entry);
        notifyOutboxChanged();
        return buildPendingTransaction(clientId, businessId, payload, {
          customerId: input.optimisticCustomerId ?? null,
          recordedByUserId: userId || null,
        });
      }
      return getClientAppServices().transaction.create(payload);
    },
    onMutate: async (input) => {
      const payload = stripOfflineMeta(input);
      void queryClient.cancelQueries({ queryKey: queryKeys.transactions.all });
      const previousLists = snapshotTransactionLists(queryClient, businessId);

      const queueOffline = shouldQueueOffline(input);
      const clientId = queueOffline ? resolveOfflineClientId(input) : undefined;
      const optimisticId = clientId
        ? pendingSyncTransactionId(clientId)
        : `optimistic-${Date.now()}`;

      const optimistic: Transaction = {
        id: optimisticId,
        business_id: businessId,
        type: payload.type,
        service_id: payload.type === "INCOME" ? payload.service_id : null,
        expense_category_id:
          payload.type === "EXPENSE" ? payload.expense_category_id : null,
        customer_id: input.optimisticCustomerId ?? null,
        recorded_by_user_id: userId || null,
        subtotal: payload.subtotal,
        tip: payload.type === "INCOME" ? (payload.tip ?? 0) : 0,
        total: payload.total,
        payment_method: payload.payment_method,
        note: payload.note ?? null,
        transaction_date: payload.transaction_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueriesData<Transaction[]>(
        {
          queryKey: queryKeys.transactions.all,
          predicate: (query) =>
            query.queryKey[0] === queryKeys.transactions.all[0] &&
            query.queryKey[1] === "list" &&
            query.queryKey[2] === businessId,
        },
        (current) => (current ? [optimistic, ...current] : [optimistic]),
      );

      if (input.optimisticCustomerId && input.offlineCustomerName?.trim()) {
        queryClient.setQueryData<Record<string, string>>(
          queryKeys.customers.pendingLabels(businessId),
          (current) => ({
            ...current,
            [input.optimisticCustomerId!]: input.offlineCustomerName!.trim(),
          }),
        );
      }

      return { previousLists, offlineClientId: clientId, optimisticId };
    },
    onError: (_error, input, context) => {
      if (context?.previousLists) {
        restoreTransactionListSnapshots(queryClient, context.previousLists);
      }
      if (shouldQueueOffline(input)) {
        notifyOutboxChanged();
      }
    },
    onSuccess: (data, _input, context) => {
      if (isPendingSyncTransactionId(data.id)) {
        notifyOutboxChanged();
        return;
      }
      if (context?.optimisticId) {
        replaceTransactionInListCaches(
          queryClient,
          businessId,
          context.optimisticId,
          data,
        );
      }
      scheduleAfterTransactionChange(queryClient);
    },
  });
}

export function useUpdateTransactionMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      input,
    }: {
      transactionId: string;
      input: UpdateTransactionInput;
    }) => getClientAppServices().transaction.update(transactionId, input),
    onSuccess: async () => {
      scheduleAfterTransactionChange(queryClient);
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
    onSettled: () => {
      scheduleAfterTransactionChange(queryClient);
    },
  });
}
