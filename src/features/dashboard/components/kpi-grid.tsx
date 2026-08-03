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

type KpiGridProps = {
  summary: DashboardSummary;
};

export function KpiGrid({ summary }: KpiGridProps) {
  const efficiency =
    summary.revenue > 0
      ? Math.round((summary.profit / summary.revenue) * 100)
      : 0;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <KpiCard
        icon={Banknote}
        iconClassName="text-primary"
        label="Income"
        value={formatCompactNpr(summary.revenue)}
        footer={
          <div className="text-label-sm flex items-center gap-1 font-bold text-on-secondary-container">
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
          <div className="text-label-sm font-bold text-on-secondary-container uppercase">
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
          <div className="text-label-sm flex items-center gap-1 font-bold text-on-secondary-container">
            <TrendingUp className="size-3.5" strokeWidth={2.5} />
            Income rows
          </div>
        }
      />
    </section>
  );
}
