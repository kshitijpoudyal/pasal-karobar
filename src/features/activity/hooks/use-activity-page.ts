"use client";

import { useMemo, useState } from "react";

import { useDeleteTransactionMutation } from "@/hooks/queries/use-transaction-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useExpenseCategoriesQuery } from "@/hooks/queries/use-expense-category-queries";
import { useServiceCatalogQuery } from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";
import { groupTransactionsByDay } from "@/utils/group-transactions-by-day";
import type { TransactionListFilters } from "@/repository";
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

function titleForSearch(
  tx: Transaction,
  serviceNames: Map<string, string>,
  categoryNames: Map<string, string>,
): string {
  if (tx.type === "INCOME") {
    const name = tx.service_id ? serviceNames.get(tx.service_id) : undefined;
    return name ?? tx.note ?? "Income";
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
  const { businessId } = useActiveBusiness();
  const timeZone = useBusinessTimeZone();
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>("This Week");
  const [category, setCategory] = useState<ActivityCategoryFilter>("All");
  const [paymentMethod, setPaymentMethod] =
    useState<ActivityPaymentFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const hasSecondaryFilters = hasActivitySecondaryFilters(category, paymentMethod);
  const hasActiveSearch = searchQuery.trim().length > 0;

  const filters = useMemo((): TransactionListFilters => {
    const { from, to } = getActivityDateRange(timeframe, timeZone);
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
  }, [timeframe, category, paymentMethod, timeZone]);

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
    () => groupTransactionsByDay(visibleTransactions, timeZone),
    [visibleTransactions, timeZone],
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
    searchQuery,
    setSearchQuery,
    hasSecondaryFilters,
    hasActiveSearch,
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
    timeZone,
  };
}
