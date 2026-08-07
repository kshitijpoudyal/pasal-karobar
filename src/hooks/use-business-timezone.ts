"use client";

import { useActiveBusiness } from "@/providers/business-provider";
import { resolveBusinessTimeZone } from "@/utils/business-datetime";

export function useBusinessTimeZone(): string {
  const { business } = useActiveBusiness();
  return resolveBusinessTimeZone(business?.timezone);
}
