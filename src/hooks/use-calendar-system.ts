"use client";

import type { CalendarSystem } from "@/constants/calendar-system";
import { useBusinessDateSettings } from "@/hooks/use-business-date-settings";

export function useCalendarSystem(): CalendarSystem {
  return useBusinessDateSettings().calendarSystem;
}
