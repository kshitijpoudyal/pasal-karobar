import type { ServiceRecord, Transaction } from "@/types/database";

export function resolveIncomeServiceIds(
  tx: Transaction,
  services: ServiceRecord[],
): string[] {
  if (!tx.service_id) return [];

  const note = tx.note?.trim();
  if (note?.includes(" + ")) {
    const names = note.split(" + ").map((part) => part.trim());
    const ids = names
      .map((name) => services.find((service) => service.name === name)?.id)
      .filter((id): id is string => Boolean(id));
    if (ids.length > 0) return ids;
  }

  return [tx.service_id];
}
