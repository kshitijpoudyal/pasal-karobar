import type { BusinessService } from "@/services/business.service";
import type { CustomerService } from "@/services/customer.service";
import { resolveCalendarSystem, type CalendarSystem } from "@/constants/calendar-system";
import { computeCustomerPeriodInsights } from "@/services/customer-analytics.service";
import type { TransactionService } from "@/services/transaction.service";
import type { ServiceCatalogService } from "@/services/service-catalog.service";
import type { Transaction } from "@/types/database";
import type { DashboardGranularity } from "@/utils/date-ranges";
import {
  resolvePriorDashboardRange,
} from "@/utils/date-ranges";
import {
  businessTodayDateKey,
  dateKeyInTimeZone,
  DEFAULT_BUSINESS_TIMEZONE,
  hourInTimeZone,
  isoDayInTimeZone,
  logTimezoneFormatMismatch,
  parseDateKey,
  resolveBusinessTimeZone,
  startOfZonedDay,
  zonedPeriodBounds,
} from "@/utils/business-datetime";
import {
  adDateKeyToBs,
  bsMonthBounds,
  bsToAdDateKey,
  daysInBsMonth,
  formatBsDayShort,
  formatBsMonthYear,
} from "@/utils/nepali-calendar";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  min,
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
  PeriodComparison,
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
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
): MonthDayHeatmap {
  if (calendarSystem === "BS") {
    const refKey = dateKeyInTimeZone(referenceDate.toISOString(), timeZone);
    const refBs = adDateKeyToBs(refKey);
    if (!refBs) {
      return buildMonthDayHeatmap(transactions, referenceDate, timeZone, "AD");
    }
    const bounds = bsMonthBounds(refBs.year, refBs.month);
    if (!bounds) {
      return buildMonthDayHeatmap(transactions, referenceDate, timeZone, "AD");
    }

    const byDate = new Map<string, { visitCount: number; revenue: number }>();
    for (const tx of transactions) {
      if (tx.type !== "INCOME") continue;
      const key = dateKeyInTimeZone(tx.transaction_date, timeZone);
      if (key < bounds.fromKey || key > bounds.toKey) continue;
      const bucket = byDate.get(key) ?? { visitCount: 0, revenue: 0 };
      bucket.visitCount += 1;
      bucket.revenue += Number(tx.total);
      byDate.set(key, bucket);
    }

    const monthDays = daysInBsMonth(refBs.year, refBs.month);
    const monthStart = startOfZonedDay(bounds.fromKey, timeZone);
    const days: MonthHeatmapDay[] = [];
    const leadingPad = isoDayInTimeZone(monthStart.toISOString(), timeZone) - 1;
    for (let i = 0; i < leadingPad; i += 1) {
      days.push({
        dateKey: "",
        dayOfMonth: 0,
        visitCount: 0,
        revenue: 0,
        inMonth: false,
      });
    }

    for (let day = 1; day <= monthDays; day += 1) {
      const key = bsToAdDateKey(refBs.year, refBs.month, day) ?? "";
      const stats = key ? (byDate.get(key) ?? { visitCount: 0, revenue: 0 }) : { visitCount: 0, revenue: 0 };
      days.push({
        dateKey: key,
        dayOfMonth: day,
        visitCount: stats.visitCount,
        revenue: stats.revenue,
        inMonth: Boolean(key),
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
      monthLabel: formatBsMonthYear(bounds.fromKey) ?? `${refBs.year}`,
      days,
    };
  }

  const refKey = dateKeyInTimeZone(referenceDate.toISOString(), timeZone);
  const { year, month } = parseDateKey(refKey);
  const monthStartKey = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEndKey = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const monthStart = startOfZonedDay(monthStartKey, timeZone);
  const monthEnd = startOfZonedDay(monthEndKey, timeZone);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const byDate = new Map<string, { visitCount: number; revenue: number }>();
  for (const tx of transactions) {
    if (tx.type !== "INCOME") continue;
    const key = dateKeyInTimeZone(tx.transaction_date, timeZone);
    if (key < monthStartKey || key > monthEndKey) continue;
    const bucket = byDate.get(key) ?? { visitCount: 0, revenue: 0 };
    bucket.visitCount += 1;
    bucket.revenue += Number(tx.total);
    byDate.set(key, bucket);
  }

  const days: MonthHeatmapDay[] = [];
  const leadingPad = isoDayInTimeZone(monthStart.toISOString(), timeZone) - 1;
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

function findBusiestContiguousHourRange(hourCounts: number[]): {
  start: number;
  endExclusive: number;
  visits: number;
} {
  let bestSum = 0;
  let bestStart = 0;
  let bestEndExclusive = 0;

  let runSum = 0;
  let runStart = 0;

  for (let h = 0; h < 24; h += 1) {
    const count = hourCounts[h] ?? 0;
    if (count === 0) {
      runSum = 0;
      runStart = h + 1;
      continue;
    }
    if (runSum === 0) runStart = h;
    runSum += count;
    if (
      runSum > bestSum ||
      (runSum === bestSum && h + 1 - runStart < bestEndExclusive - bestStart)
    ) {
      bestSum = runSum;
      bestStart = runStart;
      bestEndExclusive = h + 1;
    }
  }

  if (bestSum > 0) {
    return { start: bestStart, endExclusive: bestEndExclusive, visits: bestSum };
  }

  let peakHour = 0;
  let peakCount = 0;
  for (let h = 0; h < 24; h += 1) {
    const count = hourCounts[h] ?? 0;
    if (count > peakCount) {
      peakCount = count;
      peakHour = h;
    }
  }
  if (peakCount === 0) {
    return { start: 0, endExclusive: 0, visits: 0 };
  }
  return {
    start: peakHour,
    endExclusive: peakHour + 1,
    visits: peakCount,
  };
}

function findBestHourWindow(hourCounts: number[]): {
  start: number;
  end: number;
  visits: number;
} {
  const range = findBusiestContiguousHourRange(hourCounts);
  return {
    start: range.start,
    end: range.endExclusive,
    visits: range.visits,
  };
}

function formatHourLabel(hour: number): string {
  const h = hour >= 24 ? 0 : Math.max(0, hour);
  return format(new Date(2020, 0, 1, h, 0), "h:mm a");
}

function formatHourEndLabel(hour: number): string {
  const h = hour >= 24 ? 0 : Math.max(0, hour);
  return format(new Date(2020, 0, 1, h, 59), "h:mm a");
}

const ISO_WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function weekdayLabelFromIsoDay(isoDay: number): string {
  return ISO_WEEKDAY_LABELS[isoDay - 1] ?? "Monday";
}

function formatMonthYearFromMonthKey(
  periodMonthKey: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    year: "numeric",
  }).format(startOfZonedDay(`${periodMonthKey}-01`, timeZone));
}

function formatDateKeyShort(dateKey: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(startOfZonedDay(dateKey, timeZone));
}

function weekRangeLabelForMonthWeek(
  periodMonthKey: string,
  weekIndex: number,
  timeZone: string,
): string {
  const { year, month } = parseDateKey(`${periodMonthKey}-01`);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDay = weekIndex * 7 + 1;
  const endDay = Math.min(startDay + 6, daysInMonth);
  const startKey = `${periodMonthKey}-${String(startDay).padStart(2, "0")}`;
  const endKey = `${periodMonthKey}-${String(endDay).padStart(2, "0")}`;
  if (startDay === endDay) return formatDateKeyShort(startKey, timeZone);
  return `${formatDateKeyShort(startKey, timeZone)} – ${formatDateKeyShort(endKey, timeZone)}`;
}

function weekRangeLabelForBsMonthWeek(
  bsYear: number,
  bsMonth: number,
  weekIndex: number,
): string {
  const startDay = weekIndex * 7 + 1;
  const endDay = Math.min(startDay + 6, daysInBsMonth(bsYear, bsMonth));
  const startKey = bsToAdDateKey(bsYear, bsMonth, startDay);
  const endKey = bsToAdDateKey(bsYear, bsMonth, endDay);
  if (!startKey || !endKey) return `W${weekIndex + 1}`;
  const startShort = formatBsDayShort(startKey);
  const endShort = formatBsDayShort(endKey);
  if (!startShort || !endShort) return `W${weekIndex + 1}`;
  if (startDay === endDay) return startShort;
  return `${startShort} – ${endShort}`;
}

export function buildPeakAnalysisInsights(
  transactions: Transaction[],
  periodToIso: string,
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
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
    { visits: number; revenue: number }
  >();
  for (const tx of incomeTx) {
    const isoDay = isoDayInTimeZone(tx.transaction_date, timeZone);
    const bucket = byWeekday.get(isoDay) ?? {
      visits: 0,
      revenue: 0,
    };
    bucket.visits += 1;
    bucket.revenue += Number(tx.total);
    byWeekday.set(isoDay, bucket);
  }
  let peakWeekdayVisits = 0;
  let peakWeekdayRevenue = 0;
  let peakIsoDay = isoDayInTimeZone(incomeTx[0]!.transaction_date, timeZone);
  for (const [isoDay, stats] of byWeekday) {
    if (
      stats.visits > peakWeekdayVisits ||
      (stats.visits === peakWeekdayVisits && stats.revenue > peakWeekdayRevenue)
    ) {
      peakWeekdayVisits = stats.visits;
      peakWeekdayRevenue = stats.revenue;
      peakIsoDay = isoDay;
    }
  }

  const busiestDayOfWeek: BusiestDayOfWeekInsight = {
    dayLabel: weekdayLabelFromIsoDay(peakIsoDay),
    visitCount: peakWeekdayVisits,
    revenue: peakWeekdayRevenue,
    periodVisitCount,
  };

  // Busiest week of month (calendar month of period end in business TZ)
  let busiestWeekOfMonth: BusiestWeekOfMonthInsight | null = null;

  if (calendarSystem === "BS") {
    const periodKey = dateKeyInTimeZone(periodToIso, timeZone);
    const periodBs = adDateKeyToBs(periodKey);
    const bounds = periodBs ? bsMonthBounds(periodBs.year, periodBs.month) : null;
    if (periodBs && bounds) {
      const daysInMonth = daysInBsMonth(periodBs.year, periodBs.month);
      const numWeeks = Math.ceil(daysInMonth / 7);
      const weekStats = Array.from({ length: numWeeks }, () => ({
        visits: 0,
        revenue: 0,
      }));

      for (const tx of incomeTx) {
        const txKey = dateKeyInTimeZone(tx.transaction_date, timeZone);
        if (txKey < bounds.fromKey || txKey > bounds.toKey) continue;
        const txBs = adDateKeyToBs(txKey);
        if (!txBs) continue;
        const weekIndex = Math.floor((txBs.day - 1) / 7);
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

      busiestWeekOfMonth =
        peakWeekVisits > 0
          ? {
              weekLabel: `W${peakWeekIndex + 1}`,
              rangeLabel: weekRangeLabelForBsMonthWeek(
                periodBs.year,
                periodBs.month,
                peakWeekIndex,
              ),
              monthLabel: formatBsMonthYear(bounds.fromKey) ?? String(periodBs.year),
              visitCount: peakWeekVisits,
              revenue: peakWeekRevenue,
            }
          : null;
    }
  } else {
    const periodMonthKey = dateKeyInTimeZone(periodToIso, timeZone).slice(0, 7);
    const { year: monthYear, month: monthNum } = parseDateKey(`${periodMonthKey}-01`);
    const daysInMonth = new Date(Date.UTC(monthYear, monthNum, 0)).getUTCDate();
    const numWeeks = Math.ceil(daysInMonth / 7);
    const weekStats = Array.from({ length: numWeeks }, () => ({
      visits: 0,
      revenue: 0,
    }));

    for (const tx of incomeTx) {
      const txKey = dateKeyInTimeZone(tx.transaction_date, timeZone);
      if (!txKey.startsWith(periodMonthKey)) continue;
      const dayOfMonth = Number.parseInt(txKey.slice(8, 10), 10);
      const weekIndex = Math.floor((dayOfMonth - 1) / 7);
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

    busiestWeekOfMonth =
      peakWeekVisits > 0
        ? {
            weekLabel: `W${peakWeekIndex + 1}`,
            rangeLabel: weekRangeLabelForMonthWeek(
              periodMonthKey,
              peakWeekIndex,
              timeZone,
            ),
            monthLabel: formatMonthYearFromMonthKey(periodMonthKey, timeZone),
            visitCount: peakWeekVisits,
            revenue: peakWeekRevenue,
          }
        : null;
  }

  // Busiest hour range (period-wide)
  const hourCounts = new Array<number>(24).fill(0);
  for (const tx of incomeTx) {
    const hour = hourInTimeZone(tx.transaction_date, timeZone);
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }
  const hourWindow = findBestHourWindow(hourCounts);
  const lastHourInWindow = Math.min(Math.max(0, hourWindow.end - 1), 23);
  const busiestHourRange: BusiestHourRangeInsight | null =
    hourWindow.visits > 0
      ? {
          windowStart: formatHourLabel(hourWindow.start),
          windowEnd: formatHourEndLabel(lastHourInWindow),
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

function aggregatePeriodMetrics(transactions: Transaction[]) {
  let revenue = 0;
  let expenses = 0;
  let patronCount = 0;
  for (const tx of transactions) {
    if (tx.type === "INCOME") {
      revenue += Number(tx.total);
      patronCount += 1;
    } else {
      expenses += Number(tx.total);
    }
  }
  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    patronCount,
  };
}

export function buildPerformanceTrajectory(
  granularity: DashboardGranularity,
  fromIso: string,
  toIso: string,
  transactions: Transaction[],
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): TrajectoryPoint[] {
  const from = startOfDay(parseISO(fromIso));
  const to = endOfDay(parseISO(toIso));

  if (granularity === "day") {
    const buckets: TrajectoryPoint[] = Array.from({ length: 24 }, (_, hour) => ({
      id: `hour-${hour}`,
      label: format(new Date(2020, 0, 1, hour), "ha"),
      income: 0,
      expense: 0,
    }));
    for (const tx of transactions) {
      const hour = hourInTimeZone(tx.transaction_date, timeZone);
      const bucket = buckets[hour];
      if (bucket) addToBucket(bucket, tx);
    }
    return buckets.filter((bucket) => bucket.income > 0 || bucket.expense > 0);
  }

  if (granularity === "week") {
    const days = eachDayOfInterval({ start: from, end: to });
    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const dayTx = transactions.filter(
        (tx) => dateKeyInTimeZone(tx.transaction_date, timeZone) === key,
      );
      return {
        id: key,
        label: format(day, "EEE"),
        income: sumByType(dayTx, "INCOME"),
        expense: sumByType(dayTx, "EXPENSE"),
      };
    });
  }

  if (granularity === "month") {
    const days = eachDayOfInterval({ start: from, end: to });
    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const dayTx = transactions.filter(
        (tx) => dateKeyInTimeZone(tx.transaction_date, timeZone) === key,
      );
      return {
        id: key,
        label: format(day, "d"),
        income: sumByType(dayTx, "INCOME"),
        expense: sumByType(dayTx, "EXPENSE"),
      };
    });
  }

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
      id: format(month, "yyyy-MM"),
      label: format(month, "MMM"),
      income: sumByType(monthTx, "INCOME"),
      expense: sumByType(monthTx, "EXPENSE"),
    };
  });
}

