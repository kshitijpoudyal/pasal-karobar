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
  isBefore,
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

import {
  DEFAULT_BUSINESS_TIMEZONE,
  businessTodayDateKey,
  endOfZonedDay,
  getActivityDateRangeInTimeZone,
  startOfZonedDay,
  zonedPeriodBounds,
} from "@/utils/business-datetime";

export type ActivityTimeframe = "This Week" | "This Month" | "This Year";

export type ActivityCategoryFilter = "All" | "Income" | "Expense";

export function getActivityDateRange(
  timeframe: ActivityTimeframe,
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  now: Date = new Date(),
): {
  from: string;
  to: string;
} {
  return getActivityDateRangeInTimeZone(timeframe, timeZone, now);
}

export type DashboardGranularity = "day" | "week" | "month" | "year";

const WEEK_OPTS = { weekStartsOn: 1 as const };

/** @deprecated Use DashboardGranularity */
export type DashboardPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export function resolveDashboardRange(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): { from: string; to: string } {
  return zonedPeriodBounds(granularity, anchorDate, timeZone, now);
}

export function resolvePriorDashboardRange(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
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
  return resolveDashboardRange(granularity, priorAnchor, now, timeZone);
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
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): boolean {
  const { to } = resolveDashboardRange(granularity, anchorDate, now, timeZone);
  const todayKey = businessTodayDateKey(timeZone, now);
  const todayEnd = endOfZonedDay(todayKey, timeZone);
  return parseISO(to).getTime() >= todayEnd.getTime();
}

export function clampAnchorToToday(
  anchorDate: Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): Date {
  const todayKey = businessTodayDateKey(timeZone, now);
  const todayEnd = endOfZonedDay(todayKey, timeZone);
  if (isAfter(anchorDate, todayEnd)) {
    return startOfZonedDay(todayKey, timeZone);
  }
  return anchorDate;
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

export function clampAnchorToDataBounds(
  anchorDate: Date,
  earliestData: Date | null,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): Date {
  let date = clampAnchorToToday(anchorDate, now, timeZone);
  if (earliestData) {
    const minDay = startOfZonedDay(
      businessTodayDateKey(timeZone, earliestData),
      timeZone,
    );
    if (isBefore(date, minDay)) date = minDay;
  }
  return date;
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
