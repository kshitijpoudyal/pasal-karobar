export type IncomeVisitRow = {
  customer_id: string | null;
  transaction_date: string;
  id?: string;
};

/** One income row = one visit; legacy duplicate rows share the exact same timestamp. */
function visitKey(row: IncomeVisitRow): string {
  return row.id ?? row.transaction_date;
}

function countDistinctVisitsForCustomer(rows: IncomeVisitRow[]): number {
  const keys = new Set(rows.map(visitKey));
  return keys.size;
}

/** Distinct visit sessions across income rows (anonymous rows count individually). */
export function countDistinctVisits(rows: IncomeVisitRow[]): number {
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
    visits += countDistinctVisitsForCustomer(customerRows);
  }

  return visits;
}

export function countDistinctVisitsByCustomer(
  rows: IncomeVisitRow[],
): Map<string, number> {
  const byCustomer = new Map<string, IncomeVisitRow[]>();

  for (const row of rows) {
    if (!row.customer_id) continue;
    const list = byCustomer.get(row.customer_id) ?? [];
    list.push(row);
    byCustomer.set(row.customer_id, list);
  }

  const visitCounts = new Map<string, number>();
  for (const [customerId, customerRows] of byCustomer) {
    visitCounts.set(customerId, countDistinctVisitsForCustomer(customerRows));
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
