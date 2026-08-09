import { describe, expect, it } from "vitest";

import { computeCustomerPeriodInsights } from "@/services/customer-analytics.service";
import type { Customer, Transaction } from "@/types/database";

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

function customer(
  id: string,
  first_visit_at: string | null,
): Customer {
  return {
    id,
    business_id: "b1",
    phone: "9841234567",
    phone_normalized: "9841234567",
    name: null,
    profile_note: null,
    first_visit_at,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

describe("computeCustomerPeriodInsights", () => {
  const periodStart = "2026-08-01T00:00:00.000Z";
  const periodEnd = "2026-08-31T23:59:59.999Z";

  it("counts anonymous and tracked visits", () => {
    const txs = [
      incomeTx({ id: "1", customer_id: null }),
      incomeTx({ id: "2", customer_id: "c1" }),
    ];
    const map = new Map([["c1", customer("c1", periodStart)]]);
    const result = computeCustomerPeriodInsights(
      txs,
      map,
      periodStart,
      periodEnd,
    );
    expect(result.anonymousVisits).toBe(1);
    expect(result.trackedVisits).toBe(1);
    expect(result.uniqueTrackedCustomers).toBe(1);
  });

  it("classifies new vs returning from first_visit_at", () => {
    const txs = [
      incomeTx({ id: "1", customer_id: "new1" }),
      incomeTx({ id: "2", customer_id: "ret1" }),
    ];
    const map = new Map([
      ["new1", customer("new1", "2026-08-10T12:00:00.000Z")],
      ["ret1", customer("ret1", "2026-07-01T12:00:00.000Z")],
    ]);
    const result = computeCustomerPeriodInsights(
      txs,
      map,
      periodStart,
      periodEnd,
    );
    expect(result.newCustomers).toBe(1);
    expect(result.returningCustomers).toBe(1);
  });
});
