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

export type { TrajectoryPoint } from "@/services/dashboard-summary";
export type {
  BusiestDayOfWeekInsight,
  BusiestWeekOfMonthInsight,
  BusiestHourRangeInsight,
  PeakAnalysisInsights,
} from "@/services/peak-analysis";
export type {
  DashboardSummary,
  DashboardSummaryParams,
  MonthDayHeatmap,
  MonthHeatmapDay,
} from "@/services/dashboard-summary";
export {
  EMPTY_DASHBOARD_SUMMARY,
  normalizeDashboardSummary,
} from "@/services/dashboard-summary";

import type {
  BusiestDayOfWeekInsight,
  BusiestWeekOfMonthInsight,
  BusiestHourRangeInsight,
  PeakAnalysisInsights,
} from "@/services/peak-analysis";
import type {
  DashboardSummary,
  DashboardSummaryParams,
  MonthDayHeatmap,
  MonthHeatmapDay,
  TrajectoryPoint,
} from "@/services/dashboard-summary";

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

function filterTransactionsInRange(
  transactions: Transaction[],
  fromIso: string,
  toIso: string,
): Transaction[] {
  return transactions.filter(
    (tx) => tx.transaction_date >= fromIso && tx.transaction_date <= toIso,
  );
}

export function buildMonthDayHeatmap(
  transactions: Transaction[],
  referenceDate: Date,
): MonthDayHeatmap {
  const anchor = endOfDay(referenceDate);
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const byDate = new Map<string, { visitCount: number; revenue: number }>();
  for (const tx of transactions) {
    if (tx.type !== "INCOME") continue;
    const key = tx.transaction_date.slice(0, 10);
    const d = parseISO(key);
    if (d < monthStart || d > monthEnd) continue;
    const bucket = byDate.get(key) ?? { visitCount: 0, revenue: 0 };
    bucket.visitCount += 1;
    bucket.revenue += Number(tx.total);
    byDate.set(key, bucket);
  }

  const days: MonthHeatmapDay[] = [];
  const leadingPad = getISODay(monthStart) - 1;
  for (let i = 0; i < leadingPad; i += 1) {
    days.push({
      dateKey: "",
      dayOfMonth: 0,
      visitCount: 0,
      revenue: 0,
      inMonth: false,
    });
  }

  for (const day of monthDays) {
    const dateKey = format(day, "yyyy-MM-dd");
    const stats = byDate.get(dateKey) ?? { visitCount: 0, revenue: 0 };
    days.push({
      dateKey,
      dayOfMonth: day.getDate(),
      visitCount: stats.visitCount,
      revenue: stats.revenue,
      inMonth: true,
    });
  }

  while (days.length % 7 !== 0) {
    days.push({
      dateKey: "",
      dayOfMonth: 0,
      visitCount: 0,
      revenue: 0,
      inMonth: false,
    });
  }

  return {
    monthLabel: format(monthStart, "MMMM yyyy"),
    days,
  };
}

const PEAK_WINDOW_HOURS = 5;

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function weekRangeLabel(monthStart: Date, weekIndex: number): string {
  const daysInMonth = getDaysInMonth(monthStart);
  const startDay = weekIndex * 7 + 1;
  const endDay = Math.min(startDay + 6, daysInMonth);
  const start = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    startDay,
  );
  const end = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    endDay,
  );
  if (startDay === endDay) return format(start, "MMM d");
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
}

function findBestHourWindow(hourCounts: number[]): {
  start: number;
  end: number;
  visits: number;
} {
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
  const effectiveWindow = bestSum > 0 ? windowSize : 1;
  if (bestSum <= 0) {
    for (let h = 0; h < 24; h += 1) {
      const count = hourCounts[h] ?? 0;
      if (count > bestSum) {
        bestSum = count;
        bestStart = h;
      }
    }
  }
  return {
    start: bestStart,
    end: Math.min(bestStart + effectiveWindow, 24),
    visits: Math.max(bestSum, 0),
  };
}

