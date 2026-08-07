"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  Banknote,
  ShoppingBag,
  TrendingUp as TrendingUpIcon,
  Users,
} from "@/features/dashboard/components/dashboard-stat-icons";
import type { DashboardSummary } from "@/services/dashboard-summary";
import { formatCompactNpr } from "@/utils/format";
import { formatDashboardComparisonLabel, type DashboardGranularity } from "@/utils/date-ranges";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  footer: ReactNode | null;
};

function KpiCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  footer,
}: KpiCardProps) {
  return (
    <div className="squircle flex flex-col gap-3 bg-surface-container-low p-6 shadow-natural-ink lg:gap-4 lg:p-8 lg:shadow-none">
      <div className="flex size-10 items-center justify-center rounded-full bg-surface-container-highest lg:hidden">
        <Icon className={cn("size-5", iconClassName)} strokeWidth={1.75} />
      </div>
      <div className="hidden items-center justify-between lg:flex">
        <Icon className={cn("size-6", iconClassName)} strokeWidth={1.75} />
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <span className="text-label-sm text-on-surface-variant lg:hidden">{label}</span>
      <p className="font-headline text-xl font-semibold text-on-surface lg:text-4xl lg:font-bold">
        {value}
      </p>
      {footer}
    </div>
  );
}

function NetProfitFooter({
  summary,
  granularity,
}: {
  summary: DashboardSummary;
  granularity: DashboardGranularity;
}) {
  const comparison = summary.periodComparison;
  const compareLabel = formatDashboardComparisonLabel(granularity);
  const showComparison =
    comparison &&
    (comparison.priorNet !== 0 ||
      comparison.netDelta !== 0 ||
      summary.profit !== 0);

  if (!showComparison || !comparison) return null;

  const deltaPositive = comparison.netDelta >= 0;
  const DeltaIcon = deltaPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "text-label-sm flex items-center gap-1 font-semibold",
        deltaPositive ? "text-on-secondary-container" : "text-error",
      )}
    >
      <DeltaIcon className="size-3.5" strokeWidth={2.25} />
      {comparison.netDeltaPercent !== null ? (
        <span>
          {deltaPositive ? "+" : ""}
          {Math.round(comparison.netDeltaPercent)}% {compareLabel}
        </span>
      ) : (
        <span>
          {deltaPositive ? "+" : ""}
          {formatCompactNpr(comparison.netDelta)} {compareLabel}
        </span>
      )}
    </div>
  );
}

type KpiGridProps = {
  summary: DashboardSummary;
  granularity: DashboardGranularity;
};

export function KpiGrid({ summary, granularity }: KpiGridProps) {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      <KpiCard
        icon={TrendingUpIcon}
        iconClassName="text-primary"
        label="Net profit"
        value={formatCompactNpr(summary.profit)}
        footer={<NetProfitFooter summary={summary} granularity={granularity} />}
      />
      <KpiCard
        icon={Banknote}
        iconClassName="text-primary"
        label="Money in"
        value={formatCompactNpr(summary.revenue)}
        footer={null}
      />
      <KpiCard
        icon={ShoppingBag}
        iconClassName="text-on-surface-variant"
        label="Money out"
        value={formatCompactNpr(summary.expenses)}
        footer={null}
      />
      <KpiCard
        icon={Users}
        iconClassName="text-on-surface-variant"
        label="Visits"
        value={String(summary.patronCount)}
        footer={null}
      />
    </section>
  );
}
