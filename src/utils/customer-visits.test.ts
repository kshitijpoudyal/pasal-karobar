import { describe, expect, it } from "vitest";

import {
  countDistinctVisits,
  countDistinctVisitsByCustomer,
} from "@/utils/customer-visits";

describe("countDistinctVisits", () => {
  it("treats duplicate same-timestamp income rows as one visit", () => {
    const rows = [
      {
        customer_id: "c1",
        transaction_date: "2026-08-07T10:00:00.000Z",
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-07T10:00:00.000Z",
      },
    ];
    expect(countDistinctVisits(rows)).toBe(1);
  });

  it("counts separate visits when entries are far enough apart", () => {
    const rows = [
      {
        customer_id: "c1",
        transaction_date: "2026-08-07T10:00:00.000Z",
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-07T11:00:00.000Z",
      },
    ];
    expect(countDistinctVisits(rows)).toBe(2);
  });

  it("counts each anonymous row as its own visit", () => {
    const rows = [
      { customer_id: null, transaction_date: "2026-08-07T10:00:00.000Z" },
      { customer_id: null, transaction_date: "2026-08-07T10:00:00.000Z" },
    ];
    expect(countDistinctVisits(rows)).toBe(2);
  });
});

describe("countDistinctVisitsByCustomer", () => {
  it("returns per-customer lifetime visit totals", () => {
    const rows = [
      {
        customer_id: "c1",
        transaction_date: "2026-08-01T10:00:00.000Z",
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-01T10:00:00.000Z",
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-08T10:00:00.000Z",
      },
      {
        customer_id: "c2",
        transaction_date: "2026-08-02T10:00:00.000Z",
      },
    ];
    const counts = countDistinctVisitsByCustomer(rows);
    expect(counts.get("c1")).toBe(2);
    expect(counts.get("c2")).toBe(1);
  });
});
