"use client";

import { useEffect } from "react";

import {
  resolveCalendarSystem,
  type CalendarSystem,
} from "@/constants/calendar-system";
import { useActiveBusiness } from "@/providers/business-provider";
import { resolveBusinessTimeZone } from "@/utils/business-datetime";
import { preloadNepaliCalendar } from "@/utils/nepali-calendar";

export function useBusinessDateSettings(): {
  timeZone: string;
  calendarSystem: CalendarSystem;
} {
  const { business } = useActiveBusiness();
  const timeZone = resolveBusinessTimeZone(business?.timezone);
  const calendarSystem = resolveCalendarSystem(business?.calendar_system);

  useEffect(() => {
    if (calendarSystem === "BS") {
      void preloadNepaliCalendar();
    }
  }, [calendarSystem]);

  return { timeZone, calendarSystem };
}
