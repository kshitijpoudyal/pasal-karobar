import type { Transaction } from "@/types/database";

export function groupTransactionsByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = tx.transaction_date.slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}
