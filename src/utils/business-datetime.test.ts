import { describe, expect, it } from "vitest";

import {
  dateKeyInTimeZone,
  formatTimeInBusinessZone,
  groupTransactionsByDayInTimeZone,
  hourInTimeZone,
} from "@/utils/business-datetime";
import type { Transaction } from "@/types/database";

const SAMPLE_ISO = "2026-08-07T11:44:07.205Z";
const KATHMANDU = "Asia/Kathmandu";
const CHICAGO = "America/Chicago";

describe("business-datetime", () => {
  it("maps UTC instant to business date key and hour in Kathmandu", () => {
    expect(dateKeyInTimeZone(SAMPLE_ISO, KATHMANDU)).toBe("2026-08-07");
    expect(hourInTimeZone(SAMPLE_ISO, KATHMANDU)).toBe(17);
    expect(formatTimeInBusinessZone(SAMPLE_ISO, KATHMANDU)).toMatch(/5:29/);
  });

  it("uses a different local hour in another timezone", () => {
    expect(hourInTimeZone(SAMPLE_ISO, CHICAGO)).not.toBe(
      hourInTimeZone(SAMPLE_ISO, KATHMANDU),
    );
  });

  it("groups transactions by business calendar day", () => {
    const txs = [
      { transaction_date: "2026-08-07T11:44:07.205Z" },
      { transaction_date: "2026-08-07T12:38:51.834Z" },
    ] as Transaction[];
    const grouped = groupTransactionsByDayInTimeZone(txs, KATHMANDU);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.[0]).toBe("2026-08-07");
  });
});
