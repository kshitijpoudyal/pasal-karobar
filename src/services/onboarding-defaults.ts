import type { BusinessType } from "@/types/database";

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
  business_type: "BARBER" as BusinessType,
  currency: "NPR",
  timezone: "Asia/Kathmandu",
} as const;
