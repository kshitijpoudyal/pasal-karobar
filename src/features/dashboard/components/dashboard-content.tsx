"use client";

import { useMemo, useState } from "react";
import { parseISO, startOfDay } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

import { DashboardEmptyHint } from "@/components/layout/business-gate";
import { QueryState } from "@/components/layout/query-state";
import { DashboardBottomSection } from "@/features/dashboard/components/dashboard-bottom-section";
import { DashboardTimeNavigator } from "@/features/dashboard/components/dashboard-time-navigator";
import { InsightsSection } from "@/features/dashboard/components/insights-section";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { CustomerInsightsCard } from "@/features/dashboard/components/customer-insights-card";
import { MonthDayHeatmapCard } from "@/features/dashboard/components/month-day-heatmap-card";
import { useDashboardSummaryQuery } from "@/hooks/queries/use-dashboard-queries";
import { refreshBusinessStats } from "@/hooks/queries/transaction-query-cache";
import { normalizeDashboardSummary } from "@/services/dashboard-summary";
import { useActiveBusiness } from "@/providers/business-provider";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";
import {
  clampAnchorToDataBounds,
  clampAnchorToToday,
  resolveDashboardRange,
  type DashboardGranularity,
} from "@/utils/date-ranges";

function chartTitleFor(granularity: DashboardGranularity): string {
  switch (granularity) {
    case "day":
      return "Hourly overview";
    case "week":
      return "Daily overview";
    case "month":
      return "Daily overview";
    case "year":
      return "Monthly overview";
  }
}

export function DashboardContent() {
  const queryClient = useQueryClient();
  const { businessId } = useActiveBusiness();
  const timeZone = useBusinessTimeZone();
  const [granularity, setGranularity] = useState<DashboardGranularity>("day");
  const [anchorDate, setAnchorDate] = useState(() =>
    clampAnchorToToday(new Date(), new Date(), timeZone),
  );

  const range = useMemo(
    () => resolveDashboardRange(granularity, anchorDate, new Date(), timeZone),
    [granularity, anchorDate, timeZone],
  );

  const summaryQuery = useDashboardSummaryQuery(businessId, {
    ...range,
    granularity,
  });
  const summary = normalizeDashboardSummary(summaryQuery.data);
  const minSelectableDate = useMemo(() => {
    const iso = summaryQuery.data?.earliestTransactionDate;
    if (!iso) return null;
    return startOfDay(parseISO(iso));
  }, [summaryQuery.data?.earliestTransactionDate]);

  const clampAnchor = (date: Date) =>
    clampAnchorToDataBounds(date, minSelectableDate, new Date(), timeZone);

  const isEmptyPeriod =
    summary.patronCount === 0 &&
    summary.revenue === 0 &&
    summary.expenses === 0;

  function handleGranularityChange(next: DashboardGranularity) {
    setGranularity(next);
    setAnchorDate(clampAnchor(clampAnchorToToday(new Date(), new Date(), timeZone)));
  }

  async function handleRefreshStats() {
    await refreshBusinessStats(queryClient);
    await summaryQuery.refetch();
  }

  return (
    <div className="space-y-6 px-5 py-6 lg:space-y-8 lg:p-12">
      <DashboardTimeNavigator
        granularity={granularity}
        anchorDate={anchorDate}
        minSelectableDate={minSelectableDate}
        timeZone={timeZone}
        onGranularityChange={handleGranularityChange}
        onAnchorChange={(date) => setAnchorDate(clampAnchor(date))}
        onRefreshStats={() => void handleRefreshStats()}
        isRefreshingStats={summaryQuery.isFetching}
      />

      <QueryState
        isLoading={summaryQuery.isLoading}
        error={summaryQuery.error}
        onRetry={() => summaryQuery.refetch()}
      >
        <KpiGrid summary={summary} granularity={granularity} />

        <CustomerInsightsCard insights={summary.customerInsights} />

        {isEmptyPeriod ? <DashboardEmptyHint /> : null}

        <InsightsSection
          trajectory={summary.trajectory}
          peakAnalysis={summary.peakAnalysis}
          chartTitle={chartTitleFor(granularity)}
        />

        {granularity === "month" && summary.monthDayHeatmap ? (
          <div className="lg:hidden">
            <MonthDayHeatmapCard heatmap={summary.monthDayHeatmap} />
          </div>
        ) : null}

        <DashboardBottomSection
          topServices={summary.serviceRevenue}
          monthDayHeatmap={
            granularity === "month" ? summary.monthDayHeatmap ?? null : null
          }
        />
      </QueryState>
    </div>
  );
}
