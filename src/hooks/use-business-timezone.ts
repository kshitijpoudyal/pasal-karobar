"use client";

import { useBusinessDateSettings } from "@/hooks/use-business-date-settings";

export function useBusinessTimeZone(): string {
  return useBusinessDateSettings().timeZone;
}
