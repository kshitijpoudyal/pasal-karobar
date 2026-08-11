export const CALENDAR_SYSTEMS = ["AD", "BS"] as const;

export type CalendarSystem = (typeof CALENDAR_SYSTEMS)[number];

export const DEFAULT_CALENDAR_SYSTEM: CalendarSystem = "BS";

export const BS_MONTH_LABELS = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export function resolveCalendarSystem(value?: string | null): CalendarSystem {
  const trimmed = value?.trim();
  if (trimmed === "AD" || trimmed === "BS") return trimmed;
  return DEFAULT_CALENDAR_SYSTEM;
}

export function calendarSystemLabel(system: CalendarSystem): string {
  return system === "BS" ? "B.S. (Bikram Sambat)" : "A.D. (Gregorian)";
}
