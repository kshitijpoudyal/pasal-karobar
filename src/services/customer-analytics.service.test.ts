import { describe, expect, it } from "vitest";

import { computeCustomerPeriodInsights } from "@/services/customer-analytics.service";
import type { Transaction } from "@/types/database";

function incomeTx(
  partial: Partial<Transaction> & { id: string; customer_id?: string | null },
): Transaction {
  return {
    id: partial.id,
    business_id: "b1",
    type: "INCOME",
    service_id: "s1",
    expense_category_id: null,
    customer_id: partial.customer_id ?? null,
    subtotal: 100,
    tip: 0,
    total: 100,
    payment_method: "CASH",
    note: null,
    transaction_date: partial.transaction_date ?? "2026-08-07T10:00:00.000Z",
    created_at: partial.transaction_date ?? "2026-08-07T10:00:00.000Z",
    updated_at: partial.transaction_date ?? "2026-08-07T10:00:00.000Z",
  };
}

describe("computeCustomerPeriodInsights", () => {
  const periodStart = "2026-08-01T00:00:00.000Z";
  const periodEnd = "2026-08-31T23:59:59.999Z";

  it("counts anonymous and tracked visits by distinct sessions", () => {
    const periodTxs = [
      incomeTx({ id: "1", customer_id: null }),
      incomeTx({ id: "2", customer_id: "c1" }),
      incomeTx({
        id: "3",
        customer_id: "c1",
        transaction_date: "2026-08-07T10:00:00.000Z",
      }),
    ];
    const allTimeRows = [
      {
        customer_id: "c1",
        transaction_date: "2026-08-07T10:00:00.000Z",
        total: 100,
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-07T10:00:00.000Z",
        total: 100,
      },
    ];
    const result = computeCustomerPeriodInsights(
      periodTxs,
      allTimeRows,
      periodStart,
      periodEnd,
    );
    expect(result.anonymousVisits).toBe(1);
    expect(result.trackedVisits).toBe(1);
    expect(result.uniqueTrackedCustomers).toBe(1);
  });

  it("classifies returning customers by lifetime visit count", () => {
    const periodTxs = [
      incomeTx({
        id: "1",
        customer_id: "repeat",
        transaction_date: "2026-08-10T12:00:00.000Z",
      }),
      incomeTx({
        id: "2",
        customer_id: "once",
        transaction_date: "2026-08-11T12:00:00.000Z",
      }),
    ];
    const allTimeRows = [
      {
        customer_id: "repeat",
        transaction_date: "2026-07-01T12:00:00.000Z",
        total: 100,
      },
      {
        customer_id: "repeat",
        transaction_date: "2026-08-10T12:00:00.000Z",
        total: 100,
      },
      {
        customer_id: "once",
        transaction_date: "2026-08-11T12:00:00.000Z",
        total: 100,
      },
    ];
    const result = computeCustomerPeriodInsights(
      periodTxs,
      allTimeRows,
      periodStart,
      periodEnd,
    );
    expect(result.newCustomers).toBe(1);
    expect(result.returningCustomers).toBe(1);
  });

  it("treats duplicate same-timestamp rows as one visit for returning status", () => {
    const periodTxs = [
      incomeTx({
        id: "1",
        customer_id: "c1",
        transaction_date: "2026-08-10T12:00:00.000Z",
      }),
      incomeTx({
        id: "2",
        customer_id: "c1",
        transaction_date: "2026-08-10T12:00:00.000Z",
      }),
    ];
    const allTimeRows = [
      {
        customer_id: "c1",
        transaction_date: "2026-07-01T12:00:00.000Z",
        total: 100,
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-10T12:00:00.000Z",
        total: 100,
      },
      {
        customer_id: "c1",
        transaction_date: "2026-08-10T12:00:00.000Z",
        total: 100,
      },
    ];
    const result = computeCustomerPeriodInsights(
      periodTxs,
      allTimeRows,
      periodStart,
      periodEnd,
    );
    expect(result.returningCustomers).toBe(1);
    expect(result.newCustomers).toBe(0);
  });
});
