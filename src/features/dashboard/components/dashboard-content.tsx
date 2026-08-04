"use client";

import { useMemo, useState } from "react";

import { DashboardEmptyHint } from "@/components/layout/business-gate";
import { QueryState } from "@/components/layout/query-state";
import { DashboardBottomSection } from "@/features/dashboard/components/dashboard-bottom-section";
import { DashboardTimeNavigator } from "@/features/dashboard/components/dashboard-time-navigator";
import { InsightsSection } from "@/features/dashboard/components/insights-section";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { MonthDayHeatmapCard } from "@/features/dashboard/components/month-day-heatmap-card";
import { useDashboardSummaryQuery } from "@/hooks/queries/use-dashboard-queries";
import { normalizeDashboardSummary } from "@/services/dashboard-summary";
import { useActiveBusiness } from "@/providers/business-provider";
import {
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
  const { businessId } = useActiveBusiness();
  const [granularity, setGranularity] = useState<DashboardGranularity>("week");
  const [anchorDate, setAnchorDate] = useState(() => clampAnchorToToday(new Date()));

  const range = useMemo(
    () => resolveDashboardRange(granularity, anchorDate),
    [granularity, anchorDate],
  );

  const summaryQuery = useDashboardSummaryQuery(businessId, {
    ...range,
    granularity,
  });
  const summary = normalizeDashboardSummary(summaryQuery.data);
  const isEmptyPeriod =
    summary.patronCount === 0 &&
    summary.revenue === 0 &&
    summary.expenses === 0;

  function handleGranularityChange(next: DashboardGranularity) {
    setGranularity(next);
    setAnchorDate(clampAnchorToToday(new Date()));
  }

  return (
    <div className="space-y-6 px-5 py-6 lg:space-y-8 lg:p-12">
      <DashboardTimeNavigator
        granularity={granularity}
        anchorDate={anchorDate}
        onGranularityChange={handleGranularityChange}
        onAnchorChange={(date) => setAnchorDate(clampAnchorToToday(date))}
      />

      <QueryState
        isLoading={summaryQuery.isLoading}
        error={summaryQuery.error}
        onRetry={() => summaryQuery.refetch()}
      >
        <KpiGrid summary={summary} granularity={granularity} />

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
