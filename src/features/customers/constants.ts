export type CustomerVisitFilter = "All" | "With visits" | "No visits";

export const CUSTOMER_VISIT_FILTERS = [
  "All",
  "With visits",
  "No visits",
] as const satisfies readonly CustomerVisitFilter[];

export function hasCustomerSecondaryFilters(visitFilter: CustomerVisitFilter): boolean {
  return visitFilter !== "All";
}
