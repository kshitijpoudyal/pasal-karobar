"use client";

import { cn } from "@/lib/utils";
import {
  TIMEFRAMES,
  type ActivityCategoryFilter,
  type ActivityTimeframe,
} from "@/features/activity/constants";

const CATEGORIES = ["All", "Income", "Expense"] as const satisfies readonly ActivityCategoryFilter[];

type ActivityFiltersMobileProps = {
  timeframe: ActivityTimeframe;
  category: ActivityCategoryFilter;
  onTimeframeChange: (value: ActivityTimeframe) => void;
  onCategoryChange: (value: ActivityCategoryFilter) => void;
};

export function ActivityFiltersMobile({
  timeframe,
  category,
  onTimeframeChange,
  onCategoryChange,
}: ActivityFiltersMobileProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {TIMEFRAMES.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onTimeframeChange(label)}
            className={cn(
              "shrink-0 rounded-[24px] px-4 py-2 text-label-sm normal-case tracking-[0.12em] transition-transform active:scale-95",
              timeframe === label
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-highest text-on-surface hover:bg-surface-variant",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onCategoryChange(label)}
            className={cn(
              "shrink-0 rounded-[24px] px-4 py-2 text-label-sm normal-case tracking-[0.12em] transition-transform active:scale-95",
              category === label
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-highest text-on-surface hover:bg-surface-variant",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
