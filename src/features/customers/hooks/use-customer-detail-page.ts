"use client";

import { useMemo } from "react";

import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useServiceCatalogQuery } from "@/hooks/queries/use-service-catalog-queries";
import { useTransactionsQuery } from "@/hooks/queries/use-transaction-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessDateSettings } from "@/hooks/use-business-date-settings";
import { countDistinctVisits, toIncomeVisitRows } from "@/utils/customer-visits";
import { parseCustomerPhoneRouteParam } from "@/utils/customer-routes";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";
import { groupTransactionsByDayWithLabels } from "@/utils/group-transactions-by-day";

export function useCustomerDetailPage(phoneRouteParam: string) {
  const { businessId } = useActiveBusiness();
  const { timeZone, calendarSystem } = useBusinessDateSettings();

  const parsedPhone = useMemo(
    () => parseCustomerPhoneRouteParam(phoneRouteParam),
    [phoneRouteParam],
  );

  const customersQuery = useCustomersQuery(businessId);

  const customer = useMemo(() => {
    if (!parsedPhone.ok) return null;
    return (
      (customersQuery.data ?? []).find(
        (row) => row.phone_normalized === parsedPhone.normalized,
      ) ?? null
    );
  }, [customersQuery.data, parsedPhone]);

  const customerIncomeQuery = useTransactionsQuery(
    businessId,
    {
      type: "INCOME",
      customerId: customer?.id,
    },
    { enabled: Boolean(customer?.id) },
  );
  const servicesQuery = useServiceCatalogQuery(businessId);

  const serviceNames = useMemo(() => {
    return new Map(
      (servicesQuery.data ?? []).map((service) => [service.id, service.name]),
    );
  }, [servicesQuery.data]);

  const stats = useMemo(() => {
    if (!customer) {
      return { visitCount: 0, revenue: 0 };
    }
    const rows = customerIncomeQuery.data ?? [];
    return {
      visitCount: countDistinctVisits(toIncomeVisitRows(rows)),
      revenue: rows.reduce((sum, tx) => sum + Number(tx.total), 0),
    };
  }, [customer, customerIncomeQuery.data]);

  const groupedVisits = useMemo(
    () =>
      groupTransactionsByDayWithLabels(
        customerIncomeQuery.data ?? [],
        timeZone,
        calendarSystem,
      ),
    [customerIncomeQuery.data, timeZone, calendarSystem],
  );

  const displayPhone =
    customer && parsedPhone.ok
      ? formatNepalPhoneDisplay(parsedPhone.normalized)
      : null;

  return {
    businessId,
    timeZone,
    calendarSystem,
    parsedPhone,
    customer,
    displayPhone,
    visitCount: stats.visitCount,
    revenue: stats.revenue,
    groupedVisits,
    visitTransactions: customerIncomeQuery.data ?? [],
    serviceNames,
    isLoading:
      customersQuery.isLoading ||
      customerIncomeQuery.isLoading ||
      servicesQuery.isLoading,
    error:
      customersQuery.error ??
      customerIncomeQuery.error ??
      servicesQuery.error ??
      null,
    refetch: async () => {
      await Promise.all([
        customersQuery.refetch(),
        customerIncomeQuery.refetch(),
        servicesQuery.refetch(),
      ]);
    },
  };
}
