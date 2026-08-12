import type { ServiceRecord } from "@/types/database";

export function sortActiveServices(services: ServiceRecord[]): ServiceRecord[] {
  return services
    .filter((service) => service.is_active)
    .sort(
      (a, b) =>
        a.display_order - b.display_order ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
}

export function entryPositionForService(
  services: ServiceRecord[],
  serviceId: string,
): number {
  const list = sortActiveServices(services);
  const index = list.findIndex((service) => service.id === serviceId);
  return index >= 0 ? index + 1 : 1;
}

/** Reassign display_order 1..n for the given active order. */
export function withSequentialDisplayOrders(
  allServices: ServiceRecord[],
  orderedActiveIds: string[],
): ServiceRecord[] {
  const orderById = new Map(
    orderedActiveIds.map((id, index) => [id, index + 1] as const),
  );
  return allServices.map((service) => {
    const nextOrder = orderById.get(service.id);
    if (nextOrder === undefined) return service;
    return { ...service, display_order: nextOrder };
  });
}

export function reorderActiveList(
  list: ServiceRecord[],
  serviceId: string,
  newPosition1Based: number,
): ServiceRecord[] {
  const index = list.findIndex((service) => service.id === serviceId);
  if (index < 0) return list;

  const targetIndex = Math.min(Math.max(newPosition1Based - 1, 0), list.length - 1);
  if (targetIndex === index) return list;

  const reordered = [...list];
  const [item] = reordered.splice(index, 1);
  if (!item) return list;
  reordered.splice(targetIndex, 0, item);
  return reordered;
}
