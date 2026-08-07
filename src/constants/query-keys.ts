import type { TransactionListFilters } from "@/repository";

export const queryKeys = {
  business: {
    all: ["business"] as const,
    list: () => [...queryKeys.business.all, "list"] as const,
    detail: (id: string) => [...queryKeys.business.all, "detail", id] as const,
  },
  serviceCatalog: {
    all: ["service-catalog"] as const,
    list: (businessId: string) =>
      [...queryKeys.serviceCatalog.all, "list", businessId] as const,
    detail: (id: string) =>
      [...queryKeys.serviceCatalog.all, "detail", id] as const,
  },
  expenseCategory: {
    all: ["expense-category"] as const,
    list: (businessId: string) =>
      [...queryKeys.expenseCategory.all, "list", businessId] as const,
    detail: (id: string) =>
      [...queryKeys.expenseCategory.all, "detail", id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (businessId: string, filters?: TransactionListFilters) =>
      [...queryKeys.transactions.all, "list", businessId, filters ?? {}] as const,
    detail: (id: string) =>
      [...queryKeys.transactions.all, "detail", id] as const,
  },
  businessSettings: {
    all: ["business-settings"] as const,
    list: (businessId: string) =>
      [...queryKeys.businessSettings.all, "list", businessId] as const,
    detail: (businessId: string, settingKey: string) =>
      [
        ...queryKeys.businessSettings.all,
        "detail",
        businessId,
        settingKey,
      ] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: (businessId: string) =>
      [...queryKeys.dashboard.all, "summary", businessId] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (businessId: string) =>
      [...queryKeys.customers.all, "list", businessId] as const,
    detail: (id: string) =>
      [...queryKeys.customers.all, "detail", id] as const,
  },
} as const;
