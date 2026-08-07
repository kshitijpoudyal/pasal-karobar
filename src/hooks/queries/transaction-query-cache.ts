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

/** Keep activity lists and dashboard charts in sync after writes. */
export async function syncAfterTransactionChange(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.transactions.all,
  });
  await queryClient.refetchQueries({
    queryKey: queryKeys.dashboard.all,
    type: "all",
  });
}

/** Manual refresh from Dashboard (same invalidation path as after entry edits). */
export async function refreshBusinessStats(
  queryClient: QueryClient,
): Promise<void> {
  await syncAfterTransactionChange(queryClient);
}
