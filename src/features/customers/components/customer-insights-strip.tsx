"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CustomerPeriodInsights } from "@/services/customer-analytics.service";
import { cn } from "@/lib/utils";

function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "squircle flex flex-col gap-1.5 bg-surface-container-low p-4 shadow-natural-ink",
        className,
      )}
    >
      <span className="text-label-sm text-on-surface-variant">{label}</span>
      <span className="font-headline text-2xl font-bold text-primary">
        {value}
      </span>
    </div>
  );
}

type CustomerInsightsStripProps = {
  insights: CustomerPeriodInsights;
  onAddCustomer: () => void;
  layout: "mobile" | "desktop";
};

export function CustomerInsightsStrip({
  insights,
  onAddCustomer,
  layout,
}: CustomerInsightsStripProps) {
  if (layout === "mobile") {
    return (
      <div className="flex shrink-0 flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="New customers" value={insights.newCustomers} />
          <StatTile label="Returning" value={insights.returningCustomers} />
        </div>
        <div className="grid grid-cols-[1fr_auto] items-stretch gap-3">
          <StatTile
            label="Anonymous visits"
            value={insights.anonymousVisits}
          />
          <Button
            type="button"
            variant="primary"
            size="icon-lg"
            className="aspect-square h-full min-h-[4.5rem] w-full shrink-0 rounded-full"
            aria-label="Add customer"
            onClick={onAddCustomer}
          >
            <Plus className="size-6" strokeWidth={2.25} aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 xl:gap-6">
      <StatTile label="New customers" value={insights.newCustomers} />
      <StatTile label="Returning" value={insights.returningCustomers} />
      <StatTile label="Anonymous visits" value={insights.anonymousVisits} />
    </div>
  );
}
