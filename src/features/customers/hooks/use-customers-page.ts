"use client";

import { useMemo, useState } from "react";
import { parseISO, startOfDay } from "date-fns";

import {
  aggregateCustomerDirectoryStats,
  computeCustomerPeriodInsights,
  filterIncomeInInstantRange,
} from "@/services/customer-analytics.service";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";
import type { Customer } from "@/types/database";
import {
  clampAnchorToDataBounds,
  clampAnchorToToday,
  resolveDashboardRange,
  type DashboardGranularity,
} from "@/utils/date-ranges";
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
  const [granularity, setGranularity] = useState<DashboardGranularity>("week");
  const [anchorDate, setAnchorDate] = useState(() =>
    clampAnchorToToday(new Date(), new Date(), timeZone),
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const range = useMemo(
    () => resolveDashboardRange(granularity, anchorDate, new Date(), timeZone),
    [granularity, anchorDate, timeZone],
  );

  const customersQuery = useCustomersQuery(businessId);
  const periodIncomeQuery = useTransactionsQuery(businessId, {
    type: "INCOME",
    fromDate: range.from,
    toDate: range.to,
  });
  const allIncomeQuery = useTransactionsQuery(businessId, { type: "INCOME" });

  const earliestIso =
    allIncomeQuery.data?.[allIncomeQuery.data.length - 1]?.transaction_date ??
    null;
  const minSelectableDate = useMemo(() => {
    if (!earliestIso) return null;
    return startOfDay(parseISO(earliestIso));
  }, [earliestIso]);

  const clampAnchor = (date: Date) =>
    clampAnchorToDataBounds(date, minSelectableDate, new Date(), timeZone);

  const customersById = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const row of customersQuery.data ?? []) {
      map.set(row.id, row);
    }
    return map;
  }, [customersQuery.data]);

  const periodInsights = useMemo(() => {
    const income = filterIncomeInInstantRange(
      periodIncomeQuery.data ?? [],
      range.from,
      range.to,
    );
    return computeCustomerPeriodInsights(
      income,
      customersById,
      range.from,
      range.to,
    );
  }, [periodIncomeQuery.data, customersById, range.from, range.to]);

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
      return bTime - aTime;
    });
    return rows.filter((row) => row.visitCount > 0);
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
    granularity,
    setGranularity,
    anchorDate,
    setAnchorDate: (date: Date) => setAnchorDate(clampAnchor(date)),
    minSelectableDate,
    clampAnchorToToday: () =>
      setAnchorDate(clampAnchor(clampAnchorToToday(new Date(), new Date(), timeZone))),
    range,
    periodInsights,
    directoryRows: filteredDirectory,
    searchQuery,
    setSearchQuery,
    selectedCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedCustomerVisits,
    isLoading:
      customersQuery.isLoading ||
      periodIncomeQuery.isLoading ||
      allIncomeQuery.isLoading,
    error:
      customersQuery.error ??
      periodIncomeQuery.error ??
      allIncomeQuery.error ??
      null,
    refetch: async () => {
      await Promise.all([
        customersQuery.refetch(),
        periodIncomeQuery.refetch(),
        allIncomeQuery.refetch(),
      ]);
    },
  };
}
