import { describe, expect, it } from "vitest";

import {
  buildPendingTransaction,
  isPendingSyncTransactionId,
  pendingSyncClientId,
  pendingSyncTransactionId,
} from "@/offline/pending-transaction";
import type { CreateTransactionInput } from "@/services/schemas";

const sampleIncome: CreateTransactionInput = {
  business_id: "biz-1",
  type: "INCOME",
  service_id: "svc-1",
  subtotal: 500,
  tip: 50,
  total: 550,
  payment_method: "CASH",
  transaction_date: "2026-08-07T10:00:00.000Z",
};

describe("pending transaction helpers", () => {
  it("builds stable pending ids", () => {
    const id = pendingSyncTransactionId("abc-123");
    expect(id).toBe("pending-sync:abc-123");
    expect(isPendingSyncTransactionId(id)).toBe(true);
    expect(pendingSyncClientId(id)).toBe("abc-123");
  });

  it("maps payload to a pending transaction row", () => {
    const tx = buildPendingTransaction("client-1", "biz-1", sampleIncome);
    expect(tx.id).toBe("pending-sync:client-1");
    expect(tx.business_id).toBe("biz-1");
    expect(tx.total).toBe(550);
    expect(tx.service_id).toBe("svc-1");
    expect(tx.customer_id).toBeNull();
  });

  it("preserves optimistic customer id", () => {
    const tx = buildPendingTransaction("client-1", "biz-1", sampleIncome, {
      customerId: "pending-customer:9801234567",
    });
    expect(tx.customer_id).toBe("pending-customer:9801234567");
  });
});
