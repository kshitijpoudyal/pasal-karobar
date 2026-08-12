import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { scheduleAfterTransactionChange } from "@/hooks/queries/transaction-query-cache";
import {
  listOutboxEntries,
  listPendingOutboxEntries,
  markOutboxEntryFailed,
  removeOutboxEntry,
  resetOutboxEntryToPending,
  type OutboxEntry,
} from "@/offline/outbox-store";
import {
  buildPendingTransaction,
  isPendingSyncTransactionId,
  pendingCustomerId,
  pendingSyncTransactionId,
} from "@/offline/pending-transaction";
import { getClientAppServices } from "@/services/client";
import type { Transaction } from "@/types/database";
import { parseOptionalNepalPhone } from "@/utils/phone-np";

function upsertPendingInListCaches(
  queryClient: QueryClient,
  businessId: string,
  transaction: Transaction,
): void {
  queryClient.setQueriesData<Transaction[]>(
    {
      queryKey: queryKeys.transactions.all,
      predicate: (query) =>
        query.queryKey[0] === queryKeys.transactions.all[0] &&
        query.queryKey[1] === "list" &&
        query.queryKey[2] === businessId,
    },
    (current) => {
      if (!current) return [transaction];
      const without = current.filter((tx) => tx.id !== transaction.id);
      return [transaction, ...without];
    },
  );
}

function replacePendingWithServerTransaction(
  queryClient: QueryClient,
  businessId: string,
  clientId: string,
  serverTx: Transaction,
): void {
  const pendingId = pendingSyncTransactionId(clientId);
  queryClient.setQueriesData<Transaction[]>(
    {
      queryKey: queryKeys.transactions.all,
      predicate: (query) =>
        query.queryKey[0] === queryKeys.transactions.all[0] &&
        query.queryKey[1] === "list" &&
        query.queryKey[2] === businessId,
    },
    (current) => {
      if (!current) return [serverTx];
      const filtered = current.filter(
        (tx) => tx.id !== pendingId && tx.id !== serverTx.id,
      );
      return [serverTx, ...filtered];
    },
  );
}

function resolvePendingCustomerId(entry: OutboxEntry): string | null {
  if (entry.optimisticCustomerId !== undefined) {
    return entry.optimisticCustomerId;
  }
  if (entry.payload.type !== "INCOME" || !entry.payload.customer_phone) {
    return null;
  }
  const parsed = parseOptionalNepalPhone(entry.payload.customer_phone);
  if (!("normalized" in parsed)) return null;
  return pendingCustomerId(parsed.normalized);
}

export async function mergeOutboxIntoTransactionCaches(
  queryClient: QueryClient,
  businessId: string,
): Promise<void> {
  const entries = await listPendingOutboxEntries(businessId);
  const pendingLabels: Record<string, string> = {};

  for (const entry of entries) {
    const customerId = resolvePendingCustomerId(entry);
    const tx = buildPendingTransaction(
      entry.clientId,
      entry.businessId,
      entry.payload,
      {
        customerId,
        recordedByUserId: entry.recordedByUserId ?? null,
      },
    );
    upsertPendingInListCaches(queryClient, businessId, tx);

    if (customerId && entry.customerName?.trim()) {
      pendingLabels[customerId] = entry.customerName.trim();
    }
  }

  if (Object.keys(pendingLabels).length > 0) {
    queryClient.setQueryData<Record<string, string>>(
      queryKeys.customers.pendingLabels(businessId),
      pendingLabels,
    );
  }
}

export type SyncOutboxResult = {
  synced: number;
  failed: number;
  lastError: string | null;
};

export async function syncOutboxForBusiness(
  queryClient: QueryClient,
  businessId: string,
): Promise<SyncOutboxResult> {
  const entries = await listOutboxEntries();
  const queue = entries.filter(
    (entry) =>
      entry.businessId === businessId &&
      (entry.status === "pending" || entry.status === "failed"),
  );

  let synced = 0;
  let failed = 0;
  let lastError: string | null = null;

  for (const entry of queue) {
    if (entry.status === "failed") {
      await resetOutboxEntryToPending(entry.clientId);
    }

    try {
      const serverTx = await getClientAppServices().transaction.create(entry.payload);
      if (
        entry.customerName &&
        entry.payload.type === "INCOME" &&
        entry.payload.customer_phone
      ) {
        await getClientAppServices().customer.applyNameForNormalizedPhone(
          entry.businessId,
          entry.payload.customer_phone,
          entry.customerName,
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.customers.list(entry.businessId),
        });
      }
      await removeOutboxEntry(entry.clientId);
      replacePendingWithServerTransaction(
        queryClient,
        businessId,
        entry.clientId,
        serverTx,
      );
      synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sync entry.";
      await markOutboxEntryFailed(entry.clientId, message);
      failed += 1;
      lastError = message;
    }
  }

  if (synced > 0) {
    scheduleAfterTransactionChange(queryClient);
  }

  return { synced, failed, lastError };
}

export function stripPendingFromTransactionLists(
  queryClient: QueryClient,
  businessId: string,
): void {
  queryClient.setQueriesData<Transaction[]>(
    {
      queryKey: queryKeys.transactions.all,
      predicate: (query) =>
        query.queryKey[0] === queryKeys.transactions.all[0] &&
        query.queryKey[1] === "list" &&
        query.queryKey[2] === businessId,
    },
    (current) => current?.filter((tx) => !isPendingSyncTransactionId(tx.id)),
  );
}

export type { OutboxEntry };
