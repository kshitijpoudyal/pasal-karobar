import { beforeAll, describe, expect, it } from "vitest";

import {
  adDateKeyToBs,
  bsMonthBounds,
  bsMonthLabel,
  bsToAdDateKey,
  bsYearBounds,
  daysBetweenDateKeys,
  daysInBsMonth,
  formatBsDayLong,
  formatBsMonthYear,
  loadNepaliModule,
} from "@/utils/nepali-calendar";

describe("nepali-calendar", () => {
  beforeAll(async () => {
    await loadNepaliModule();
  });

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

  it("computes day offsets between AD date keys", () => {
    expect(daysBetweenDateKeys("2023-04-14", "2023-04-16")).toBe(2);
  });

  it("formats BS labels", () => {
    expect(bsMonthLabel(4)).toBe("Shrawan");
    expect(formatBsDayLong("2023-04-14")).toContain("2080");
    expect(formatBsMonthYear("2023-04-14")).toContain("2080");
  });

  it("caches repeated AD to BS conversions", () => {
    const first = adDateKeyToBs("2023-04-14");
    const second = adDateKeyToBs("2023-04-14");
    expect(first).toBe(second);
  });
});
