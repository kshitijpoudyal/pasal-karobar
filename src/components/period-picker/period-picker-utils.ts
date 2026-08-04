import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import type { DashboardGranularity } from "@/utils/date-ranges";

export type PeriodPickerMode = Extract<
  DashboardGranularity,
  "day" | "week" | "month" | "year"
>;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Calendar columns: Sunday → Saturday (matches design mock). */
const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const YEAR_PAGE_ORIGIN = 2000;
const YEARS_PER_PAGE = 12;

export function calendarCellsForMonth(viewMonth: Date): Date[] {
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = addDaysSundayStart(monthStart, -monthStart.getDay());
  const gridEnd = addDaysSundayStart(monthEnd, 6 - monthEnd.getDay());
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

function addDaysSundayStart(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

export function yearPageStartFor(year: number): number {
  const offset = Math.floor((year - YEAR_PAGE_ORIGIN) / YEARS_PER_PAGE);
  return YEAR_PAGE_ORIGIN + offset * YEARS_PER_PAGE;
}

export function yearsOnPage(pageStart: number): number[] {
  return Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);
}

export function isFutureDay(day: Date, now: Date = new Date()): boolean {
  return isAfter(startOfDay(day), startOfDay(now));
}

export function isFutureMonth(year: number, monthIndex: number, now = new Date()): boolean {
  const candidate = new Date(year, monthIndex, 1);
  return isAfter(startOfMonth(candidate), startOfMonth(now));
}

export function isFutureYear(year: number, now = new Date()): boolean {
  return year > getYear(now);
}

export function isBeforeEarliestDay(
  day: Date,
  earliest: Date | null | undefined,
): boolean {
  if (!earliest) return false;
  return isBefore(startOfDay(day), startOfDay(earliest));
}

export function isBeforeEarliestMonth(
  year: number,
  monthIndex: number,
  earliest: Date | null | undefined,
): boolean {
  if (!earliest) return false;
  const candidate = startOfMonth(new Date(year, monthIndex, 1));
  return isBefore(candidate, startOfMonth(earliest));
}

export function isBeforeEarliestYear(
  year: number,
  earliest: Date | null | undefined,
): boolean {
  if (!earliest) return false;
  return year < getYear(earliest);
}

export function isViewMonthBeforeEarliest(
  viewMonth: Date,
  earliest: Date | null | undefined,
): boolean {
  if (!earliest) return false;
  return isBefore(startOfMonth(viewMonth), startOfMonth(earliest));
}

export function isYearPageBeforeEarliest(
  pageStart: number,
  earliest: Date | null | undefined,
): boolean {
  if (!earliest) return false;
  return pageStart <= yearPageStartFor(getYear(earliest));
}

export function weekIntervalForAnchor(anchor: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(anchor, { weekStartsOn: 1 }),
    end: endOfWeek(anchor, { weekStartsOn: 1 }),
  };
}

export function isDayInSelectedWeek(
  day: Date,
  draft: Date,
  mode: PeriodPickerMode,
): boolean {
  if (mode !== "week") return false;
  const { start, end } = weekIntervalForAnchor(draft);
  return isWithinInterval(startOfDay(day), { start, end });
}

export {
  MONTH_LABELS,
  WEEKDAY_HEADERS,
  YEAR_PAGE_ORIGIN,
  YEARS_PER_PAGE,
  addMonths,
  subMonths,
  addYears,
  format,
  getYear,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfDay,
};
