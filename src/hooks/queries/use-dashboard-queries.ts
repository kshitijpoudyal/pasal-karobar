"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { DashboardSummaryParams } from "@/services/dashboard-summary";
import {
  normalizeDashboardSummary,
  type DashboardSummary,
} from "@/services/dashboard-summary";
import { getClientAppServices } from "@/services/client";
import { isSupabaseConfigured } from "@/utils/env";

export function useDashboardSummaryQuery(
  businessId: string,
  params?: DashboardSummaryParams,
  options?: Omit<
    UseQueryOptions<DashboardSummary, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...queryKeys.dashboard.summary(businessId), params ?? {}],
    queryFn: async () => {
      const raw = await getClientAppServices().dashboard.getSummary(
        businessId,
        params,
      );
      return normalizeDashboardSummary(raw);
    },
    select: (data) => normalizeDashboardSummary(data),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}
