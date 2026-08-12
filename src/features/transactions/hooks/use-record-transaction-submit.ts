"use client";

import { z } from "zod";

import { toast } from "@/components/toast";
import { queryKeys } from "@/constants/query-keys";
import { useCreateTransactionMutation } from "@/hooks/queries/use-transaction-queries";
import { useExpenseCategoriesQuery } from "@/hooks/queries/use-expense-category-queries";
import { useServiceCatalogQuery } from "@/hooks/queries/use-service-catalog-queries";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useConnectivity } from "@/providers/connectivity-provider";
import { getClientAppServices } from "@/services/client";
import { buildCombinedServiceTitle } from "@/features/transactions/utils/income-entry-title";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/services/schemas";
import type { PaymentMethod } from "@/types/database";
import {
  pendingCustomerId,
  shouldQueueTransactionOffline,
} from "@/offline/pending-transaction";
import { useQueryClient } from "@tanstack/react-query";
import { parseOptionalNepalPhone } from "@/utils/phone-np";

export function useRecordTransactionSubmit(onSuccess: () => void) {
  const { businessId } = useActiveBusiness();
  const { isOnline: appOnline } = useConnectivity();
  const queryClient = useQueryClient();
  const servicesQuery = useServiceCatalogQuery(businessId);
  const categoriesQuery = useExpenseCategoriesQuery(businessId);
  const customersQuery = useCustomersQuery(businessId);
  const createMutation = useCreateTransactionMutation(businessId);

  function resolveOptimisticCustomerId(phoneRaw?: string): string | null {
    const parsed = parseOptionalNepalPhone(phoneRaw);
    if (!("normalized" in parsed)) return null;

    const { normalized } = parsed;
    const existing = (customersQuery.data ?? []).find(
      (customer) => customer.phone_normalized === normalized,
    );
    return existing?.id ?? pendingCustomerId(normalized);
  }

  function shouldQueueOffline(): boolean {
    return shouldQueueTransactionOffline(appOnline);
  }

  async function submitIncome(input: {
    serviceIds: string[];
    subtotal: number;
    tip: number;
    payment: PaymentMethod;
    customerPhone?: string;
    customerName?: string;
    saveCustomerName?: boolean;
  }) {
    const tip = input.tip || 0;
    const combinedSubtotal = input.subtotal;
    const serviceNames = new Map(
      (servicesQuery.data ?? []).map((service) => [service.id, service.name]),
    );
    const primaryServiceId = input.serviceIds[0]!;
    const combinedTitle =
      input.serviceIds.length > 1
        ? buildCombinedServiceTitle(input.serviceIds, serviceNames)
        : undefined;
    const queuedOffline = shouldQueueOffline();
    const transactionDate = new Date().toISOString();
    const paymentMethod = input.payment;
    const customerPhone = input.customerPhone?.trim();

    const payload = createTransactionSchema.parse({
      business_id: businessId,
      type: "INCOME",
      service_id: primaryServiceId,
      subtotal: combinedSubtotal,
      tip,
      total: combinedSubtotal + tip,
      payment_method: paymentMethod,
      transaction_date: transactionDate,
      ...(combinedTitle ? { note: combinedTitle } : {}),
      ...(customerPhone ? { customer_phone: customerPhone } : {}),
    } satisfies CreateTransactionInput);
    const offlineClientId = queuedOffline ? crypto.randomUUID() : undefined;
    const optimisticCustomerId = resolveOptimisticCustomerId(customerPhone);
    const offlineCustomerName =
      input.saveCustomerName && input.customerName?.trim()
        ? input.customerName.trim()
        : undefined;

    await createMutation.mutateAsync({
      ...payload,
      offlineClientId,
      optimisticCustomerId,
      offlineCustomerName,
    });

    if (
      input.saveCustomerName &&
      !queuedOffline &&
      customerPhone &&
      input.customerName?.trim()
    ) {
      await getClientAppServices().customer.applyNameForNormalizedPhone(
        businessId,
        customerPhone,
        input.customerName,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customers.list(businessId),
      });
    }

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
    payment: PaymentMethod;
  }) {
    const payload = createTransactionSchema.parse({
      business_id: businessId,
      type: "EXPENSE",
      expense_category_id: input.expenseCategoryId,
      subtotal: input.amount,
      total: input.amount,
      payment_method: input.payment,
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
    return categoriesQuery.data?.find((c) => c.name.toLowerCase() === normalized)?.id;
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
