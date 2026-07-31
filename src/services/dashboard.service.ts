import type { TransactionService } from "@/services/transaction.service";
import type { ServiceCatalogService } from "@/services/service-catalog.service";
import type { Transaction } from "@/types/database";
import type { DashboardPeriod } from "@/utils/date-ranges";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfDay,
  endOfYear,
  format,
  getDaysInMonth,
  getHours,
  getISODay,
  getYear,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
} from "date-fns";

export type TrajectoryPoint = {
  label: string;
  income: number;
  expense: number;
};

export type PeakHourInsight = {
  peakDayLabel: string;
  windowStart: string;
  windowEnd: string;
  visitCountOnPeakDay: number;
  periodIncomeCount: number;
};

export type DashboardSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  patronCount: number;
  averageSale: number;
  dailyNetRevenue: number;
  topServiceName: string | null;
  topServiceCount: number;
  serviceRevenue: { name: string; total: number }[];
  trajectory: TrajectoryPoint[];
  peakHourInsight: PeakHourInsight | null;
};

export type DashboardSummaryParams = {
  from?: string;
  to?: string;
  period?: DashboardPeriod;
};

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  patronCount: 0,
  averageSale: 0,
  dailyNetRevenue: 0,
  topServiceName: null,
  topServiceCount: 0,
  serviceRevenue: [],
  trajectory: [],
  peakHourInsight: null,
};

function sumByType(transactions: Transaction[], type: "INCOME" | "EXPENSE") {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((sum, tx) => sum + Number(tx.total), 0);
}

function addToBucket(
  bucket: { income: number; expense: number },
  tx: Transaction,
) {
  if (tx.type === "INCOME") bucket.income += Number(tx.total);
  else bucket.expense += Number(tx.total);
}

const PEAK_WINDOW_HOURS = 5;

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function buildPeakHourInsight(
  transactions: Transaction[],
): PeakHourInsight | null {
  const incomeTx = transactions.filter((tx) => tx.type === "INCOME");
  if (incomeTx.length === 0) return null;

  const dayCounts = new Map<number, number>();
  for (const tx of incomeTx) {
    const isoDay = getISODay(parseISO(tx.transaction_date));
    dayCounts.set(isoDay, (dayCounts.get(isoDay) ?? 0) + 1);
  }

  let peakIsoDay = 1;
  let peakDayCount = 0;
  for (const [isoDay, count] of dayCounts) {
    if (count > peakDayCount) {
      peakDayCount = count;
      peakIsoDay = isoDay;
    }
  }

  const onPeakDay = incomeTx.filter(
    (tx) => getISODay(parseISO(tx.transaction_date)) === peakIsoDay,
  );

  const hourCounts = new Array<number>(24).fill(0);
  for (const tx of onPeakDay) {
    const hour = getHours(parseISO(tx.transaction_date));
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }

  let bestStart = 0;
  let bestSum = -1;
  const windowSize = Math.min(PEAK_WINDOW_HOURS, 24);
  for (let start = 0; start <= 24 - windowSize; start += 1) {
    let sum = 0;
    for (let h = start; h < start + windowSize; h += 1) {
      sum += hourCounts[h] ?? 0;
    }
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = start;
    }
  }

  const effectiveWindow =
    bestSum > 0 ? windowSize : 1;
  if (bestSum <= 0) {
    for (let h = 0; h < 24; h += 1) {
      if ((hourCounts[h] ?? 0) > bestSum) {
        bestSum = hourCounts[h] ?? 0;
        bestStart = h;
      }
    }
  }

  const windowEndHour = Math.min(bestStart + effectiveWindow, 24);
  const sampleOnPeakDay = onPeakDay[0];
  const peakDayLabel = sampleOnPeakDay
    ? format(parseISO(sampleOnPeakDay.transaction_date), "EEEE")
    : "—";

  return {
    peakDayLabel,
    windowStart: formatHourLabel(bestStart),
    windowEnd: formatHourLabel(windowEndHour),
    visitCountOnPeakDay: onPeakDay.length,
    periodIncomeCount: incomeTx.length,
  };
}

