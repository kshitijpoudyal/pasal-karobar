"use client";

import { resolveCalendarSystem, type CalendarSystem } from "@/constants/calendar-system";
import { useActiveBusiness } from "@/providers/business-provider";

export function useCalendarSystem(): CalendarSystem {
  const { business } = useActiveBusiness();
  return resolveCalendarSystem(business?.calendar_system);
}
