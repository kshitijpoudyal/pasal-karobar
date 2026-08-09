"use client";

import { useMemo, useState } from "react";

import {
  aggregateCustomerDirectoryStats,
  computeCustomerPeriodInsights,
  filterIncomeInInstantRange,
} from "@/services/customer-analytics.service";
import {
  hasCustomerSecondaryFilters,
  type CustomerVisitFilter,
} from "@/features/customers/constants";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";
import type { Customer } from "@/types/database";
import { getActivityDateRange, type ActivityTimeframe } from "@/utils/date-ranges";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";
import { groupCustomersByLastVisit } from "@/features/customers/components/customer-timeline";

export type CustomerDirectoryRow = {
  customer: Customer;
  visitCount: number;
  revenue: number;
  lastVisitAt: string | null;
  displayPhone: string;
};

export function useCustomersPage() {
  const { businessId } = useActiveBusiness();
  const timeZone = useBusinessTimeZone();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>("This Week");
  const [visitFilter, setVisitFilter] = useState<CustomerVisitFilter>("All");

  const customersQuery = useCustomersQuery(businessId);
  const allIncomeQuery = useTransactionsQuery(businessId, { type: "INCOME" });

  const periodRange = useMemo(
    () => getActivityDateRange(timeframe, timeZone),
    [timeframe, timeZone],
  );

  const customersById = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const row of customersQuery.data ?? []) {
      map.set(row.id, row);
    }
    return map;
  }, [customersQuery.data]);

  const periodInsights = useMemo(() => {
    const income = filterIncomeInInstantRange(
      allIncomeQuery.data ?? [],
      periodRange.from,
      periodRange.to,
    );
    return computeCustomerPeriodInsights(
      income,
      customersById,
      periodRange.from,
      periodRange.to,
    );
  }, [
    allIncomeQuery.data,
    customersById,
    periodRange.from,
    periodRange.to,
  ]);

  const directoryRows = useMemo(() => {
    const stats = aggregateCustomerDirectoryStats(allIncomeQuery.data ?? []);
    const rows: CustomerDirectoryRow[] = (customersQuery.data ?? []).map(
      (customer) => {
        const bucket = stats.get(customer.id);
        return {
          customer,
          visitCount: bucket?.visitCount ?? 0,
          revenue: bucket?.revenue ?? 0,
          lastVisitAt: bucket?.lastVisitAt ?? null,
          displayPhone: formatNepalPhoneDisplay(customer.phone_normalized),
        };
      },
    );
    rows.sort((a, b) => {
      const aTime = a.lastVisitAt ? Date.parse(a.lastVisitAt) : 0;
      const bTime = b.lastVisitAt ? Date.parse(b.lastVisitAt) : 0;
      if (aTime !== bTime) return bTime - aTime;
      return (
        Date.parse(b.customer.created_at) - Date.parse(a.customer.created_at)
      );
    });
    return rows;
  }, [allIncomeQuery.data, customersQuery.data]);

  const filteredDirectory = useMemo(() => {
    let rows = directoryRows;
    if (visitFilter === "With visits") {
      rows = rows.filter((row) => row.visitCount > 0);
    } else if (visitFilter === "No visits") {
      rows = rows.filter((row) => row.visitCount === 0);
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const name = row.customer.name?.toLowerCase() ?? "";
      const phone = row.customer.phone_normalized;
      return name.includes(q) || phone.includes(q.replace(/\D/g, ""));
    });
  }, [directoryRows, searchQuery, visitFilter]);

  const groupedCustomers = useMemo(
    () => groupCustomersByLastVisit(filteredDirectory, timeZone),
    [filteredDirectory, timeZone],
  );

  const totalCustomers = directoryRows.length;
  const hasSecondaryFilters = hasCustomerSecondaryFilters(visitFilter);
  const hasActiveSearch = searchQuery.trim().length > 0;

  return {
    businessId,
    timeZone,
    timeframe,
    setTimeframe,
    visitFilter,
    setVisitFilter,
    periodInsights,
    totalCustomers,
    directoryRows: filteredDirectory,
    groupedCustomers,
    searchQuery,
    setSearchQuery,
    hasSecondaryFilters,
    hasActiveSearch,
    isLoading: customersQuery.isLoading || allIncomeQuery.isLoading,
    error: customersQuery.error ?? allIncomeQuery.error ?? null,
    refetch: async () => {
      await Promise.all([customersQuery.refetch(), allIncomeQuery.refetch()]);
    },
  };
}
