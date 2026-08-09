"use client";

import { z } from "zod";

import { toast } from "@/components/toast";
import { useCreateTransactionMutation } from "@/hooks/queries/use-transaction-queries";
import { useExpenseCategoriesQuery } from "@/hooks/queries/use-expense-category-queries";
import { useServiceCatalogQuery } from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useConnectivity } from "@/providers/connectivity-provider";
import { createTransactionSchema, type CreateTransactionInput } from "@/services/schemas";
import { shouldQueueTransactionOffline } from "@/offline/pending-transaction";
import { uiPaymentToDb, type UiPaymentMethod } from "@/utils/payment-method";

export function useRecordTransactionSubmit(onSuccess: () => void) {
  const { businessId } = useActiveBusiness();
  const { isOnline: appOnline } = useConnectivity();
  const servicesQuery = useServiceCatalogQuery(businessId);
  const categoriesQuery = useExpenseCategoriesQuery(businessId);
  const createMutation = useCreateTransactionMutation(businessId);

  function shouldQueueOffline(): boolean {
    return shouldQueueTransactionOffline(appOnline);
  }

  async function submitIncome(input: {
    serviceId: string;
    subtotal: number;
    tip: number;
    payment: UiPaymentMethod;
    customerPhone?: string;
  }) {
    const tip = input.tip || 0;
    const payload = createTransactionSchema.parse({
      business_id: businessId,
      type: "INCOME",
      service_id: input.serviceId,
      subtotal: input.subtotal,
      tip,
      total: input.subtotal + tip,
      payment_method: uiPaymentToDb(input.payment),
      transaction_date: new Date().toISOString(),
      ...(input.customerPhone?.trim()
        ? { customer_phone: input.customerPhone.trim() }
        : {}),
    } satisfies CreateTransactionInput);
    const queuedOffline = shouldQueueOffline();
    const offlineClientId = queuedOffline ? crypto.randomUUID() : undefined;

    await createMutation.mutateAsync({ ...payload, offlineClientId });
    toast({
      title: "Entry added",
      description: queuedOffline
        ? "Saved on this device — will sync when you're back online."
        : "Income recorded successfully.",
    });
    onSuccess();
  }

  async function submitExpense(input: {
    expenseCategoryId: string;
    amount: number;
    note?: string;
    payment: UiPaymentMethod;
  }) {
    const payload = createTransactionSchema.parse({
      business_id: businessId,
      type: "EXPENSE",
      expense_category_id: input.expenseCategoryId,
      subtotal: input.amount,
      total: input.amount,
      payment_method: uiPaymentToDb(input.payment),
      note: input.note ?? null,
      transaction_date: new Date().toISOString(),
    } satisfies CreateTransactionInput);
    const queuedOffline = shouldQueueOffline();
    const offlineClientId = queuedOffline ? crypto.randomUUID() : undefined;

    await createMutation.mutateAsync({ ...payload, offlineClientId });
    toast({
      title: "Entry added",
      description: queuedOffline
        ? "Saved on this device — will sync when you're back online."
        : "Expense recorded successfully.",
    });
    onSuccess();
  }

  function resolveCategoryIdByName(name: string): string | undefined {
    const normalized = name.toLowerCase();
    return categoriesQuery.data?.find(
      (c) => c.name.toLowerCase() === normalized,
    )?.id;
  }

  function validateIncome(input: unknown) {
    return z
      .object({
        serviceId: z.string().uuid(),
        subtotal: z.number().positive(),
        tip: z.number().nonnegative(),
        payment: z.string(),
      })
      .safeParse(input);
  }

  return {
    businessId,
    servicesQuery,
    categoriesQuery,
    createMutation,
    submitIncome,
    submitExpense,
    resolveCategoryIdByName,
    validateIncome,
  };
}
