import NepaliDate, { dateConfigMap } from "nepali-date-converter";

import { BS_MONTH_LABELS } from "@/constants/calendar-system";
import { parseDateKey, startOfZonedDay } from "@/utils/business-datetime";

const BS_MONTH_KEYS = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export type BsDateParts = {
  year: number;
  /** 1–12 (Baisakh = 1) */
  month: number;
  day: number;
};

export type BsDateKeyBounds = {
  fromKey: string;
  toKey: string;
};

function adPartsFromDateKey(dateKey: string): { year: number; month: number; day: number } {
  return parseDateKey(dateKey);
}

function adDateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toBsMonthIndex(monthOneIndexed: number): number {
  return monthOneIndexed - 1;
}

function toBsMonthOneIndexed(monthIndex: number): number {
  return monthIndex + 1;
}

function safeNepaliDateFromAd(dateKey: string): NepaliDate | null {
  try {
    const { year, month, day } = adPartsFromDateKey(dateKey);
    return NepaliDate.fromAD(new Date(year, month - 1, day));
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("[nepali-calendar] unsupported AD dateKey", dateKey);
    }
    return null;
  }
}

function safeNepaliDateFromBs(
  year: number,
  monthOneIndexed: number,
  day: number,
): NepaliDate | null {
  try {
    return new NepaliDate(year, toBsMonthIndex(monthOneIndexed), day);
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("[nepali-calendar] unsupported BS date", { year, monthOneIndexed, day });
    }
    return null;
  }
}

export function adDateKeyToBs(dateKey: string): BsDateParts | null {
  const nd = safeNepaliDateFromAd(dateKey);
  if (!nd) return null;
  const bs = nd.getBS();
  return {
    year: bs.year,
    month: toBsMonthOneIndexed(bs.month),
    day: bs.date,
  };
}

export function bsToAdDateKey(
  year: number,
  monthOneIndexed: number,
  day: number,
): string | null {
  const nd = safeNepaliDateFromBs(year, monthOneIndexed, day);
  if (!nd) return null;
  const ad = nd.getAD();
  return adDateKeyFromParts(ad.year, ad.month + 1, ad.date);
}

export function daysInBsMonth(bsYear: number, monthOneIndexed: number): number {
  const yearConfig = dateConfigMap[String(bsYear)];
  if (!yearConfig) {
    const nd = safeNepaliDateFromBs(bsYear, monthOneIndexed, 1);
    if (!nd) return 30;
    const next = safeNepaliDateFromBs(
      monthOneIndexed === 12 ? bsYear + 1 : bsYear,
      monthOneIndexed === 12 ? 1 : monthOneIndexed + 1,
      1,
    );
    if (!next) return 30;
    const start = nd.toJsDate().getTime();
    const end = next.toJsDate().getTime();
    return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)));
  }
  const key = BS_MONTH_KEYS[toBsMonthIndex(monthOneIndexed)];
  if (!key) return 30;
  return yearConfig[key];
}

export function bsMonthBounds(
  bsYear: number,
  monthOneIndexed: number,
): BsDateKeyBounds | null {
  const fromKey = bsToAdDateKey(bsYear, monthOneIndexed, 1);
  const lastDay = daysInBsMonth(bsYear, monthOneIndexed);
  const toKey = bsToAdDateKey(bsYear, monthOneIndexed, lastDay);
  if (!fromKey || !toKey) return null;
  return { fromKey, toKey };
}

export function bsYearBounds(bsYear: number): BsDateKeyBounds | null {
  const fromKey = bsToAdDateKey(bsYear, 1, 1);
  const lastDay = daysInBsMonth(bsYear, 12);
  const toKey = bsToAdDateKey(bsYear, 12, lastDay);
  if (!fromKey || !toKey) return null;
  return { fromKey, toKey };
}

export function bsMonthLabel(monthOneIndexed: number): string {
  return BS_MONTH_LABELS[toBsMonthIndex(monthOneIndexed)] ?? "";
}

export function formatBsDayShort(dateKey: string): string | null {
  const nd = safeNepaliDateFromAd(dateKey);
  if (!nd) return null;
  const bs = nd.getBS();
  return `${bs.date} ${bsMonthLabel(toBsMonthOneIndexed(bs.month))}`;
}

export function formatBsDayLong(dateKey: string): string | null {
  const nd = safeNepaliDateFromAd(dateKey);
  if (!nd) return null;
  return nd.format("ddd, D MMMM YYYY");
}

export function formatBsMonthYear(dateKey: string): string | null {
  const nd = safeNepaliDateFromAd(dateKey);
  if (!nd) return null;
  return nd.format("MMMM YYYY");
}

export function formatBsYear(dateKey: string): string | null {
  const nd = safeNepaliDateFromAd(dateKey);
  if (!nd) return null;
  return String(nd.getYear());
}

export function formatBsWeekday(dateKey: string): string | null {
  const nd = safeNepaliDateFromAd(dateKey);
  if (!nd) return null;
  return nd.format("dddd");
}

export function adDateKeyToAnchorDate(dateKey: string, timeZone: string): Date {
  return startOfZonedDay(dateKey, timeZone);
}

export function bsDateToAnchorDate(
  bsYear: number,
  monthOneIndexed: number,
  day: number,
  timeZone: string,
): Date | null {
  const adKey = bsToAdDateKey(bsYear, monthOneIndexed, day);
  if (!adKey) return null;
  return startOfZonedDay(adKey, timeZone);
}

export function calendarCellsForBsMonth(
  bsYear: number,
  monthOneIndexed: number,
  timeZone: string,
): { adDateKey: string; bsDay: number; weekdayIndex: number }[] {
  const days = daysInBsMonth(bsYear, monthOneIndexed);
  const cells: { adDateKey: string; bsDay: number; weekdayIndex: number }[] = [];

  for (let day = 1; day <= days; day += 1) {
    const adKey = bsToAdDateKey(bsYear, monthOneIndexed, day);
    if (!adKey) continue;
    const nd = safeNepaliDateFromAd(adKey);
    if (!nd) continue;
    cells.push({
      adDateKey: adKey,
      bsDay: day,
      weekdayIndex: nd.getDay(),
    });
  }

  if (cells.length === 0) return cells;

  const firstWeekday = cells[0]!.weekdayIndex;
  for (let pad = 0; pad < firstWeekday; pad += 1) {
    cells.unshift({
      adDateKey: "",
      bsDay: 0,
      weekdayIndex: pad,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      adDateKey: "",
      bsDay: 0,
      weekdayIndex: cells.length % 7,
    });
  }

  void timeZone;
  return cells;
}

export function bsMonthOptions(): { value: number; label: string }[] {
  return BS_MONTH_LABELS.map((label, index) => ({
    value: index + 1,
    label,
  }));
}

export { BS_MONTH_LABELS };
