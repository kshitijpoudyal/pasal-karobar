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
  pendingSyncTransactionId,
} from "@/offline/pending-transaction";
import { getClientAppServices } from "@/services/client";
import type { Transaction } from "@/types/database";

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

export async function mergeOutboxIntoTransactionCaches(
  queryClient: QueryClient,
  businessId: string,
): Promise<void> {
  const entries = await listPendingOutboxEntries(businessId);
  for (const entry of entries) {
    const tx = buildPendingTransaction(
      entry.clientId,
      entry.businessId,
      entry.payload,
    );
    upsertPendingInListCaches(queryClient, businessId, tx);
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
      const serverTx = await getClientAppServices().transaction.create(
        entry.payload,
      );
      await removeOutboxEntry(entry.clientId);
      replacePendingWithServerTransaction(
        queryClient,
        businessId,
        entry.clientId,
        serverTx,
      );
      synced += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sync entry.";
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
