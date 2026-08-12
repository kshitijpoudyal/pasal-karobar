import type { Transaction } from "@/types/database";
import type { IncomeSummaryRow } from "@/repository/transaction.repository";
import {
  countDistinctVisits,
  countDistinctVisitsByCustomer,
  toIncomeVisitRows,
  type IncomeVisitRow,
} from "@/utils/customer-visits";

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

function asIncomeVisitRows(
  rows: IncomeSummaryRow[] | Transaction[] | IncomeVisitRow[],
): IncomeVisitRow[] {
  if (rows.length === 0) return [];
  const first = rows[0]!;
  if ("customer_id" in first && "transaction_date" in first && !("type" in first)) {
    if ("total" in first) {
      return toIncomeVisitRows(rows as IncomeSummaryRow[]);
    }
    return rows as IncomeVisitRow[];
  }
  return toIncomeVisitRows(rows as Transaction[]);
}

/** Pure metrics for dashboard / customers report (business-TZ bounds as ISO instants). */
export function computeCustomerPeriodInsights(
  periodIncomeTransactions: Transaction[],
  allTimeIncomeRows: IncomeSummaryRow[] | IncomeVisitRow[],
  periodStartIso: string,
  periodEndIso: string,
): CustomerPeriodInsights {
  const periodStartMs = Date.parse(periodStartIso);
  const periodEndMs = Date.parse(periodEndIso);

  const periodRows = toIncomeVisitRows(periodIncomeTransactions);
  const allTimeRows = asIncomeVisitRows(allTimeIncomeRows);
  const lifetimeVisitCounts = countDistinctVisitsByCustomer(allTimeRows);

  const periodTrackedRows = periodRows.filter((row) => row.customer_id);
  const periodAnonymousRows = periodRows.filter((row) => !row.customer_id);

  const trackedVisits = countDistinctVisits(periodTrackedRows);
  const anonymousVisits = countDistinctVisits(periodAnonymousRows);

  const customerIdsInPeriod = new Set<string>();
  for (const row of periodTrackedRows) {
    customerIdsInPeriod.add(row.customer_id!);
  }

  let newCustomers = 0;
  let returningCustomers = 0;

  for (const customerId of customerIdsInPeriod) {
    const lifetimeVisits = lifetimeVisitCounts.get(customerId) ?? 0;
    if (lifetimeVisits > 1) {
      returningCustomers += 1;
    } else {
      newCustomers += 1;
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
  const visitRows = asIncomeVisitRows(incomeRows);
  const visitCounts = countDistinctVisitsByCustomer(visitRows);
  const stats = new Map<
    string,
    { visitCount: number; revenue: number; lastVisitAt: string | null }
  >();

  for (const tx of incomeRows) {
    if (!tx.customer_id) continue;
    const bucket = stats.get(tx.customer_id) ?? {
      visitCount: visitCounts.get(tx.customer_id) ?? 0,
      revenue: 0,
      lastVisitAt: null,
    };
    bucket.revenue += Number(tx.total);
    if (
      !bucket.lastVisitAt ||
      Date.parse(tx.transaction_date) > Date.parse(bucket.lastVisitAt)
    ) {
      bucket.lastVisitAt = tx.transaction_date;
    }
    stats.set(tx.customer_id, bucket);
  }

  for (const [customerId, visitCount] of visitCounts) {
    const bucket = stats.get(customerId);
    if (bucket) {
      bucket.visitCount = visitCount;
      continue;
    }
    stats.set(customerId, {
      visitCount,
      revenue: 0,
      lastVisitAt: null,
    });
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
