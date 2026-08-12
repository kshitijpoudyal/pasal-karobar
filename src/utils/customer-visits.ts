/** Income rows logged within this window for the same customer count as one visit. */
export const CUSTOMER_VISIT_CLUSTER_MS = 5 * 60 * 1000;

export type IncomeVisitRow = {
  customer_id: string | null;
  transaction_date: string;
  id?: string;
};

function countDistinctVisitsForCustomer(
  rows: IncomeVisitRow[],
  clusterMs: number,
): number {
  if (rows.length === 0) return 0;
  const sorted = [...rows].sort(
    (a, b) => Date.parse(a.transaction_date) - Date.parse(b.transaction_date),
  );
  let visits = 1;
  let clusterAnchorMs = Date.parse(sorted[0]!.transaction_date);
  for (let i = 1; i < sorted.length; i++) {
    const t = Date.parse(sorted[i]!.transaction_date);
    if (t - clusterAnchorMs > clusterMs) {
      visits += 1;
      clusterAnchorMs = t;
    }
  }
  return visits;
}

/** Distinct visit sessions across income rows (anonymous rows count individually). */
export function countDistinctVisits(
  rows: IncomeVisitRow[],
  options?: { clusterMs?: number },
): number {
  const clusterMs = options?.clusterMs ?? CUSTOMER_VISIT_CLUSTER_MS;
  if (rows.length === 0) return 0;

  let visits = 0;
  const byCustomer = new Map<string, IncomeVisitRow[]>();

  for (const row of rows) {
    if (!row.customer_id) {
      visits += 1;
      continue;
    }
    const list = byCustomer.get(row.customer_id) ?? [];
    list.push(row);
    byCustomer.set(row.customer_id, list);
  }

  for (const customerRows of byCustomer.values()) {
    visits += countDistinctVisitsForCustomer(customerRows, clusterMs);
  }

  return visits;
}

export function countDistinctVisitsByCustomer(
  rows: IncomeVisitRow[],
  options?: { clusterMs?: number },
): Map<string, number> {
  const clusterMs = options?.clusterMs ?? CUSTOMER_VISIT_CLUSTER_MS;
  const byCustomer = new Map<string, IncomeVisitRow[]>();

  for (const row of rows) {
    if (!row.customer_id) continue;
    const list = byCustomer.get(row.customer_id) ?? [];
    list.push(row);
    byCustomer.set(row.customer_id, list);
  }

  const visitCounts = new Map<string, number>();
  for (const [customerId, customerRows] of byCustomer) {
    visitCounts.set(
      customerId,
      countDistinctVisitsForCustomer(customerRows, clusterMs),
    );
  }
  return visitCounts;
}

export function toIncomeVisitRows(
  rows: Array<{
    customer_id: string | null;
    transaction_date: string;
    id?: string;
  }>,
): IncomeVisitRow[] {
  return rows.map((row) => ({
    customer_id: row.customer_id,
    transaction_date: row.transaction_date,
    id: row.id,
  }));
}
