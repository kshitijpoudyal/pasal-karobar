"use client";

import { useMemo, useState } from "react";

import { useDeleteTransactionMutation } from "@/hooks/queries/use-transaction-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useExpenseCategoriesQuery } from "@/hooks/queries/use-expense-category-queries";
import { useServiceCatalogQuery } from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { groupTransactionsByDay } from "@/utils/group-transactions-by-day";
import type { TransactionListFilters } from "@/repository";
import {
  getActivityDateRange,
  type ActivityCategoryFilter,
  type ActivityTimeframe,
} from "@/utils/date-ranges";
import {
  hasActivitySecondaryFilters,
  type ActivityPaymentFilter,
} from "@/features/activity/constants";

export function useActivityPage() {
  const { businessId } = useActiveBusiness();
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>("This Week");
  const [category, setCategory] = useState<ActivityCategoryFilter>("All");
  const [paymentMethod, setPaymentMethod] =
    useState<ActivityPaymentFilter>("All");

  const hasSecondaryFilters = hasActivitySecondaryFilters(category, paymentMethod);

  const filters = useMemo((): TransactionListFilters => {
    const { from, to } = getActivityDateRange(timeframe);
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
  }, [timeframe, category, paymentMethod]);

  const transactionsQuery = useTransactionsQuery(businessId, filters);
  const servicesQuery = useServiceCatalogQuery(businessId);
  const categoriesQuery = useExpenseCategoriesQuery(businessId);
  const deleteMutation = useDeleteTransactionMutation(businessId);

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

  const netRevenue = useMemo(() => {
    return (transactionsQuery.data ?? []).reduce((sum, tx) => {
      const amount = Number(tx.total);
      return sum + (tx.type === "INCOME" ? amount : -amount);
    }, 0);
  }, [transactionsQuery.data]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDay(transactionsQuery.data ?? []),
    [transactionsQuery.data],
  );

  const isLoading =
    transactionsQuery.isLoading ||
    servicesQuery.isLoading ||
    categoriesQuery.isLoading;

  const error =
    transactionsQuery.error ??
    servicesQuery.error ??
    categoriesQuery.error ??
    null;

  function refetch() {
    void transactionsQuery.refetch();
    void servicesQuery.refetch();
    void categoriesQuery.refetch();
  }

  async function deleteTransaction(transactionId: string) {
    if (transactionId.startsWith("optimistic-")) return;
    await deleteMutation.mutateAsync(transactionId);
  }

  return {
    timeframe,
    setTimeframe,
    category,
    setCategory,
    paymentMethod,
    setPaymentMethod,
    hasSecondaryFilters,
    netRevenue,
    groupedTransactions,
    serviceNames,
    categoryNames,
    isLoading,
    error,
    refetch,
    deleteTransaction,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
