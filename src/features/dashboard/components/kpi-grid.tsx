"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  ArrowUp,
  Banknote,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "@/features/dashboard/components/dashboard-stat-icons";
import type { DashboardSummary } from "@/services/dashboard-summary";
import { formatCompactNpr } from "@/utils/format";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  footer: ReactNode;
};

function KpiCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  footer,
}: KpiCardProps) {
  return (
    <div className="squircle flex flex-col gap-4 bg-surface-container-low p-8">
      <div className="flex items-center justify-between">
        <Icon className={cn("size-6", iconClassName)} strokeWidth={1.75} />
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <p className="text-4xl font-bold text-on-surface">{value}</p>
      {footer}
    </div>
  );
}

type KpiGridProps = {
  summary: DashboardSummary;
};

export function KpiGrid({ summary }: KpiGridProps) {
  const efficiency =
    summary.revenue > 0
      ? Math.round((summary.profit / summary.revenue) * 100)
      : 0;

  return (
    <section className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      <KpiCard
        icon={Banknote}
        iconClassName="text-primary"
        label="Income"
        value={formatCompactNpr(summary.revenue)}
        footer={
          <div className="text-label-sm flex items-center gap-1 font-bold text-secondary">
            <ArrowUp className="size-3.5" strokeWidth={2.5} />
            Live
          </div>
        }
      />
      <KpiCard
        icon={ShoppingBag}
        iconClassName="text-on-surface-variant"
        label="Expense"
        value={formatCompactNpr(summary.expenses)}
        footer={
          <div className="text-label-sm font-medium text-on-surface-variant uppercase">
            Expenses
          </div>
        }
      />
      <KpiCard
        icon={Wallet}
        iconClassName="text-secondary"
        label="Net Profit"
        value={formatCompactNpr(summary.profit)}
        footer={
          <div className="text-label-sm font-bold text-secondary uppercase">
            {efficiency}% Efficiency
          </div>
        }
      />
      <KpiCard
        icon={Users}
        iconClassName="text-on-surface-variant"
        label="Customers Count"
        value={String(summary.patronCount)}
        footer={
          <div className="text-label-sm flex items-center gap-1 font-bold text-secondary">
            <TrendingUp className="size-3.5" strokeWidth={2.5} />
            Income rows
          </div>
        }
      />
    </section>
  );
}
