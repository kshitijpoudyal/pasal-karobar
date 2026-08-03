"use server";

import { getServerAppServices } from "@/services/server";
import type {
  DashboardSummary,
  DashboardSummaryParams,
} from "@/services/dashboard-summary";

export async function fetchDashboardSummary(
  businessId: string,
  params?: DashboardSummaryParams,
): Promise<DashboardSummary> {
  if (!businessId) {
    throw new Error("businessId is required");
  }
  const services = await getServerAppServices();
  return services.dashboard.getSummary(businessId, params);
}
