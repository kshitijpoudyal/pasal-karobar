"use client";

import { cn } from "@/lib/utils";
import type { DashboardPeriod } from "@/utils/date-ranges";

const PERIODS: DashboardPeriod[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
];

type PeriodFilterProps = {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  className?: string;
};

export function PeriodFilter({ value, onChange, className }: PeriodFilterProps) {
  return (
    <div className={cn("w-full min-w-0 sm:w-auto", className)}>
      <div className="hide-scrollbar squircle flex w-full max-w-full min-w-0 overflow-x-auto bg-surface-container-low p-1 sm:max-w-2xl">
        {PERIODS.map((period) => {
          const isActive = value === period;
          return (
            <button
              key={period}
              type="button"
              onClick={() => onChange(period)}
              className={cn(
                "squircle shrink-0 flex-1 px-2 py-2 text-[10px] transition-all sm:px-4 sm:py-2.5 sm:text-xs lg:px-6 lg:py-3 lg:text-sm",
                isActive
                  ? "bg-white font-bold text-primary shadow-sm"
                  : "font-medium text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              {period}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { PERIODS };
