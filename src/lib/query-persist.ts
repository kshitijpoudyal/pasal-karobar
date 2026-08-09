import type { Query } from "@tanstack/react-query";

const PERSISTED_QUERY_ROOTS = new Set([
  "business",
  "service-catalog",
  "expense-category",
  "transactions",
]);

export function shouldPersistQuery(query: Query): boolean {
  const root = query.queryKey[0];
  return typeof root === "string" && PERSISTED_QUERY_ROOTS.has(root);
}

export const QUERY_PERSIST_KEY = "pasal-karobar-query-cache";
export const QUERY_PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
