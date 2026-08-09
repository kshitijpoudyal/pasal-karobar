import type { PaymentMethod } from "@/types/database";

export type UiPaymentMethod =
  | "Cash"
  | "eSewa"
  | "Khalti"
  | "eBank"
  | "fonPay";

const UI_TO_DB: Record<UiPaymentMethod, PaymentMethod> = {
  Cash: "CASH",
  eSewa: "ESEWA",
  Khalti: "KHALTI",
  eBank: "BANK_TRANSFER",
  fonPay: "FONEPAY",
};

const DB_TO_UI: Record<PaymentMethod, UiPaymentMethod | string> = {
  CASH: "Cash",
  ESEWA: "eSewa",
  KHALTI: "Khalti",
  BANK_TRANSFER: "Bank Transfer",
  FONEPAY: "FonePay",
  OTHER: "Other",
};

export function uiPaymentToDb(method: UiPaymentMethod): PaymentMethod {
  return UI_TO_DB[method];
}

export function dbPaymentToLabel(method: PaymentMethod): string {
  return DB_TO_UI[method] ?? method;
}
