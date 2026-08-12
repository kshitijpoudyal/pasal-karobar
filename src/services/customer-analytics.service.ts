import type { Customer } from "@/types/database";
import type { Transaction } from "@/types/database";
import type { IncomeSummaryRow } from "@/repository/transaction.repository";

export type CustomerPeriodInsights = {
  newCustomers: number;
  returningCustomers: number;
  uniqueTrackedCustomers: number;
  anonymousVisits: number;
  trackedVisits: number;
};

export const EMPTY_CUSTOMER_PERIOD_INSIGHTS: CustomerPeriodInsights = {
  newCustomers: 0,
  returningCustomers: 0,
  uniqueTrackedCustomers: 0,
  anonymousVisits: 0,
  trackedVisits: 0,
};

function isInstantInRange(
  iso: string,
  periodStartMs: number,
  periodEndMs: number,
): boolean {
  const t = Date.parse(iso);
  return t >= periodStartMs && t <= periodEndMs;
}

/** Pure metrics for dashboard / customers report (business-TZ bounds as ISO instants). */
export function computeCustomerPeriodInsights(
  incomeTransactions: Transaction[],
  customersById: Map<string, Customer>,
  periodStartIso: string,
  periodEndIso: string,
): CustomerPeriodInsights {
  const periodStartMs = Date.parse(periodStartIso);
  const periodEndMs = Date.parse(periodEndIso);

  let anonymousVisits = 0;
  let trackedVisits = 0;
  const customerIdsInPeriod = new Set<string>();

  for (const tx of incomeTransactions) {
    if (!tx.customer_id) {
      anonymousVisits += 1;
      continue;
    }
    trackedVisits += 1;
    customerIdsInPeriod.add(tx.customer_id);
  }

  let newCustomers = 0;
  let returningCustomers = 0;

  for (const customerId of customerIdsInPeriod) {
    const customer = customersById.get(customerId);
    const firstVisit = customer?.first_visit_at;
    if (!firstVisit) {
      newCustomers += 1;
      continue;
    }
    const firstMs = Date.parse(firstVisit);
    if (firstMs < periodStartMs) {
      returningCustomers += 1;
    } else if (firstMs >= periodStartMs && firstMs <= periodEndMs) {
      newCustomers += 1;
    } else {
      returningCustomers += 1;
    }
  }

  return {
    newCustomers,
    returningCustomers,
    uniqueTrackedCustomers: customerIdsInPeriod.size,
    anonymousVisits,
    trackedVisits,
  };
}

export function aggregateCustomerDirectoryStats(
  incomeRows: IncomeSummaryRow[] | Transaction[],
): Map<
  string,
  { visitCount: number; revenue: number; lastVisitAt: string | null }
> {
  const stats = new Map<
    string,
    { visitCount: number; revenue: number; lastVisitAt: string | null }
  >();

  for (const tx of incomeRows) {
    if (!tx.customer_id) continue;
    const bucket = stats.get(tx.customer_id) ?? {
      visitCount: 0,
      revenue: 0,
      lastVisitAt: null,
    };
    bucket.visitCount += 1;
    bucket.revenue += Number(tx.total);
    if (
      !bucket.lastVisitAt ||
      Date.parse(tx.transaction_date) > Date.parse(bucket.lastVisitAt)
    ) {
      bucket.lastVisitAt = tx.transaction_date;
    }
    stats.set(tx.customer_id, bucket);
  }

  return stats;
}

export function filterIncomeInInstantRange(
  transactions: Transaction[],
  periodStartIso: string,
  periodEndIso: string,
): Transaction[] {
  const start = Date.parse(periodStartIso);
  const end = Date.parse(periodEndIso);
  return transactions.filter((tx) => {
    if (tx.type !== "INCOME") return false;
    const t = Date.parse(tx.transaction_date);
    return t >= start && t <= end;
  });
}

export function isInstantInClosedRange(
  iso: string,
  periodStartIso: string,
  periodEndIso: string,
): boolean {
  return isInstantInRange(iso, Date.parse(periodStartIso), Date.parse(periodEndIso));
}
