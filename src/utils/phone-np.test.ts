import { describe, expect, it } from "vitest";

import {
  parseNepalPhone,
  parseOptionalNepalPhone,
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
});
