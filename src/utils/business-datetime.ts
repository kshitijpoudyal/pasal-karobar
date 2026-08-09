import { format, getHours, parseISO } from "date-fns";

import type { ActivityTimeframe } from "@/utils/date-ranges";
import type { DashboardGranularity } from "@/utils/date-ranges";
import type { Transaction } from "@/types/database";

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

export function formatTimeInBusinessZone(
  iso: string,
  timeZone: string,
): string {
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

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
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

export function businessTodayDateKey(
  timeZone: string,
  now: Date = new Date(),
): string {
  return dateKeyInTimeZone(now.toISOString(), timeZone);
}

export function formatDayLabelForDateKey(
  dateKey: string,
  timeZone: string,
  now: Date = new Date(),
): string {
  const todayKey = businessTodayDateKey(timeZone, now);
  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  const labelDate = parseISO(`${dateKey}T12:00:00`);

  if (dateKey === todayKey) {
    return `Today, ${format(labelDate, "do MMM")}`;
  }
  if (dateKey === yesterdayKey) {
    return `Yesterday, ${format(labelDate, "do MMM")}`;
  }
  return format(labelDate, "EEEE, do MMM");
}

export function zonedPeriodBounds(
  granularity: DashboardGranularity,
  anchorDate: Date,
  timeZone: string,
  now: Date = new Date(),
): { from: string; to: string } {
  const anchorKey = dateKeyInTimeZone(anchorDate.toISOString(), timeZone);
  const todayKey = businessTodayDateKey(timeZone, now);
  const todayEnd = endOfZonedDay(todayKey, timeZone);

  let fromKey: string;
  let toKey: string;

  switch (granularity) {
    case "day":
      fromKey = anchorKey;
      toKey = anchorKey;
      break;
    case "week": {
      const isoDay = isoDayInTimeZone(anchorDate.toISOString(), timeZone);
      fromKey = addDaysToDateKey(anchorKey, -(isoDay - 1));
      toKey = addDaysToDateKey(fromKey, 6);
      break;
    }
    case "month": {
      const { year, month } = parseDateKey(anchorKey);
      fromKey = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      toKey = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      break;
    }
    case "year": {
      const y = Number.parseInt(anchorKey.slice(0, 4), 10);
      fromKey = `${y}-01-01`;
      toKey = `${y}-12-31`;
      break;
    }
  }

  let from = startOfZonedDay(fromKey, timeZone);
  let to = endOfZonedDay(toKey, timeZone);

  if (to.getTime() > todayEnd.getTime()) {
    to = todayEnd;
  }
  if (from.getTime() > todayEnd.getTime()) {
    from = startOfZonedDay(todayKey, timeZone);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

export function getActivityDateRangeInTimeZone(
  timeframe: ActivityTimeframe,
  timeZone: string,
  now: Date = new Date(),
): { from: string; to: string } {
  const todayKey = businessTodayDateKey(timeZone, now);
  const to = endOfZonedDay(todayKey, timeZone).toISOString();

  switch (timeframe) {
    case "Today":
      return {
        from: startOfZonedDay(todayKey, timeZone).toISOString(),
        to,
      };
    case "This Week": {
      const isoDay = isoDayInTimeZone(now.toISOString(), timeZone);
      const weekStartKey = addDaysToDateKey(todayKey, -(isoDay - 1));
      const weekEndKey = addDaysToDateKey(weekStartKey, 6);
      return {
        from: startOfZonedDay(weekStartKey, timeZone).toISOString(),
        to: endOfZonedDay(weekEndKey, timeZone).toISOString(),
      };
    }
    case "This Month": {
      const { year, month } = parseDateKey(todayKey);
      const fromKey = `${year}-${String(month).padStart(2, "0")}-01`;
      return {
        from: startOfZonedDay(fromKey, timeZone).toISOString(),
        to,
      };
    }
    case "This Year": {
      const y = Number.parseInt(todayKey.slice(0, 4), 10);
      return {
        from: startOfZonedDay(`${y}-01-01`, timeZone).toISOString(),
        to,
      };
    }
  }
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