export function buildPeakAnalysisInsights(
  transactions: Transaction[],
  periodToIso: string,
): PeakAnalysisInsights {
  const empty: PeakAnalysisInsights = {
    busiestDayOfWeek: null,
    busiestWeekOfMonth: null,
    busiestHourRange: null,
  };

  const incomeTx = transactions.filter((tx) => tx.type === "INCOME");
  if (incomeTx.length === 0) return empty;

  const periodVisitCount = incomeTx.length;

  // Busiest day of week (by visit count in period)
  const byWeekday = new Map<
    number,
    { visits: number; revenue: number; sampleDate: string }
  >();
  for (const tx of incomeTx) {
    const isoDay = getISODay(parseISO(tx.transaction_date));
    const bucket = byWeekday.get(isoDay) ?? {
      visits: 0,
      revenue: 0,
      sampleDate: tx.transaction_date,
    };
    bucket.visits += 1;
    bucket.revenue += Number(tx.total);
    byWeekday.set(isoDay, bucket);
  }
  let peakWeekdayVisits = 0;
  let peakWeekdayRevenue = 0;
  let peakSampleDate = incomeTx[0]!.transaction_date;
  for (const [, stats] of byWeekday) {
    if (
      stats.visits > peakWeekdayVisits ||
      (stats.visits === peakWeekdayVisits && stats.revenue > peakWeekdayRevenue)
    ) {
      peakWeekdayVisits = stats.visits;
      peakWeekdayRevenue = stats.revenue;
      peakSampleDate = stats.sampleDate;
    }
  }

  const busiestDayOfWeek: BusiestDayOfWeekInsight = {
    dayLabel: format(parseISO(peakSampleDate), "EEEE"),
    visitCount: peakWeekdayVisits,
    revenue: peakWeekdayRevenue,
    periodVisitCount,
  };

  // Busiest week of month (calendar month of period end)
  const monthAnchor = startOfMonth(endOfDay(parseISO(periodToIso)));
  const daysInMonth = getDaysInMonth(monthAnchor);
  const numWeeks = Math.ceil(daysInMonth / 7);
  const weekStats = Array.from({ length: numWeeks }, () => ({
    visits: 0,
    revenue: 0,
  }));

  for (const tx of incomeTx) {
    const d = parseISO(tx.transaction_date);
    if (!isSameMonth(d, monthAnchor)) continue;
    const weekIndex = Math.floor((d.getDate() - 1) / 7);
    const bucket = weekStats[weekIndex];
    if (!bucket) continue;
    bucket.visits += 1;
    bucket.revenue += Number(tx.total);
  }

  let peakWeekIndex = 0;
  let peakWeekVisits = 0;
  let peakWeekRevenue = 0;
  weekStats.forEach((stats, index) => {
    if (
      stats.visits > peakWeekVisits ||
      (stats.visits === peakWeekVisits && stats.revenue > peakWeekRevenue)
    ) {
      peakWeekVisits = stats.visits;
      peakWeekRevenue = stats.revenue;
      peakWeekIndex = index;
    }
  });

  const busiestWeekOfMonth: BusiestWeekOfMonthInsight | null =
    peakWeekVisits > 0
      ? {
          weekLabel: `W${peakWeekIndex + 1}`,
          rangeLabel: weekRangeLabel(monthAnchor, peakWeekIndex),
          monthLabel: format(monthAnchor, "MMMM yyyy"),
          visitCount: peakWeekVisits,
          revenue: peakWeekRevenue,
        }
      : null;

  // Busiest hour range (period-wide)
  const hourCounts = new Array<number>(24).fill(0);
  for (const tx of incomeTx) {
    const hour = getHours(parseISO(tx.transaction_date));
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }
  const hourWindow = findBestHourWindow(hourCounts);
  const busiestHourRange: BusiestHourRangeInsight | null =
    hourWindow.visits > 0
      ? {
          windowStart: formatHourLabel(hourWindow.start),
          windowEnd: formatHourLabel(hourWindow.end),
          visitCount: hourWindow.visits,
          periodVisitCount,
        }
      : null;

  return {
    busiestDayOfWeek,
    busiestWeekOfMonth,
    busiestHourRange,
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
    const now = new Date();
    const periodFromIso =
      params.from ?? startOfDay(now).toISOString();
    const periodToIso = params.to ?? endOfDay(now).toISOString();
    const heatmapAnchor = endOfDay(parseISO(periodToIso));
    const monthStart = startOfMonth(heatmapAnchor);
    const periodFrom = parseISO(periodFromIso);
    const fetchFromIso =
      periodFrom.getTime() < monthStart.getTime()
        ? periodFromIso
        : monthStart.toISOString();

    const [transactions, services] = await Promise.all([
      this.transactionService.listByBusinessId(businessId, {
        fromDate: fetchFromIso,
        toDate: periodToIso,
      }),
      this.serviceCatalogService.listByBusinessId(businessId),
    ]);

    const periodTransactions = filterTransactionsInRange(
      transactions,
      periodFromIso,
      periodToIso,
    );

    const serviceNames = new Map(services.map((s) => [s.id, s.name]));

    let revenue = 0;
    let expenses = 0;
    let patronCount = 0;
    const serviceTotals = new Map<string, number>();
    const todayStart = startOfDay(now).toISOString();

    let dailyNetRevenue = 0;

    for (const tx of periodTransactions) {
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
      periodFromIso,
      periodToIso,
      periodTransactions,
    );

    const peakAnalysis = buildPeakAnalysisInsights(
      periodTransactions,
      periodToIso,
    );
    const monthDayHeatmap = buildMonthDayHeatmap(transactions, heatmapAnchor);

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
      peakAnalysis,
      monthDayHeatmap,
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
