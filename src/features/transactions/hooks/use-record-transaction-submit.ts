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

function allocateIncomeSubtotals(
  serviceIds: string[],
  combinedSubtotal: number,
  defaultPriceByServiceId: Map<string, number>,
): number[] {
  if (serviceIds.length === 0) return [];
  if (serviceIds.length === 1) return [combinedSubtotal];

  const defaults = serviceIds.map(
    (id) => defaultPriceByServiceId.get(id) ?? 0,
  );
  const autoSum = defaults.reduce((sum, value) => sum + value, 0);
  if (autoSum <= 0) {
    const even = Math.floor(combinedSubtotal / serviceIds.length);
    let remainder = combinedSubtotal - even * serviceIds.length;
    return serviceIds.map((_, index) =>
      index === 0 ? even + remainder : even,
    );
  }

  let allocated = 0;
  return serviceIds.map((id, index) => {
    if (index === serviceIds.length - 1) {
      return combinedSubtotal - allocated;
    }
    const share = Math.round(
      (combinedSubtotal * (defaultPriceByServiceId.get(id) ?? 0)) / autoSum,
    );
    allocated += share;
    return share;
  });
}

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
    serviceIds: string[];
    subtotal: number;
    tip: number;
    payment: UiPaymentMethod;
    customerPhone?: string;
  }) {
    const tip = input.tip || 0;
    const combinedSubtotal = input.subtotal;
    const priceById = new Map(
      (servicesQuery.data ?? []).map((service) => [
        service.id,
        Number(service.default_price),
      ]),
    );
    const subtotals = allocateIncomeSubtotals(
      input.serviceIds,
      combinedSubtotal,
      priceById,
    );
    const queuedOffline = shouldQueueOffline();
    const transactionDate = new Date().toISOString();
    const paymentMethod = uiPaymentToDb(input.payment);
    const customerPhone = input.customerPhone?.trim();

    for (let index = 0; index < input.serviceIds.length; index++) {
      const serviceId = input.serviceIds[index]!;
      const rowSubtotal = subtotals[index] ?? 0;
      const rowTip = index === 0 ? tip : 0;
      const payload = createTransactionSchema.parse({
        business_id: businessId,
        type: "INCOME",
        service_id: serviceId,
        subtotal: rowSubtotal,
        tip: rowTip,
        total: rowSubtotal + rowTip,
        payment_method: paymentMethod,
        transaction_date: transactionDate,
        ...(customerPhone ? { customer_phone: customerPhone } : {}),
      } satisfies CreateTransactionInput);
      const offlineClientId = queuedOffline ? crypto.randomUUID() : undefined;
      await createMutation.mutateAsync({ ...payload, offlineClientId });
    }

    toast({
      title: "Entry added",
      description: queuedOffline
        ? "Saved on this device — will sync when you're back online."
        : input.serviceIds.length > 1
          ? `${input.serviceIds.length} income entries recorded.`
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
        serviceIds: z.array(z.string().uuid()).min(1),
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
