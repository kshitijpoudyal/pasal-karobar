import { format, getHours, parseISO } from "date-fns";

import type { CalendarSystem } from "@/constants/calendar-system";
import type { ActivityTimeframe } from "@/utils/date-ranges";
import type { DashboardGranularity } from "@/utils/date-ranges";
import type { Transaction } from "@/types/database";
import {
  adDateKeyToBs,
  bsMonthBounds,
  bsMonthLabel,
  bsYearBounds,
  formatBsDayLong,
  formatBsDayShort,
  formatBsMonthYear,
  formatBsWeekday,
} from "@/utils/nepali-calendar";

export const DEFAULT_BUSINESS_TIMEZONE = "Asia/Kathmandu";

export function resolveBusinessTimeZone(timeZone?: string | null): string {
  const trimmed = timeZone?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_BUSINESS_TIMEZONE;
}

function instantFromIso(iso: string): Date {
  return parseISO(iso);
}

function calendarPartsInTimeZone(
  iso: string,
  timeZone: string,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instantFromIso(iso));
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

export function dateKeyInTimeZone(iso: string, timeZone: string): string {
  const { year, month, day } = calendarPartsInTimeZone(iso, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function hourInTimeZone(iso: string, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instantFromIso(iso));
  const hourPart = parts.find((p) => p.type === "hour");
  return hourPart ? Number.parseInt(hourPart.value, 10) : 0;
}

export function isoDayInTimeZone(iso: string, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(instantFromIso(iso));
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[weekday] ?? 1;
}

export function formatTimeInBusinessZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instantFromIso(iso));
}

