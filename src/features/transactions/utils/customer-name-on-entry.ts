import type { Customer } from "@/types/database";
import { parseNepalPhone } from "@/utils/phone-np";

export type CustomerNameSavePlan = "skip" | "apply" | "needs_confirm";

export function planCustomerNameSaveOnEntry(
  customers: Customer[],
  phoneRaw: string,
  nameRaw: string,
): CustomerNameSavePlan {
  const name = nameRaw.trim();
  const phone = phoneRaw.trim();
  if (!phone || !name) return "skip";

  const parsed = parseNepalPhone(phone);
  if (!parsed.ok) return "skip";

  const existing = customers.find(
    (customer) => customer.phone_normalized === parsed.normalized,
  );
  const existingName = existing?.name?.trim() ?? "";
  if (existingName === name) return "skip";
  if (!existingName) return "apply";
  return "needs_confirm";
}
