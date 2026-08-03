"use client";

import { TrendingUp } from "lucide-react";

import { formatNpr } from "@/utils/format";

type ActivitySummaryMobileProps = {
  netRevenue: number;
  transactionCount: number;
  averageTicket: number;
};

export function ActivitySummaryMobile({
  netRevenue,
  transactionCount,
  averageTicket,
}: ActivitySummaryMobileProps) {
  return (
    <section className="squircle flex flex-col gap-4 bg-surface-container-low p-6 shadow-natural-ink">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-label-sm text-on-surface-variant">Daily Net Revenue</h2>
          <p className="font-headline mt-1 text-[28px] leading-tight font-medium text-primary">
            {formatNpr(netRevenue)}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container">
          <TrendingUp className="size-4" strokeWidth={2} />
          <span className="text-label-sm normal-case tracking-normal">Period</span>
        </div>
      </div>
      <div className="flex gap-4 border-t border-surface-container-highest pt-4">
        <div className="flex-1">
          <p className="text-label-sm text-on-surface-variant">Transactions</p>
          <p className="font-headline mt-1 text-xl font-semibold text-on-surface">
            {transactionCount}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-label-sm text-on-surface-variant">Avg Ticket</p>
          <p className="font-headline mt-1 text-xl font-semibold text-on-surface">
            {formatNpr(averageTicket)}
          </p>
        </div>
      </div>
    </section>
  );
}
