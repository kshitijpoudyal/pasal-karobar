"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/toast";
import { queryKeys } from "@/constants/query-keys";
import { removeTransactionFromListCaches } from "@/hooks/queries/transaction-query-cache";
import { useDeleteTransactionMutation } from "@/hooks/queries/use-transaction-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useExpenseCategoriesQuery } from "@/hooks/queries/use-expense-category-queries";
import { useServiceCatalogQuery } from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessDateSettings } from "@/hooks/use-business-date-settings";
import { groupTransactionsByDayWithLabels } from "@/utils/group-transactions-by-day";
import type { TransactionListFilters } from "@/repository";
import { incomeTransactionTitle } from "@/features/transactions/utils/income-entry-title";
import type { Transaction } from "@/types/database";
import { dbPaymentToLabel } from "@/utils/payment-method";
import {
  getActivityDateRange,
  type ActivityCategoryFilter,
  type ActivityTimeframe,
} from "@/utils/date-ranges";
import {
  hasActivitySecondaryFilters,
  type ActivityPaymentFilter,
} from "@/features/activity/constants";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";
import { notifyOutboxChanged } from "@/offline/outbox-events";
import { removeOutboxEntry } from "@/offline/outbox-store";
import {
  isPendingCustomerId,
  isPendingSyncTransactionId,
  pendingCustomerPhoneFromId,
  pendingSyncClientId,
} from "@/offline/pending-transaction";

function titleForSearch(
  tx: Transaction,
  serviceNames: Map<string, string>,
  categoryNames: Map<string, string>,
): string {
  if (tx.type === "INCOME") {
    return incomeTransactionTitle(tx, serviceNames);
  }
  const cat = tx.expense_category_id
    ? categoryNames.get(tx.expense_category_id)
    : undefined;
  return tx.note ?? cat ?? "Expense";
}

function transactionMatchesSearch(
  tx: Transaction,
  query: string,
  serviceNames: Map<string, string>,
  categoryNames: Map<string, string>,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const title = titleForSearch(tx, serviceNames, categoryNames).toLowerCase();
  const note = tx.note?.toLowerCase() ?? "";
  const payment = dbPaymentToLabel(tx.payment_method).toLowerCase();
  const amount = String(tx.total);

  return (
    title.includes(q) ||
    note.includes(q) ||
    payment.includes(q) ||
    amount.includes(q)
  );
}

export function useActivityPage() {
  const queryClient = useQueryClient();
  const { businessId } = useActiveBusiness();
  const { timeZone, calendarSystem } = useBusinessDateSettings();
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>("Today");
  const [category, setCategory] = useState<ActivityCategoryFilter>("All");
  const [paymentMethod, setPaymentMethod] =
    useState<ActivityPaymentFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const hasSecondaryFilters = hasActivitySecondaryFilters(category, paymentMethod);
  const hasActiveSearch = searchQuery.trim().length > 0;

  const filters = useMemo((): TransactionListFilters => {
    const { from, to } = getActivityDateRange(timeframe, timeZone, new Date(), calendarSystem);
    const base: TransactionListFilters = {
      fromDate: from,
      toDate: to,
    };
    if (paymentMethod !== "All") {
      base.paymentMethod = paymentMethod;
    }
    if (category === "Income") return { ...base, type: "INCOME" };
    if (category === "Expense") return { ...base, type: "EXPENSE" };
    return base;
  }, [timeframe, category, paymentMethod, timeZone, calendarSystem]);

  const transactionsQuery = useTransactionsQuery(businessId, filters);
  const customersQuery = useCustomersQuery(businessId);
  const servicesQuery = useServiceCatalogQuery(businessId);
  const categoriesQuery = useExpenseCategoriesQuery(businessId);
  const deleteMutation = useDeleteTransactionMutation(businessId);
  const pendingCustomerLabelsQuery = useQuery<Record<string, string>>({
    queryKey: queryKeys.customers.pendingLabels(businessId),
    queryFn: () => ({}),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const serviceNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of servicesQuery.data ?? []) {
      map.set(s.id, s.name);
    }
    return map;
  }, [servicesQuery.data]);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categoriesQuery.data ?? []) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const customerLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customersQuery.data ?? []) {
      map.set(
        customer.id,
        customer.name ?? formatNepalPhoneDisplay(customer.phone_normalized),
      );
    }
    for (const [customerId, label] of Object.entries(
      pendingCustomerLabelsQuery.data ?? {},
    )) {
      map.set(customerId, label);
    }
    for (const tx of transactionsQuery.data ?? []) {
      if (!tx.customer_id || !isPendingCustomerId(tx.customer_id)) continue;
      if (map.has(tx.customer_id)) continue;
      const phone = pendingCustomerPhoneFromId(tx.customer_id);
      if (phone) {
        map.set(tx.customer_id, formatNepalPhoneDisplay(phone));
      }
    }
    return map;
  }, [
    customersQuery.data,
    pendingCustomerLabelsQuery.data,
    transactionsQuery.data,
  ]);

  const visibleTransactions = useMemo(() => {
    const list = transactionsQuery.data ?? [];
    if (!hasActiveSearch) return list;
    return list.filter((tx) =>
      transactionMatchesSearch(tx, searchQuery, serviceNames, categoryNames),
    );
  }, [
    transactionsQuery.data,
    searchQuery,
    hasActiveSearch,
    serviceNames,
    categoryNames,
  ]);

  const netRevenue = useMemo(() => {
    return visibleTransactions.reduce((sum, tx) => {
      const amount = Number(tx.total);
      return sum + (tx.type === "INCOME" ? amount : -amount);
    }, 0);
  }, [visibleTransactions]);

  const groupedTransactions = useMemo(
    () =>
      groupTransactionsByDayWithLabels(
        visibleTransactions,
        timeZone,
        calendarSystem,
      ),
    [visibleTransactions, timeZone, calendarSystem],
  );

  const isLoading =
    transactionsQuery.isLoading ||
    customersQuery.isLoading ||
    servicesQuery.isLoading ||
    categoriesQuery.isLoading;

  const error =
    transactionsQuery.error ??
    customersQuery.error ??
    servicesQuery.error ??
    categoriesQuery.error ??
    null;

  function refetch() {
    void transactionsQuery.refetch();
    void customersQuery.refetch();
    void servicesQuery.refetch();
    void categoriesQuery.refetch();
  }

  async function deleteTransaction(transactionId: string) {
    if (transactionId.startsWith("optimistic-")) {
      toast({
        title: "Still saving",
        description: "This entry is still being saved. Try again in a moment.",
      });
      return;
    }

    if (isPendingSyncTransactionId(transactionId)) {
      const clientId = pendingSyncClientId(transactionId);
      if (!clientId) return;

      await removeOutboxEntry(clientId);
      notifyOutboxChanged();
      removeTransactionFromListCaches(queryClient, businessId, transactionId);
      toast({
        title: "Offline entry removed",
        description: "This unsynced entry was deleted from this device.",
      });
      return;
    }

    await deleteMutation.mutateAsync(transactionId);
  }

  return {
    timeframe,
    setTimeframe,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    searchQuery,
    setSearchQuery,
    hasSecondaryFilters,
    hasActiveSearch,
    netRevenue,
    groupedTransactions,
    serviceNames,
    categoryNames,
    customerLabels,
    isLoading,
    error,
    refetch,
    deleteTransaction,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    timeZone,
    calendarSystem,
  };
}
