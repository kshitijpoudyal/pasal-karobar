import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { Transaction } from "@/types/database";

type TransactionListSnapshot = [QueryKey, Transaction[] | undefined];

function isBusinessTransactionListQuery(
  queryKey: QueryKey,
  businessId: string,
): boolean {
  return (
    queryKey[0] === queryKeys.transactions.all[0] &&
    queryKey[1] === "list" &&
    queryKey[2] === businessId
  );
}

export function snapshotTransactionLists(
  queryClient: QueryClient,
  businessId: string,
): TransactionListSnapshot[] {
  return queryClient.getQueriesData<Transaction[]>({
    queryKey: queryKeys.transactions.all,
    predicate: (query) => isBusinessTransactionListQuery(query.queryKey, businessId),
  });
}

export function restoreTransactionListSnapshots(
  queryClient: QueryClient,
  snapshots: TransactionListSnapshot[],
): void {
  for (const [key, data] of snapshots) {
    queryClient.setQueryData(key, data);
  }
}

export function removeTransactionFromListCaches(
  queryClient: QueryClient,
  businessId: string,
  transactionId: string,
): void {
  queryClient.setQueriesData<Transaction[]>(
    {
      queryKey: queryKeys.transactions.all,
      predicate: (query) => isBusinessTransactionListQuery(query.queryKey, businessId),
    },
    (current) => current?.filter((tx) => tx.id !== transactionId),
  );
}

export function replaceTransactionInListCaches(
  queryClient: QueryClient,
  businessId: string,
  previousId: string,
  serverTx: Transaction,
): void {
  queryClient.setQueriesData<Transaction[]>(
    {
      queryKey: queryKeys.transactions.all,
      predicate: (query) => isBusinessTransactionListQuery(query.queryKey, businessId),
    },
    (current) => {
      if (!current) return [serverTx];
      let replaced = false;
      const next = current.map((tx) => {
        if (tx.id !== previousId) return tx;
        replaced = true;
        return serverTx;
      });
      return replaced ? next : [serverTx, ...current];
    },
  );
}

/**
 * Mark dependent queries stale and refetch in the background (never await from save paths).
 */
export function scheduleAfterTransactionChange(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

/** @deprecated Prefer scheduleAfterTransactionChange for non-blocking updates. */
export async function syncAfterTransactionChange(
  queryClient: QueryClient,
): Promise<void> {
  scheduleAfterTransactionChange(queryClient);
}

/** Manual refresh from Dashboard (same invalidation path as after entry edits). */
export async function refreshBusinessStats(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.refetchQueries({
    queryKey: queryKeys.dashboard.all,
    type: "active",
  });
  scheduleAfterTransactionChange(queryClient);
}
