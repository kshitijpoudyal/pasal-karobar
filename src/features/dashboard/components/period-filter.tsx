"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;

type Period = (typeof PERIODS)[number];

type PeriodFilterProps = {
  className?: string;
};

export function PeriodFilter({ className }: PeriodFilterProps) {
  const [active, setActive] = useState<Period>("WEEKLY");

  return (
    <section className={cn("flex", className)}>
      <div className="squircle flex w-full max-w-2xl bg-surface-container-low p-1.5">
        {PERIODS.map((period) => {
          const isActive = active === period;
          return (
            <button
              key={period}
              type="button"
              onClick={() => setActive(period)}
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
    </section>
  );
}
