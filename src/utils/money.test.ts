import { describe, expect, it } from "vitest";

import { parseNprAmount } from "@/utils/money";

describe("parseNprAmount", () => {
  it("parses whole rupee amounts", () => {
    expect(parseNprAmount("500")).toBe(500);
    expect(parseNprAmount(" 120 ")).toBe(120);
  });

  it("returns zero for empty or invalid input", () => {
    expect(parseNprAmount("")).toBe(0);
    expect(parseNprAmount("abc")).toBe(0);
    expect(parseNprAmount("-5")).toBe(0);
  });

  it("truncates decimal input to whole rupees", () => {
    expect(parseNprAmount("99.9")).toBe(99);
  });
});
