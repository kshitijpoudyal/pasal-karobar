import type { PaymentMethod } from "@/types/database";
import type {
  ActivityCategoryFilter,
  ActivityTimeframe,
} from "@/utils/date-ranges";
import { dbPaymentToLabel } from "@/utils/payment-method";

export type { ActivityCategoryFilter, ActivityTimeframe };

export type ActivityPaymentFilter = "All" | PaymentMethod;

export const TIMEFRAMES = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
] as const satisfies readonly ActivityTimeframe[];

const PAYMENT_METHODS = [
  "CASH",
  "ESEWA",
  "KHALTI",
  "FONEPAY",
  "BANK_TRANSFER",
] as const satisfies readonly PaymentMethod[];

export const PAYMENT_FILTERS: {
  value: ActivityPaymentFilter;
  label: string;
}[] = [
  { value: "All", label: "All" },
  ...PAYMENT_METHODS.map((method) => ({
    value: method,
    label: dbPaymentToLabel(method),
  })),
];

export function activitySecondaryFilterSummary(
  category: ActivityCategoryFilter,
  paymentMethod: ActivityPaymentFilter,
): string | null {
  const parts: string[] = [];
  if (category !== "All") parts.push(category);
  if (paymentMethod !== "All") {
    parts.push(dbPaymentToLabel(paymentMethod));
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function hasActivitySecondaryFilters(
  category: ActivityCategoryFilter,
  paymentMethod: ActivityPaymentFilter,
): boolean {
  return category !== "All" || paymentMethod !== "All";
}
