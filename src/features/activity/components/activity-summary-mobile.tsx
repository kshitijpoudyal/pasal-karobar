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
    <section className="squircle flex flex-col gap-3 bg-surface-container-low p-4 shadow-natural-ink">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
            Net for period
          </h2>
          <p className="font-headline mt-0.5 text-2xl leading-tight font-semibold text-primary">
            {formatNpr(netRevenue)}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-secondary-container px-2 py-0.5 text-on-secondary-container">
          <TrendingUp className="size-3.5" strokeWidth={2} />
          <span className="text-[10px] font-semibold">Period</span>
        </div>
      </div>
      <div className="flex gap-4 border-t border-surface-container-highest pt-3">
        <div className="flex-1">
          <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
            Transactions
          </p>
          <p className="font-headline mt-0.5 text-lg font-semibold text-on-surface">
            {transactionCount}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
            Avg ticket
          </p>
          <p className="font-headline mt-0.5 text-lg font-semibold text-on-surface">
            {formatNpr(averageTicket)}
          </p>
        </div>
      </div>
    </section>
  );
}
