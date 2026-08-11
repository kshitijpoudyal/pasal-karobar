import type { Transaction } from "@/types/database";

export function buildCombinedServiceTitle(
  serviceIds: string[],
  serviceNames: Map<string, string>,
): string {
  return serviceIds
    .map((id) => serviceNames.get(id))
    .filter((name): name is string => Boolean(name))
    .join(" + ");
}

export function incomeTransactionTitle(
  tx: Transaction,
  serviceNames: Map<string, string>,
): string {
  if (tx.note?.trim()) return tx.note.trim();
  const name = tx.service_id ? serviceNames.get(tx.service_id) : undefined;
  return name ?? "Income";
}
