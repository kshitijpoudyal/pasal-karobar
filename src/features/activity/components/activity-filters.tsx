"use client";

import { useState } from "react";
import { CalendarDays, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const TIMEFRAMES = ["Today", "Yesterday", "This Week"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

const CATEGORIES = ["All", "Income", "Expense"] as const;
type Category = (typeof CATEGORIES)[number];

export function ActivityFilters() {
  const [timeframe, setTimeframe] = useState<Timeframe>("Today");
  const [category, setCategory] = useState<Category>("All");

  return (
    <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-label-sm mr-4 font-semibold tracking-widest text-on-surface-variant uppercase">
          Timeframe
        </span>
        {TIMEFRAMES.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTimeframe(label)}
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
              onClick={() => setCategory(label)}
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

export function DailyNetRevenueCard() {
  return (
    <div className="relative col-span-12 flex flex-col justify-between overflow-hidden rounded-squircle bg-primary p-8 text-on-primary shadow-xl lg:col-span-4">
      <div className="z-10">
        <p className="text-label-sm font-bold tracking-[0.2em] uppercase opacity-70">
          Daily Net Revenue
        </p>
        <h3 className="font-headline mt-2 text-4xl font-bold">रू 8,450</h3>
      </div>
      <div className="z-10 mt-4 flex items-center gap-2 text-sm font-medium">
        <TrendingUp className="size-[18px]" strokeWidth={2} />
        <span className="text-on-primary/90">12% increase from yesterday</span>
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
