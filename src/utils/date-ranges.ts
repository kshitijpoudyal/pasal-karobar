import {
  addDays,
  addMonths,
  addYears,
  format,
  isAfter,
  isBefore,
  parseISO,
  subYears,
} from "date-fns";

import type { CalendarSystem } from "@/constants/calendar-system";
import {
  DEFAULT_BUSINESS_TIMEZONE,
  businessTodayDateKey,
  dateKeyInTimeZone,
  endOfZonedDay,
  formatDashboardScrubberLabelForCalendar,
  getActivityDateRangeInTimeZone,
  startOfZonedDay,
  zonedPeriodBounds,
} from "@/utils/business-datetime";
import {
  adDateKeyToBs,
  bsToAdDateKey,
} from "@/utils/nepali-calendar";

export type ActivityTimeframe = "Today" | "This Week" | "This Month" | "This Year";

export type ActivityCategoryFilter = "All" | "Income" | "Expense";

export type DashboardGranularity = "day" | "week" | "month" | "year";

/** @deprecated Use DashboardGranularity */
export type DashboardPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export function getActivityDateRange(
  timeframe: ActivityTimeframe,
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  now: Date = new Date(),
  calendarSystem: CalendarSystem = "AD",
): {
  from: string;
  to: string;
} {
  return getActivityDateRangeInTimeZone(timeframe, timeZone, now, calendarSystem);
}

export function resolveDashboardRange(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
): { from: string; to: string } {
  return zonedPeriodBounds(granularity, anchorDate, timeZone, now, calendarSystem);
}

function stepBsMonth(
  bsYear: number,
  bsMonth: number,
  direction: -1 | 1,
): { year: number; month: number } {
  let month = bsMonth + direction;
  let year = bsYear;
  if (month > 12) {
    month = 1;
    year += 1;
  } else if (month < 1) {
    month = 12;
    year -= 1;
  }
  return { year, month };
}

export function stepDashboardAnchor(
  granularity: DashboardGranularity,
  anchorDate: Date,
  direction: -1 | 1,
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
): Date {
  if (calendarSystem === "BS" && (granularity === "month" || granularity === "year")) {
    const anchorKey = dateKeyInTimeZone(anchorDate.toISOString(), timeZone);
    const anchorBs = adDateKeyToBs(anchorKey);
    if (anchorBs) {
      if (granularity === "month") {
        const next = stepBsMonth(anchorBs.year, anchorBs.month, direction);
        const nextKey = bsToAdDateKey(next.year, next.month, 1);
        if (nextKey) return startOfZonedDay(nextKey, timeZone);
      }
      if (granularity === "year") {
        const nextKey = bsToAdDateKey(anchorBs.year + direction, 1, 1);
        if (nextKey) return startOfZonedDay(nextKey, timeZone);
      }
    }
  }

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

export function resolvePriorDashboardRange(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
): { from: string; to: string } {
  const priorAnchor = stepDashboardAnchor(
    granularity,
    anchorDate,
    -1,
    timeZone,
    calendarSystem,
  );
  return resolveDashboardRange(granularity, priorAnchor, now, timeZone, calendarSystem);
}

export function isDashboardAtLatest(
  granularity: DashboardGranularity,
  anchorDate: Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
): boolean {
  const { to } = resolveDashboardRange(granularity, anchorDate, now, timeZone, calendarSystem);
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
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
): string {
  const bsLabel = formatDashboardScrubberLabelForCalendar(
    granularity,
    range,
    timeZone,
    calendarSystem,
  );
  if (bsLabel) return bsLabel;

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
