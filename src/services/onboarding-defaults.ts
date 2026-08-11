import { DEFAULT_CALENDAR_SYSTEM } from "@/constants/calendar-system";
import type { BusinessType } from "@/types/database";
import { DEFAULT_BUSINESS_TIMEZONE } from "@/utils/business-datetime";

import { DEFAULT_BUSINESS_CURRENCY, DEFAULT_BUSINESS_TYPE } from "@/services/business-profile-settings";

export const DEFAULT_SERVICES = [
  { name: "Haircut", default_price: 500, display_order: 1, icon: "hair" as const },
  { name: "Beard Trim", default_price: 350, display_order: 2, icon: "beard" as const },
  { name: "Haircut + Beard", default_price: 700, display_order: 3, icon: "combo" as const },
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Rent", display_order: 1 },
  { name: "Electricity", display_order: 2 },
  { name: "Supplies", display_order: 3 },
] as const;

export const DEFAULT_BOOTSTRAP_BUSINESS = {
  name: "Royal Cuts Barber Shop",
  business_type: DEFAULT_BUSINESS_TYPE satisfies BusinessType,
  calendar_system: DEFAULT_CALENDAR_SYSTEM,
  currency: DEFAULT_BUSINESS_CURRENCY,
  timezone: DEFAULT_BUSINESS_TIMEZONE,
} as const;
