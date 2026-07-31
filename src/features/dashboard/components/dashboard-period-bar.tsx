"use client";

import { useMemo } from "react";

import { PeriodFilter } from "@/features/dashboard/components/period-filter";
import {
  formatDashboardPeriodLabel,
  getDashboardDateRange,
  type DashboardPeriod,
} from "@/utils/date-ranges";

type DashboardPeriodBarProps = {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

export function DashboardPeriodBar({
  period,
  onPeriodChange,
}: DashboardPeriodBarProps) {
  const range = useMemo(() => getDashboardDateRange(period), [period]);
  const rangeLabel = useMemo(
    () => formatDashboardPeriodLabel(period, range),
    [period, range],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p
        className="font-headline text-base font-medium text-on-surface sm:text-lg"
        aria-live="polite"
      >
        {rangeLabel}
      </p>
      <PeriodFilter value={period} onChange={onPeriodChange} />
    </div>
  );
}
