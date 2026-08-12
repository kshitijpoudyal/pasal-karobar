import type { CreateTransactionInput } from "@/services/schemas";
import type { Transaction } from "@/types/database";

export const PENDING_SYNC_ID_PREFIX = "pending-sync:";
export const PENDING_CUSTOMER_ID_PREFIX = "pending-customer:";

export function isPendingSyncTransactionId(id: string): boolean {
  return id.startsWith(PENDING_SYNC_ID_PREFIX);
}

export function isPendingCustomerId(id: string): boolean {
  return id.startsWith(PENDING_CUSTOMER_ID_PREFIX);
}

export function pendingCustomerId(normalizedPhone: string): string {
  return `${PENDING_CUSTOMER_ID_PREFIX}${normalizedPhone}`;
}

export function pendingCustomerPhoneFromId(customerId: string): string | null {
  if (!isPendingCustomerId(customerId)) return null;
  return customerId.slice(PENDING_CUSTOMER_ID_PREFIX.length);
}

export function pendingSyncClientId(transactionId: string): string | null {
  if (!isPendingSyncTransactionId(transactionId)) return null;
  return transactionId.slice(PENDING_SYNC_ID_PREFIX.length);
}

export function pendingSyncTransactionId(clientId: string): string {
  return `${PENDING_SYNC_ID_PREFIX}${clientId}`;
}

export function buildPendingTransaction(
  clientId: string,
  businessId: string,
  input: CreateTransactionInput,
  options?: { customerId?: string | null; recordedByUserId?: string | null },
): Transaction {
  const now = new Date().toISOString();
  return {
    id: pendingSyncTransactionId(clientId),
    business_id: businessId,
    type: input.type,
    service_id: input.type === "INCOME" ? input.service_id : null,
    expense_category_id: input.type === "EXPENSE" ? input.expense_category_id : null,
    customer_id: options?.customerId ?? null,
    recorded_by_user_id: options?.recordedByUserId ?? null,
    subtotal: input.subtotal,
    tip: input.type === "INCOME" ? (input.tip ?? 0) : 0,
    total: input.total,
    payment_method: input.payment_method,
    note: input.note ?? null,
    transaction_date: input.transaction_date,
    created_at: now,
    updated_at: now,
  };
}

export function isBrowserOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/** True when saves should go to the local outbox instead of Supabase. */
export function shouldQueueTransactionOffline(appOnline?: boolean): boolean {
  if (appOnline === false) return true;
  return !isBrowserOnline();
}