export class DashboardService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly serviceCatalogService: ServiceCatalogService,
    private readonly businessService: BusinessService,
    private readonly customerService: CustomerService,
  ) {}

  async getSummary(
    businessId: string,
    params: DashboardSummaryParams = {},
  ): Promise<DashboardSummary> {
    const business = await this.businessService.getById(businessId);
    const timeZone = resolveBusinessTimeZone(business?.timezone);
    const calendarSystem = resolveCalendarSystem(business?.calendar_system);

    const now = new Date();
    const defaultDay = zonedPeriodBounds("day", now, timeZone, now, calendarSystem);
    const periodFromIso = params.from ?? defaultDay.from;
    const periodToIso = params.to ?? defaultDay.to;
    const granularity: DashboardGranularity = params.granularity ?? "week";
    const heatmapAnchor = endOfDay(parseISO(periodToIso));

    const anchorForPrior = parseISO(periodToIso);
    const priorRange = resolvePriorDashboardRange(
      granularity,
      anchorForPrior,
      now,
      timeZone,
      calendarSystem,
    );

    const fetchFromIso = min([
      parseISO(periodFromIso),
      parseISO(priorRange.from),
    ]).toISOString();

    const [transactions, services, earliestTransactionDate] = await Promise.all([
      this.transactionService.listByBusinessId(businessId, {
        fromDate: fetchFromIso,
        toDate: periodToIso,
      }),
      this.serviceCatalogService.listByBusinessId(businessId),
      this.transactionService.findEarliestTransactionDate(businessId),
    ]);

    const periodTransactions = filterTransactionsInRange(
      transactions,
      periodFromIso,
      periodToIso,
    );

    if (periodTransactions[0]) {
      logTimezoneFormatMismatch(
        periodTransactions[0].transaction_date,
        timeZone,
        "dashboard-getSummary",
      );
    }

    const priorTransactions = filterTransactionsInRange(
      transactions,
      priorRange.from,
      priorRange.to,
    );

    const serviceNames = new Map(services.map((s) => [s.id, s.name]));

    const periodMetrics = aggregatePeriodMetrics(periodTransactions);
    const revenue = periodMetrics.revenue;
    const expenses = periodMetrics.expenses;
    const patronCount = periodMetrics.patronCount;
    const serviceTotals = new Map<string, number>();
    const todayStart = startOfZonedDay(
      businessTodayDateKey(timeZone, now),
      timeZone,
    ).toISOString();

    let dailyNetRevenue = 0;

    for (const tx of periodTransactions) {
      if (tx.type === "INCOME" && tx.service_id) {
        const name = serviceNames.get(tx.service_id) ?? "Service";
        serviceTotals.set(name, (serviceTotals.get(name) ?? 0) + Number(tx.total));
      }
      if (tx.transaction_date >= todayStart) {
        dailyNetRevenue +=
          tx.type === "INCOME" ? Number(tx.total) : -Number(tx.total);
      }
    }

    const priorMetrics = aggregatePeriodMetrics(priorTransactions);
    const netDelta = periodMetrics.profit - priorMetrics.profit;
    const periodComparison: PeriodComparison = {
      priorFrom: priorRange.from,
      priorTo: priorRange.to,
      priorNet: priorMetrics.profit,
      netDelta,
      netDeltaPercent:
        priorMetrics.profit !== 0
          ? (netDelta / Math.abs(priorMetrics.profit)) * 100
          : null,
    };

    const serviceRevenue = [...serviceTotals.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const top = serviceRevenue[0];

    const trajectory = buildPerformanceTrajectory(
      granularity,
      periodFromIso,
      periodToIso,
      periodTransactions,
      timeZone,
    );

    const peakAnalysis = buildPeakAnalysisInsights(
      periodTransactions,
      periodToIso,
      timeZone,
      calendarSystem,
    );
    const monthDayHeatmap =
      granularity === "month"
        ? buildMonthDayHeatmap(transactions, heatmapAnchor, timeZone, calendarSystem)
        : null;

    const incomeInPeriod = periodTransactions.filter((tx) => tx.type === "INCOME");
    const customerIds = [
      ...new Set(
        incomeInPeriod
          .map((tx) => tx.customer_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const customersById = await this.customerService.mapByIds(customerIds);
    const customerInsights = computeCustomerPeriodInsights(
      incomeInPeriod,
      customersById,
      periodFromIso,
      periodToIso,
    );

    return {
      revenue,
      expenses,
      profit: periodMetrics.profit,
      patronCount,
      averageSale: patronCount > 0 ? revenue / patronCount : 0,
      dailyNetRevenue,
      topServiceName: top?.name ?? null,
      topServiceCount: serviceRevenue.length,
      serviceRevenue,
      trajectory,
      peakAnalysis,
      monthDayHeatmap,
      periodComparison,
      earliestTransactionDate,
      customerInsights,
    };
  }
}

export { groupTransactionsByDay } from "@/utils/group-transactions-by-day";
