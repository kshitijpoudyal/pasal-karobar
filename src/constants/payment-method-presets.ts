import type { PaymentMethod } from "@/types/database";

export type PaymentMethodPresetCode = Exclude<PaymentMethod, "OTHER">;

export const PAYMENT_METHOD_PRESET_CODES = [
  "CASH",
  "ESEWA",
  "KHALTI",
  "BANK_TRANSFER",
  "FONEPAY",
] as const satisfies readonly PaymentMethodPresetCode[];

export const PAYMENT_METHOD_DEFAULT_LABELS: Record<PaymentMethodPresetCode, string> = {
  CASH: "Cash",
  ESEWA: "eSewa",
  KHALTI: "Khalti",
  BANK_TRANSFER: "eBank",
  FONEPAY: "fonPay",
};

export const DEFAULT_BUSINESS_PAYMENT_METHODS: {
  method_code: PaymentMethod;
  label: string;
  display_order: number;
}[] = PAYMENT_METHOD_PRESET_CODES.map((code, index) => ({
  method_code: code,
  label: PAYMENT_METHOD_DEFAULT_LABELS[code],
  display_order: index + 1,
}));
