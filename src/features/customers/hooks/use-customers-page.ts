"use client";

import { useMemo, useState } from "react";

import {
  aggregateCustomerDirectoryStats,
  computeCustomerPeriodInsights,
} from "@/services/customer-analytics.service";
import {
  hasCustomerSecondaryFilters,
  type CustomerVisitFilter,
} from "@/features/customers/constants";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import {
  useIncomeSummaryQuery,
} from "@/hooks/queries/use-transaction-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessDateSettings } from "@/hooks/use-business-date-settings";
import type { Customer } from "@/types/database";
import { getActivityDateRange, type ActivityTimeframe } from "@/utils/date-ranges";
import { formatNepalPhoneDisplay, matchesCustomerNameOrPhone } from "@/utils/phone-np";
import { groupCustomersByLastVisitWithLabels } from "@/features/customers/components/customer-timeline";

export type CustomerDirectoryRow = {
  customer: Customer;
  visitCount: number;
  revenue: number;
  lastVisitAt: string | null;
  displayPhone: string;
};

export function useCustomersPage() {
  const { businessId } = useActiveBusiness();
  const { timeZone, calendarSystem } = useBusinessDateSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<ActivityTimeframe>("This Week");
  const [visitFilter, setVisitFilter] = useState<CustomerVisitFilter>("All");

  const customersQuery = useCustomersQuery(businessId);
  const incomeSummaryQuery = useIncomeSummaryQuery(businessId);

  const periodRange = useMemo(
    () => getActivityDateRange(timeframe, timeZone, new Date(), calendarSystem),
    [timeframe, timeZone, calendarSystem],
  );

  const periodInsights = useMemo(() => {
    return computeCustomerPeriodInsights(
      incomeSummaryQuery.data ?? [],
      periodRange.from,
      periodRange.to,
    );
  }, [incomeSummaryQuery.data, periodRange.from, periodRange.to]);

  const directoryRows = useMemo(() => {
    const stats = aggregateCustomerDirectoryStats(incomeSummaryQuery.data ?? []);
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
  }, [incomeSummaryQuery.data, customersQuery.data]);

  const filteredDirectory = useMemo(() => {
    let rows = directoryRows;
    if (visitFilter === "With visits") {
      rows = rows.filter((row) => row.visitCount > 0);
    } else if (visitFilter === "No visits") {
      rows = rows.filter((row) => row.visitCount === 0);
    }

    const q = searchQuery.trim();
    if (!q) return rows;
    return rows.filter((row) =>
      matchesCustomerNameOrPhone(
        {
          name: row.customer.name,
          phoneNormalized: row.customer.phone_normalized,
          displayPhone: row.displayPhone,
        },
        q,
      ),
    );
  }, [directoryRows, searchQuery, visitFilter]);

  const groupedCustomers = useMemo(
    () =>
      groupCustomersByLastVisitWithLabels(
        filteredDirectory,
        timeZone,
        calendarSystem,
      ),
    [filteredDirectory, timeZone, calendarSystem],
  );

  const totalCustomers = directoryRows.length;
  const hasSecondaryFilters = hasCustomerSecondaryFilters(visitFilter);
  const hasActiveSearch = searchQuery.trim().length > 0;

  return {
    businessId,
    timeZone,
    calendarSystem,
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
    isLoading:
      customersQuery.isLoading ||
      incomeSummaryQuery.isLoading,
    error:
      customersQuery.error ??
      incomeSummaryQuery.error ??
      null,
    refetch: async () => {
      await Promise.all([
        customersQuery.refetch(),
        incomeSummaryQuery.refetch(),
      ]);
    },
  };
}
