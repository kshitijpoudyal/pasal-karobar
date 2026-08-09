import type { BusinessPaymentMethodRecord } from "@/types/database";

export function sortActivePaymentMethods(
  rows: BusinessPaymentMethodRecord[],
): BusinessPaymentMethodRecord[] {
  return rows
    .filter((row) => row.is_active)
    .sort(
      (a, b) =>
        a.display_order - b.display_order ||
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
}

export function entryPositionForPaymentMethod(
  rows: BusinessPaymentMethodRecord[],
  paymentMethodId: string,
): number {
  const list = sortActivePaymentMethods(rows);
  const index = list.findIndex((row) => row.id === paymentMethodId);
  return index >= 0 ? index + 1 : 1;
}

export function withSequentialPaymentDisplayOrders(
  allRows: BusinessPaymentMethodRecord[],
  orderedActiveIds: string[],
): BusinessPaymentMethodRecord[] {
  const orderById = new Map(
    orderedActiveIds.map((id, index) => [id, index + 1] as const),
  );
  return allRows.map((row) => {
    const nextOrder = orderById.get(row.id);
    if (nextOrder === undefined) return row;
    return { ...row, display_order: nextOrder };
  });
}

export function reorderActivePaymentList(
  list: BusinessPaymentMethodRecord[],
  paymentMethodId: string,
  newPosition1Based: number,
): BusinessPaymentMethodRecord[] {
  const index = list.findIndex((row) => row.id === paymentMethodId);
  if (index < 0) return list;

  const targetIndex = Math.min(
    Math.max(newPosition1Based - 1, 0),
    list.length - 1,
  );
  if (targetIndex === index) return list;

  const reordered = [...list];
  const [item] = reordered.splice(index, 1);
  if (!item) return list;
  reordered.splice(targetIndex, 0, item);
  return reordered;
}
