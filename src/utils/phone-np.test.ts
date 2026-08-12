import { describe, expect, it } from "vitest";

import {
  parseNepalPhone,
  parseOptionalNepalPhone,
  phoneSearchDigits,
  matchesCustomerNameOrPhone,
} from "@/utils/phone-np";

describe("phone-np", () => {
  it("normalizes 10-digit mobile", () => {
    expect(parseNepalPhone("984-123-4567")).toEqual({
      ok: true,
      normalized: "9841234567",
      display: "9841234567",
    });
  });

  it("strips +977 country code", () => {
    expect(parseNepalPhone("+977 9841234567")).toEqual({
      ok: true,
      normalized: "9841234567",
      display: "9841234567",
    });
  });

  it("rejects invalid prefix", () => {
    expect(parseNepalPhone("8812345678").ok).toBe(false);
  });

  it("treats empty as optional", () => {
    expect(parseOptionalNepalPhone("")).toEqual({ ok: true, empty: true });
    expect(parseOptionalNepalPhone(null)).toEqual({ ok: true, empty: true });
  });

  it("normalizes phone search digits with country code", () => {
    expect(phoneSearchDigits("+977 9841234567")).toBe("9841234567");
    expect(phoneSearchDigits("984-123")).toBe("984123");
  });

  it("matches customer by name or phone", () => {
    const customer = {
      name: "Ram Sharma",
      phoneNormalized: "9841234567",
      displayPhone: "984-123-4567",
    };
    expect(matchesCustomerNameOrPhone(customer, "ram")).toBe(true);
    expect(matchesCustomerNameOrPhone(customer, "9841234567")).toBe(true);
    expect(matchesCustomerNameOrPhone(customer, "+9779841234567")).toBe(true);
    expect(matchesCustomerNameOrPhone(customer, "984-123")).toBe(true);
    expect(matchesCustomerNameOrPhone(customer, "unknown")).toBe(false);
  });
});
