import { describe, expect, it } from "vitest";

import {
  adDateKeyToBs,
  bsMonthBounds,
  bsMonthLabel,
  bsToAdDateKey,
  bsYearBounds,
  daysInBsMonth,
  formatBsDayLong,
  formatBsMonthYear,
} from "@/utils/nepali-calendar";

describe("nepali-calendar", () => {
  it("converts known AD date to BS", () => {
    expect(adDateKeyToBs("2023-04-14")).toEqual({
      year: 2080,
      month: 1,
      day: 1,
    });
  });

  it("converts BS date back to AD dateKey", () => {
    expect(bsToAdDateKey(2080, 1, 1)).toBe("2023-04-14");
  });

  it("returns BS month bounds as AD date keys", () => {
    const bounds = bsMonthBounds(2080, 1);
    expect(bounds).toEqual({
      fromKey: "2023-04-14",
      toKey: "2023-05-14",
    });
  });

  it("returns BS year bounds", () => {
    const bounds = bsYearBounds(2080);
    expect(bounds?.fromKey).toBe("2023-04-14");
    expect(bounds?.toKey).toBe("2024-04-12");
  });

  it("reports variable BS month lengths", () => {
    expect(daysInBsMonth(2080, 1)).toBe(31);
    expect(daysInBsMonth(2080, 2)).toBe(32);
  });

  it("formats BS labels", () => {
    expect(bsMonthLabel(4)).toBe("Shrawan");
    expect(formatBsDayLong("2023-04-14")).toContain("2080");
    expect(formatBsMonthYear("2023-04-14")).toContain("2080");
  });
});
