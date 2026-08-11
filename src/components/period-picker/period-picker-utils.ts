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
import {
  businessTodayDateKey,
  dateKeyInTimeZone,
} from "@/utils/business-datetime";
import { adDateKeyToBs } from "@/utils/nepali-calendar";

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

export const BS_YEAR_PAGE_ORIGIN = 2070;
export const BS_YEARS_PER_PAGE = 12;

export function bsYearPageStartFor(year: number): number {
  const offset = Math.floor((year - BS_YEAR_PAGE_ORIGIN) / BS_YEARS_PER_PAGE);
  return BS_YEAR_PAGE_ORIGIN + offset * BS_YEARS_PER_PAGE;
}

export function bsYearsOnPage(pageStart: number): number[] {
  return Array.from({ length: BS_YEARS_PER_PAGE }, (_, i) => pageStart + i);
}

export function stepBsMonthView(
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

export function isFutureBsDateKey(
  adDateKey: string,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  if (!adDateKey) return true;
  return adDateKey > businessTodayDateKey(timeZone, now);
}

export function isBeforeEarliestBsDateKey(
  adDateKey: string,
  earliest: Date | null | undefined,
  timeZone: string,
): boolean {
  if (!adDateKey || !earliest) return false;
  return adDateKey < businessTodayDateKey(timeZone, earliest);
}

export function isFutureBsMonth(
  bsYear: number,
  bsMonth: number,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  const todayBs = adDateKeyToBs(businessTodayDateKey(timeZone, now));
  if (!todayBs) return false;
  return bsYear > todayBs.year || (bsYear === todayBs.year && bsMonth > todayBs.month);
}

export function isBeforeEarliestBsMonth(
  bsYear: number,
  bsMonth: number,
  earliest: Date | null | undefined,
  timeZone: string,
): boolean {
  if (!earliest) return false;
  const earliestBs = adDateKeyToBs(businessTodayDateKey(timeZone, earliest));
  if (!earliestBs) return false;
  return (
    bsYear < earliestBs.year ||
    (bsYear === earliestBs.year && bsMonth < earliestBs.month)
  );
}

export function isFutureBsYear(
  bsYear: number,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  const todayBs = adDateKeyToBs(businessTodayDateKey(timeZone, now));
  if (!todayBs) return false;
  return bsYear > todayBs.year;
}

export function isBeforeEarliestBsYear(
  bsYear: number,
  earliest: Date | null | undefined,
  timeZone: string,
): boolean {
  if (!earliest) return false;
  const earliestBs = adDateKeyToBs(businessTodayDateKey(timeZone, earliest));
  if (!earliestBs) return false;
  return bsYear < earliestBs.year;
}

export function isBsYearPageBeforeEarliest(
  pageStart: number,
  earliest: Date | null | undefined,
  timeZone: string,
): boolean {
  if (!earliest) return false;
  const earliestBs = adDateKeyToBs(businessTodayDateKey(timeZone, earliest));
  if (!earliestBs) return false;
  return pageStart <= bsYearPageStartFor(earliestBs.year);
}

export function anchorBsParts(
  anchorDate: Date,
  timeZone: string,
): { year: number; month: number; day: number } | null {
  const anchorKey = dateKeyInTimeZone(anchorDate.toISOString(), timeZone);
  return adDateKeyToBs(anchorKey);
}

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
