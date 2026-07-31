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
    <div className={cn("flex shrink-0", className)}>
      <div className="squircle flex max-w-2xl bg-surface-container-low p-1.5">
        {PERIODS.map((period) => {
          const isActive = value === period;
          return (
            <button
              key={period}
              type="button"
              onClick={() => onChange(period)}
              className={cn(
                "squircle flex-1 px-6 py-3 transition-all",
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
