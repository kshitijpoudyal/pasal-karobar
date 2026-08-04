import {
  addDays,
  addMonths,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";

export type ActivityTimeframe = "This Week" | "This Month" | "This Year";

export type ActivityCategoryFilter = "All" | "Income" | "Expense";

export function getActivityDateRange(timeframe: ActivityTimeframe): {
  from: string;
  to: string;
} {
  const now = new Date();
  const to = endOfDay(now).toISOString();
  switch (timeframe) {
    case "This Week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    case "This Month":
      return {
        from: startOfMonth(now).toISOString(),
        to,
      };
    case "This Year":
      return {
        from: startOfYear(now).toISOString(),
        to,
      };
  }
}

export type DashboardGranularity = "day" | "week" | "month" | "year";

const WEEK_OPTS = { weekStartsOn: 1 as const };

/** @deprecated Use DashboardGranularity */
export type DashboardPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export function resolveDashboardRange(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
): { from: string; to: string } {
  const todayEnd = endOfDay(now);
  let from: Date;
  let to: Date;

  switch (granularity) {
    case "day":
      from = startOfDay(anchorDate);
      to = endOfDay(anchorDate);
      break;
    case "week":
      from = startOfWeek(anchorDate, WEEK_OPTS);
      to = endOfWeek(anchorDate, WEEK_OPTS);
      break;
    case "month":
      from = startOfMonth(anchorDate);
      to = endOfMonth(anchorDate);
      break;
    case "year":
      from = startOfYear(anchorDate);
      to = endOfYear(anchorDate);
      break;
  }

  if (isAfter(to, todayEnd)) {
    to = todayEnd;
  }
  if (isAfter(from, todayEnd)) {
    from = startOfDay(todayEnd);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

export function resolvePriorDashboardRange(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
): { from: string; to: string } {
  let priorAnchor: Date;
  switch (granularity) {
    case "day":
      priorAnchor = subDays(anchorDate, 1);
      break;
    case "week":
      priorAnchor = subWeeks(anchorDate, 1);
      break;
    case "month":
      priorAnchor = subMonths(anchorDate, 1);
      break;
    case "year":
      priorAnchor = subYears(anchorDate, 1);
      break;
  }
  return resolveDashboardRange(granularity, priorAnchor, now);
}

export function stepDashboardAnchor(
  granularity: DashboardGranularity,
  anchorDate: Date,
  direction: -1 | 1,
): Date {
  switch (granularity) {
    case "day":
      return addDays(anchorDate, direction);
    case "week":
      return addDays(anchorDate, 7 * direction);
    case "month":
      return addMonths(anchorDate, direction);
    case "year":
      return addYears(anchorDate, direction);
  }
}

export function isDashboardAtLatest(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
): boolean {
  const { to } = resolveDashboardRange(granularity, anchorDate, now);
  return endOfDay(parseISO(to)).getTime() >= endOfDay(now).getTime();
}

export function formatDashboardScrubberLabel(
  granularity: DashboardGranularity,
  anchorDate: Date,
  range: { from: string; to: string },
): string {
  const from = parseISO(range.from);
  const to = parseISO(range.to);

  switch (granularity) {
    case "day":
      return format(from, "EEE, d MMM yyyy");
    case "week":
      return `${format(from, "d MMM")} – ${format(to, "d MMM yyyy")}`;
    case "month":
      return format(from, "MMMM yyyy");
    case "year":
      return format(from, "yyyy");
  }
}

export function formatDashboardComparisonLabel(
  granularity: DashboardGranularity,
): string {
  switch (granularity) {
    case "day":
      return "vs yesterday";
    case "week":
      return "vs last week";
    case "month":
      return "vs last month";
    case "year":
      return "vs last year";
  }
}

export function clampAnchorToToday(anchorDate: Date, now: Date = new Date()): Date {
  const end = endOfDay(now);
  if (isAfter(anchorDate, end)) return startOfDay(now);
  return anchorDate;
}

/** @deprecated Use resolveDashboardRange with anchor = now */
export const DASHBOARD_YEARLY_LOOKBACK = 5;

/** @deprecated Use resolveDashboardRange */
export function getDashboardDateRange(period: DashboardPeriod): {
  from: string;
  to: string;
} {
  const map: Record<DashboardPeriod, DashboardGranularity> = {
    DAILY: "week",
    WEEKLY: "month",
    MONTHLY: "year",
    YEARLY: "year",
  };
  const granularity = map[period];
  const now = new Date();
  if (period === "YEARLY") {
    return resolveDashboardRange(
      "year",
      subYears(now, DASHBOARD_YEARLY_LOOKBACK - 1),
      now,
    );
  }
  return resolveDashboardRange(granularity, now, now);
}

/** @deprecated Use formatDashboardScrubberLabel */
export function formatDashboardPeriodLabel(
  period: DashboardPeriod,
  range: { from: string; to: string },
): string {
  const map: Record<DashboardPeriod, DashboardGranularity> = {
    DAILY: "week",
    WEEKLY: "month",
    MONTHLY: "year",
    YEARLY: "year",
  };
  return formatDashboardScrubberLabel(map[period], parseISO(range.to), range);
}
