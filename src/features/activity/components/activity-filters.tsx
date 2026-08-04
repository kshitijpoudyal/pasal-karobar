"use client";

import { CalendarDays, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNpr } from "@/utils/format";
import {
  TIMEFRAMES,
  type ActivityCategoryFilter,
  type ActivityTimeframe,
} from "@/features/activity/constants";

export { TIMEFRAMES };

type ActivityFiltersProps = {
  timeframe: ActivityTimeframe;
  category: ActivityCategoryFilter;
  onTimeframeChange: (value: ActivityTimeframe) => void;
  onCategoryChange: (value: ActivityCategoryFilter) => void;
};

const CATEGORIES = ["All", "Income", "Expense"] as const satisfies readonly ActivityCategoryFilter[];

export function ActivityFilters({
  timeframe,
  category,
  onTimeframeChange,
  onCategoryChange,
}: ActivityFiltersProps) {
  return (
    <div className="col-span-12 flex min-w-0 flex-col gap-6 xl:col-span-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-label-sm mr-4 font-semibold tracking-widest text-on-surface-variant uppercase">
          Timeframe
        </span>
        {TIMEFRAMES.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onTimeframeChange(label)}
            className={cn(
              "rounded-full px-6 py-2.5 text-sm font-medium shadow-md transition-colors",
              timeframe === label
                ? "bg-primary text-on-primary"
                : "border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low",
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-5 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <CalendarDays className="size-[18px]" strokeWidth={1.75} />
          <span>Custom</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-label-sm mr-4 font-semibold tracking-widest text-on-surface-variant uppercase">
          Category
        </span>
        <div className="flex rounded-full border border-outline-variant bg-surface-container-lowest p-1.5">
          {CATEGORIES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onCategoryChange(label)}
              className={cn(
                "rounded-full px-8 py-2 text-sm font-medium transition-colors",
                category === label
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-low",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DailyNetRevenueCard({ netRevenue }: { netRevenue: number }) {
  return (
    <div className="relative col-span-12 flex min-w-0 flex-col justify-between overflow-hidden rounded-squircle bg-primary p-6 text-on-primary shadow-xl xl:col-span-4 xl:p-8">
      <div className="z-10">
        <p className="text-label-sm font-bold tracking-[0.2em] uppercase opacity-70">
          Net for period
        </p>
        <h3 className="font-headline mt-2 text-3xl font-bold xl:text-4xl">
          {formatNpr(netRevenue)}
        </h3>
      </div>
      <div className="z-10 mt-4 flex items-center gap-2 text-sm font-medium">
        <TrendingUp className="size-[18px]" strokeWidth={2} />
        <span className="text-on-primary/90">Income minus expenses</span>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
}
