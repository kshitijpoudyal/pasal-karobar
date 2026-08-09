"use client";

import { useMemo } from "react";

import { aggregateCustomerDirectoryStats } from "@/services/customer-analytics.service";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";
import { parseCustomerPhoneRouteParam } from "@/utils/customer-routes";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";

export function useCustomerDetailPage(phoneRouteParam: string) {
  const { businessId } = useActiveBusiness();
  const timeZone = useBusinessTimeZone();

  const parsedPhone = useMemo(
    () => parseCustomerPhoneRouteParam(phoneRouteParam),
    [phoneRouteParam],
  );

  const customersQuery = useCustomersQuery(businessId);
  const allIncomeQuery = useTransactionsQuery(businessId, { type: "INCOME" });

  const customer = useMemo(() => {
    if (!parsedPhone.ok) return null;
    return (
      (customersQuery.data ?? []).find(
        (row) => row.phone_normalized === parsedPhone.normalized,
      ) ?? null
    );
  }, [customersQuery.data, parsedPhone]);

  const stats = useMemo(() => {
    if (!customer) {
      return { visitCount: 0, revenue: 0 };
    }
    const bucket = aggregateCustomerDirectoryStats(
      allIncomeQuery.data ?? [],
    ).get(customer.id);
    return {
      visitCount: bucket?.visitCount ?? 0,
      revenue: bucket?.revenue ?? 0,
    };
  }, [allIncomeQuery.data, customer]);

  const visits = useMemo(() => {
    if (!customer) return [];
    return (allIncomeQuery.data ?? [])
      .filter((tx) => tx.customer_id === customer.id)
      .sort(
        (a, b) =>
          Date.parse(b.transaction_date) - Date.parse(a.transaction_date),
      );
  }, [allIncomeQuery.data, customer]);

  const displayPhone =
    customer && parsedPhone.ok
      ? formatNepalPhoneDisplay(parsedPhone.normalized)
      : null;

  return {
    businessId,
    timeZone,
    parsedPhone,
    customer,
    displayPhone,
    visitCount: stats.visitCount,
    revenue: stats.revenue,
    visits,
    isLoading: customersQuery.isLoading || allIncomeQuery.isLoading,
    error: customersQuery.error ?? allIncomeQuery.error ?? null,
    refetch: async () => {
      await Promise.all([customersQuery.refetch(), allIncomeQuery.refetch()]);
    },
  };
}
