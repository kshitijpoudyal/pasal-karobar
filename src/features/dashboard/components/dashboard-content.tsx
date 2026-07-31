"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";

import { DashboardEmptyHint } from "@/components/layout/business-gate";
import { QueryState } from "@/components/layout/query-state";
import { DashboardPeriodBar } from "@/features/dashboard/components/dashboard-period-bar";
import { DashboardBottomSection } from "@/features/dashboard/components/dashboard-bottom-section";
import { InsightsSection } from "@/features/dashboard/components/insights-section";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { useDashboardSummaryQuery } from "@/hooks/queries/use-dashboard-queries";
import { normalizeDashboardSummary } from "@/services/dashboard-summary";
import { useActiveBusiness } from "@/providers/business-provider";
import {
  getDashboardDateRange,
  type DashboardPeriod,
} from "@/utils/date-ranges";

export function DashboardContent() {
  const { businessId } = useActiveBusiness();
  const [period, setPeriod] = useState<DashboardPeriod>("WEEKLY");

  const range = useMemo(() => getDashboardDateRange(period), [period]);

  const summaryQuery = useDashboardSummaryQuery(businessId, {
    ...range,
    period,
  });
  const summary = normalizeDashboardSummary(summaryQuery.data);
  const isEmptyPeriod =
    summary.patronCount === 0 &&
    summary.revenue === 0 &&
    summary.expenses === 0;

  return (
    <div className="space-y-12 p-12">
      <DashboardPeriodBar period={period} onPeriodChange={setPeriod} />
      <QueryState
        isLoading={summaryQuery.isLoading}
        error={summaryQuery.error}
        onRetry={() => summaryQuery.refetch()}
      >
        <KpiGrid summary={summary} />
        {isEmptyPeriod ? <DashboardEmptyHint /> : null}
        <InsightsSection
          trajectory={summary.trajectory}
          peakAnalysis={summary.peakAnalysis}
        />
        <DashboardBottomSection
          topServices={summary.serviceRevenue}
          monthDayHeatmap={summary.monthDayHeatmap ?? null}
        />
      </QueryState>
    </div>
  );
}

export function formatTransactionTime(iso: string) {
  return format(parseISO(iso), "h:mm a");
}