export function businessTimeZoneShortLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortGeneric",
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    return name ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function parseDateKey(dateKey: string): {
  year: number;
  month: number;
  day: number;
} {
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  return {
    year: Number.parseInt(yearStr ?? "0", 10),
    month: Number.parseInt(monthStr ?? "0", 10),
    day: Number.parseInt(dayStr ?? "0", 10),
  };
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(utc.getUTCDate()).padStart(2, "0")}`;
}

export function startOfZonedDay(dateKey: string, timeZone: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  let low = Date.UTC(year, month - 1, day - 1, 0, 0, 0);
  let high = Date.UTC(year, month - 1, day + 1, 23, 59, 59);
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const midKey = dateKeyInTimeZone(new Date(mid).toISOString(), timeZone);
    if (midKey < dateKey) low = mid + 1;
    else high = mid;
  }
  return new Date(low);
}

export function endOfZonedDay(dateKey: string, timeZone: string): Date {
  const nextKey = addDaysToDateKey(dateKey, 1);
  return new Date(startOfZonedDay(nextKey, timeZone).getTime() - 1);
}

export function businessTodayDateKey(timeZone: string, now: Date = new Date()): string {
  return dateKeyInTimeZone(now.toISOString(), timeZone);
}

export function formatDayLabelForDateKey(
  dateKey: string,
  timeZone: string,
  now: Date = new Date(),
  calendarSystem: CalendarSystem = "AD",
): string {
  const todayKey = businessTodayDateKey(timeZone, now);
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const labelDate = parseISO(`${dateKey}T12:00:00`);

  if (calendarSystem === "BS") {
    const bsShort = formatBsDayShort(dateKey);
    if (!bsShort) {
      return format(labelDate, "EEEE, do MMM");
    }
    if (dateKey === todayKey) {
      return `Today, ${bsShort}`;
    }
    if (dateKey === yesterdayKey) {
      return `Yesterday, ${bsShort}`;
    }
    const weekday = formatBsWeekday(dateKey);
    return weekday ? `${weekday}, ${bsShort}` : (formatBsDayLong(dateKey) ?? bsShort);
  }

  if (dateKey === todayKey) {
    return `Today, ${format(labelDate, "do MMM")}`;
  }
  if (dateKey === yesterdayKey) {
    return `Yesterday, ${format(labelDate, "do MMM")}`;
  }
  return format(labelDate, "EEEE, do MMM");
}

function zonedPeriodBoundsAd(
  granularity: DashboardGranularity,
  anchorKey: string,
  timeZone: string,
): { fromKey: string; toKey: string } {
  switch (granularity) {
    case "day":
      return { fromKey: anchorKey, toKey: anchorKey };
    case "week": {
      const isoDay = isoDayInTimeZone(
        startOfZonedDay(anchorKey, timeZone).toISOString(),
        timeZone,
      );
      const fromKey = addDaysToDateKey(anchorKey, -(isoDay - 1));
      return { fromKey, toKey: addDaysToDateKey(fromKey, 6) };
    }
    case "month": {
      const { year, month } = parseDateKey(anchorKey);
      const fromKey = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const toKey = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { fromKey, toKey };
    }
    case "year": {
      const y = Number.parseInt(anchorKey.slice(0, 4), 10);
      return { fromKey: `${y}-01-01`, toKey: `${y}-12-31` };
    }
  }
}

function zonedPeriodBoundsBs(
  granularity: DashboardGranularity,
  anchorKey: string,
  timeZone: string,
): { fromKey: string; toKey: string } | null {
  const anchorBs = adDateKeyToBs(anchorKey);
  if (!anchorBs) return null;

  switch (granularity) {
    case "day":
      return { fromKey: anchorKey, toKey: anchorKey };
    case "week": {
      const isoDay = isoDayInTimeZone(
        startOfZonedDay(anchorKey, timeZone).toISOString(),
        timeZone,
      );
      const fromKey = addDaysToDateKey(anchorKey, -(isoDay - 1));
      return { fromKey, toKey: addDaysToDateKey(fromKey, 6) };
    }
    case "month":
      return bsMonthBounds(anchorBs.year, anchorBs.month);
    case "year":
      return bsYearBounds(anchorBs.year);
  }
}

export function zonedPeriodBounds(
  granularity: DashboardGranularity,
  anchorDate: Date,
  timeZone: string,
  now: Date = new Date(),
  calendarSystem: CalendarSystem = "AD",
): { from: string; to: string } {
  const anchorKey = dateKeyInTimeZone(anchorDate.toISOString(), timeZone);
  const todayKey = businessTodayDateKey(timeZone, now);
  const todayEnd = endOfZonedDay(todayKey, timeZone);

  const bounds =
    calendarSystem === "BS"
      ? (zonedPeriodBoundsBs(granularity, anchorKey, timeZone) ??
        zonedPeriodBoundsAd(granularity, anchorKey, timeZone))
      : zonedPeriodBoundsAd(granularity, anchorKey, timeZone);

  let from = startOfZonedDay(bounds.fromKey, timeZone);
  let to = endOfZonedDay(bounds.toKey, timeZone);

  if (to.getTime() > todayEnd.getTime()) {
    to = todayEnd;
  }
  if (from.getTime() > todayEnd.getTime()) {
    from = startOfZonedDay(todayKey, timeZone);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

function getActivityDateRangeAd(
  timeframe: ActivityTimeframe,
  todayKey: string,
  timeZone: string,
  now: Date,
): { fromKey: string; toKey: string } {
  switch (timeframe) {
    case "Today":
      return { fromKey: todayKey, toKey: todayKey };
    case "This Week": {
      const isoDay = isoDayInTimeZone(now.toISOString(), timeZone);
      const weekStartKey = addDaysToDateKey(todayKey, -(isoDay - 1));
      return { fromKey: weekStartKey, toKey: addDaysToDateKey(weekStartKey, 6) };
    }
    case "This Month": {
      const { year, month } = parseDateKey(todayKey);
      return {
        fromKey: `${year}-${String(month).padStart(2, "0")}-01`,
        toKey: todayKey,
      };
    }
    case "This Year": {
      const y = Number.parseInt(todayKey.slice(0, 4), 10);
      return { fromKey: `${y}-01-01`, toKey: todayKey };
    }
  }
}

function getActivityDateRangeBs(
  timeframe: ActivityTimeframe,
  todayKey: string,
  timeZone: string,
  now: Date,
): { fromKey: string; toKey: string } | null {
  const todayBs = adDateKeyToBs(todayKey);
  if (!todayBs) return null;

  switch (timeframe) {
    case "Today":
      return { fromKey: todayKey, toKey: todayKey };
    case "This Week": {
      const isoDay = isoDayInTimeZone(now.toISOString(), timeZone);
      const weekStartKey = addDaysToDateKey(todayKey, -(isoDay - 1));
      return { fromKey: weekStartKey, toKey: addDaysToDateKey(weekStartKey, 6) };
    }
    case "This Month": {
      const bounds = bsMonthBounds(todayBs.year, todayBs.month);
      if (!bounds) return null;
      return { fromKey: bounds.fromKey, toKey: todayKey };
    }
    case "This Year": {
      const bounds = bsYearBounds(todayBs.year);
      if (!bounds) return null;
      return { fromKey: bounds.fromKey, toKey: todayKey };
    }
  }
}

export function getActivityDateRangeInTimeZone(
  timeframe: ActivityTimeframe,
  timeZone: string,
  now: Date = new Date(),
  calendarSystem: CalendarSystem = "AD",
): { from: string; to: string } {
  const todayKey = businessTodayDateKey(timeZone, now);
  const to = endOfZonedDay(todayKey, timeZone).toISOString();
  const keys =
    calendarSystem === "BS"
      ? (getActivityDateRangeBs(timeframe, todayKey, timeZone, now) ??
        getActivityDateRangeAd(timeframe, todayKey, timeZone, now))
      : getActivityDateRangeAd(timeframe, todayKey, timeZone, now);

  return {
    from: startOfZonedDay(keys.fromKey, timeZone).toISOString(),
    to: timeframe === "Today" ? to : endOfZonedDay(keys.toKey, timeZone).toISOString(),
  };
}

export function formatDashboardScrubberLabelForCalendar(
  granularity: DashboardGranularity,
  range: { from: string; to: string },
  timeZone: string,
  calendarSystem: CalendarSystem,
): string | null {
  if (calendarSystem !== "BS") return null;

  const fromKey = dateKeyInTimeZone(range.from, timeZone);
  const toKey = dateKeyInTimeZone(range.to, timeZone);

  switch (granularity) {
    case "day":
      return formatBsDayLong(fromKey);
    case "week": {
      const fromShort = formatBsDayShort(fromKey);
      const toShort = formatBsDayShort(toKey);
      const toYear = adDateKeyToBs(toKey)?.year;
      if (!fromShort || !toShort || !toYear) return null;
      return `${fromShort} – ${toShort} ${toYear}`;
    }
    case "month":
      return formatBsMonthYear(fromKey);
    case "year": {
      const bs = adDateKeyToBs(fromKey);
      return bs ? String(bs.year) : null;
    }
  }
}

export function formatBsMonthYearFromDateKey(dateKey: string): string | null {
  return formatBsMonthYear(dateKey);
}

export function formatBsMonthYearLabel(bsYear: number, bsMonth: number): string {
  return `${bsMonthLabel(bsMonth)} ${bsYear}`;
}

export function groupTransactionsByDayInTimeZone(
  transactions: Transaction[],
  timeZone: string,
): [string, Transaction[]][] {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = dateKeyInTimeZone(tx.transaction_date, timeZone);
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}

const mismatchLoggedContexts = new Set<string>();

export function logTimezoneFormatMismatch(
  iso: string,
  businessTimeZone: string,
  context: string,
): void {
  if (process.env.NODE_ENV !== "development") return;
  if (process.env.NEXT_PUBLIC_DEBUG_TZ === "0") return;
  const key = `${context}:${iso.slice(0, 19)}`;
  if (mismatchLoggedContexts.has(key)) return;

  const businessHour = hourInTimeZone(iso, businessTimeZone);
  const localHour = getHours(parseISO(iso));
  if (businessHour === localHour) return;

  mismatchLoggedContexts.add(key);
  console.debug("[business-datetime] local vs business hour mismatch", {
    context,
    iso,
    businessTimeZone,
    businessHour,
    localHour,
  });
}
