import { parseNepalPhone, type ParsedNepalPhone } from "@/utils/phone-np";

export function customerDetailPath(phoneNormalized: string): string {
  return `/customers/${encodeURIComponent(phoneNormalized)}`;
}

export function parseCustomerPhoneRouteParam(
  param: string,
): ParsedNepalPhone | { ok: false; reason: string } {
  const digits = decodeURIComponent(param).replace(/\D/g, "");
  if (!digits) {
    return { ok: false, reason: "Missing phone number." };
  }
  return parseNepalPhone(digits);
}