export function buildPerformanceTrajectory(
  period: DashboardPeriod,
  fromIso: string,
  toIso: string,
  transactions: Transaction[],
): TrajectoryPoint[] {
  const from = startOfDay(parseISO(fromIso));
  const to = endOfDay(parseISO(toIso));

  if (period === "DAILY") {
    const days = eachDayOfInterval({ start: from, end: to });
    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const dayTx = transactions.filter(
        (tx) => tx.transaction_date.slice(0, 10) === key,
      );
      return {
        label: format(day, "EEE"),
        income: sumByType(dayTx, "INCOME"),
        expense: sumByType(dayTx, "EXPENSE"),
      };
    });
  }

  if (period === "WEEKLY") {
    const monthStart = startOfMonth(from);
    const daysInMonth = getDaysInMonth(monthStart);
    const numWeeks = Math.ceil(daysInMonth / 7);
    const buckets: TrajectoryPoint[] = Array.from({ length: numWeeks }, (_, i) => ({
      label: `W${i + 1}`,
      income: 0,
      expense: 0,
    }));

    for (const tx of transactions) {
      const d = parseISO(tx.transaction_date);
      if (!isSameMonth(d, monthStart)) continue;
      const weekIndex = Math.floor((d.getDate() - 1) / 7);
      const bucket = buckets[weekIndex];
      if (bucket) addToBucket(bucket, tx);
    }

    return buckets;
  }

  if (period === "MONTHLY") {
    const yearStart = startOfYear(from);
    const months = eachMonthOfInterval({ start: yearStart, end: to });
    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTx = transactions.filter((tx) => {
        const d = parseISO(tx.transaction_date);
        return d >= monthStart && d <= monthEnd;
      });
      return {
        label: format(month, "MMM"),
        income: sumByType(monthTx, "INCOME"),
        expense: sumByType(monthTx, "EXPENSE"),
      };
    });
  }

  const years = eachYearOfInterval({ start: startOfYear(from), end: to });
  return years.map((yearDate) => {
    const year = getYear(yearDate);
    const yearStart = startOfYear(yearDate);
    const yearEnd = endOfDay(
      year === getYear(to) ? to : endOfYear(yearDate),
    );
    const yearTx = transactions.filter((tx) => {
      const d = parseISO(tx.transaction_date);
      return d >= yearStart && d <= yearEnd;
    });
    return {
      label: String(year),
      income: sumByType(yearTx, "INCOME"),
      expense: sumByType(yearTx, "EXPENSE"),
    };
  });
}

export class DashboardService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly serviceCatalogService: ServiceCatalogService,
  ) {}

  async getSummary(
    businessId: string,
    params: DashboardSummaryParams = {},
  ): Promise<DashboardSummary> {
    const [transactions, services] = await Promise.all([
      this.transactionService.listByBusinessId(businessId, {
        fromDate: params.from,
        toDate: params.to,
      }),
      this.serviceCatalogService.listByBusinessId(businessId),
    ]);

    const serviceNames = new Map(services.map((s) => [s.id, s.name]));

    let revenue = 0;
    let expenses = 0;
    let patronCount = 0;
    const serviceTotals = new Map<string, number>();
    const todayStart = startOfDay(new Date()).toISOString();

    let dailyNetRevenue = 0;

    for (const tx of transactions) {
      if (tx.type === "INCOME") {
        revenue += Number(tx.total);
        patronCount += 1;
        if (tx.service_id) {
          const name = serviceNames.get(tx.service_id) ?? "Service";
          serviceTotals.set(name, (serviceTotals.get(name) ?? 0) + Number(tx.total));
        }
        if (tx.transaction_date >= todayStart) {
          dailyNetRevenue += Number(tx.total);
        }
      } else {
        expenses += Number(tx.total);
        if (tx.transaction_date >= todayStart) {
          dailyNetRevenue -= Number(tx.total);
        }
      }
    }

    const serviceRevenue = [...serviceTotals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const top = serviceRevenue[0];

    const period = params.period ?? "WEEKLY";
    const trajectory = buildPerformanceTrajectory(
      period,
      params.from ?? startOfDay(new Date()).toISOString(),
      params.to ?? endOfDay(new Date()).toISOString(),
      transactions,
    );

    const peakHourInsight = buildPeakHourInsight(transactions);

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      patronCount,
      averageSale: patronCount > 0 ? revenue / patronCount : 0,
      dailyNetRevenue,
      topServiceName: top?.name ?? null,
      topServiceCount: serviceRevenue.length,
      serviceRevenue,
      trajectory,
      peakHourInsight,
    };
  }
}

export function groupTransactionsByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = tx.transaction_date.slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}
