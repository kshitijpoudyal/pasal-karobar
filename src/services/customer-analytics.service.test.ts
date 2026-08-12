import { describe, expect, it } from "vitest";

import { computeCustomerPeriodInsights } from "@/services/customer-analytics.service";
import type { IncomeSummaryRow } from "@/repository/transaction.repository";

function incomeRow(
  partial: Partial<IncomeSummaryRow> & {
    id?: string;
    customer_id?: string | null;
    transaction_date?: string;
  },
): IncomeSummaryRow {
  return {
    id: partial.id ?? crypto.randomUUID(),
    customer_id: partial.customer_id ?? null,
    total: partial.total ?? 100,
    transaction_date: partial.transaction_date ?? "2026-08-07T10:00:00.000Z",
  };
}

describe("computeCustomerPeriodInsights", () => {
  const periodStart = "2026-08-01T00:00:00.000Z";
  const periodEnd = "2026-08-31T23:59:59.999Z";

  it("counts anonymous and tracked visits in the period", () => {
    const allTimeRows = [
      incomeRow({ customer_id: null }),
      incomeRow({ customer_id: "c1" }),
    ];
    const result = computeCustomerPeriodInsights(allTimeRows, periodStart, periodEnd);
    expect(result.anonymousVisits).toBe(1);
    expect(result.trackedVisits).toBe(1);
    expect(result.uniqueTrackedCustomers).toBe(1);
  });

  it("classifies returning customers by lifetime visit count", () => {
    const allTimeRows = [
      incomeRow({
        customer_id: "repeat",
        transaction_date: "2026-07-01T12:00:00.000Z",
      }),
      incomeRow({
        customer_id: "repeat",
        transaction_date: "2026-08-10T12:00:00.000Z",
      }),
      incomeRow({
        customer_id: "once",
        transaction_date: "2026-08-11T12:00:00.000Z",
      }),
    ];
    const result = computeCustomerPeriodInsights(allTimeRows, periodStart, periodEnd);
    expect(result.newCustomers).toBe(1);
    expect(result.returningCustomers).toBe(1);
  });

  it("treats duplicate same-timestamp rows as one visit for returning status", () => {
    const allTimeRows = [
      incomeRow({
        customer_id: "c1",
        transaction_date: "2026-07-01T12:00:00.000Z",
      }),
      incomeRow({
        customer_id: "c1",
        transaction_date: "2026-08-10T12:00:00.000Z",
      }),
      incomeRow({
        customer_id: "c1",
        transaction_date: "2026-08-10T12:00:00.000Z",
      }),
    ];
    const result = computeCustomerPeriodInsights(allTimeRows, periodStart, periodEnd);
    expect(result.returningCustomers).toBe(1);
    expect(result.newCustomers).toBe(0);
  });

  it("classifies as returning when a customer has multiple visits in the period", () => {
    const allTimeRows = [
      incomeRow({
        customer_id: "c1",
        transaction_date: "2026-08-05T10:00:00.000Z",
      }),
      incomeRow({
        customer_id: "c1",
        transaction_date: "2026-08-20T10:00:00.000Z",
      }),
    ];
    const result = computeCustomerPeriodInsights(allTimeRows, periodStart, periodEnd);
    expect(result.returningCustomers).toBe(1);
    expect(result.newCustomers).toBe(0);
  });
});
