"use client";

import { useMemo, useState } from "react";

import {
  aggregateCustomerDirectoryStats,
  computeCustomerPeriodInsights,
  EMPTY_CUSTOMER_PERIOD_INSIGHTS,
  filterIncomeInInstantRange,
} from "@/services/customer-analytics.service";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";
import type { Customer } from "@/types/database";
import { zonedPeriodBounds } from "@/utils/business-datetime";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";

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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const customersQuery = useCustomersQuery(businessId);
  const allIncomeQuery = useTransactionsQuery(businessId, { type: "INCOME" });

  const statsWeekRange = useMemo(() => {
    const now = new Date();
    return zonedPeriodBounds("week", now, timeZone, now);
  }, [timeZone]);

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
      statsWeekRange.from,
      statsWeekRange.to,
    );
    return computeCustomerPeriodInsights(
      income,
      customersById,
      statsWeekRange.from,
      statsWeekRange.to,
    );
  }, [allIncomeQuery.data, customersById, statsWeekRange.from, statsWeekRange.to]);

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
    const q = searchQuery.trim().toLowerCase();
    if (!q) return directoryRows;
    return directoryRows.filter((row) => {
      const name = row.customer.name?.toLowerCase() ?? "";
      const phone = row.customer.phone_normalized;
      return name.includes(q) || phone.includes(q.replace(/\D/g, ""));
    });
  }, [directoryRows, searchQuery]);

  const selectedCustomer = selectedCustomerId
    ? (customersById.get(selectedCustomerId) ?? null)
    : null;

  const selectedCustomerVisits = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (allIncomeQuery.data ?? []).filter(
      (tx) => tx.customer_id === selectedCustomerId,
    );
  }, [allIncomeQuery.data, selectedCustomerId]);

  return {
    businessId,
    timeZone,
    periodInsights,
    statsPeriodLabel: "This week" as const,
    directoryRows: filteredDirectory,
    searchQuery,
    setSearchQuery,
    selectedCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedCustomerVisits,
    isLoading: customersQuery.isLoading || allIncomeQuery.isLoading,
    error: customersQuery.error ?? allIncomeQuery.error ?? null,
    refetch: async () => {
      await Promise.all([customersQuery.refetch(), allIncomeQuery.refetch()]);
    },
  };
}
