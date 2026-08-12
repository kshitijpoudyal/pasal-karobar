"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";

import type { MonthDayHeatmap } from "@/services/dashboard-summary";
import { formatCompactNpr } from "@/utils/format";
import { cn } from "@/lib/utils";

type HeatmapMetric = "visits" | "revenue";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type MonthDayHeatmapCardProps = {
  heatmap: MonthDayHeatmap | null;
};

export function MonthDayHeatmapCard({ heatmap }: MonthDayHeatmapCardProps) {
  const [metric, setMetric] = useState<HeatmapMetric>("visits");

  const { maxValue, peakDateKey, hasActivity } = useMemo(() => {
    if (!heatmap) {
      return { maxValue: 1, peakDateKey: null as string | null, hasActivity: false };
    }
    const inMonth = heatmap.days.filter((d) => d.inMonth);
    let max = 0;
    let peak: string | null = null;
    for (const day of inMonth) {
      const value = metric === "visits" ? day.visitCount : day.revenue;
      if (value > max) {
        max = value;
        peak = day.dateKey;
      }
    }
    return {
      maxValue: Math.max(max, 1),
      peakDateKey: peak,
      hasActivity: max > 0,
    };
  }, [heatmap, metric]);

  if (!heatmap) {
    return (
      <div className="squircle col-span-full min-w-0 bg-surface-container-low p-6 xl:col-span-4 xl:p-10">
        <h3 className="font-headline-md text-headline-md mb-4 text-on-surface">
          Monthly Activity
        </h3>
        <p className="text-sm text-on-surface-variant">No calendar data available.</p>
      </div>
    );
  }

  return (
    <div className="squircle col-span-full min-w-0 overflow-hidden bg-surface-container-low p-6 xl:col-span-4 xl:p-10">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Monthly Activity
          </h3>
          <p className="text-sm text-on-surface-variant">{heatmap.monthLabel}</p>
        </div>
        <div className="squircle flex bg-surface-container p-1">
          <MetricToggle
            active={metric === "visits"}
            onClick={() => setMetric("visits")}
            label="Busiest (visits)"
          />
          <MetricToggle
            active={metric === "revenue"}
            onClick={() => setMetric("revenue")}
            label="Most income"
          />
        </div>
      </div>

      {!hasActivity ? (
        <p className="text-sm text-on-surface-variant">No income this month yet.</p>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-label-sm text-center text-[10px] font-bold text-on-surface-variant uppercase"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 overflow-hidden sm:gap-1.5">
            {heatmap.days.map((day, index) => (
              <HeatmapCell
                key={day.inMonth ? day.dateKey : `pad-${index}`}
                day={day}
                metric={metric}
                maxValue={maxValue}
                isPeak={day.inMonth && day.dateKey === peakDateKey}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MetricToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "squircle flex-1 px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs",
        active
          ? "bg-white text-primary shadow-sm"
          : "text-on-surface-variant hover:bg-surface-container-high",
      )}
    >
      {label}
    </button>
  );
}

function HeatmapCell({
  day,
  metric,
  maxValue,
  isPeak,
}: {
  day: MonthDayHeatmap["days"][number];
  metric: HeatmapMetric;
  maxValue: number;
  isPeak: boolean;
}) {
  if (!day.inMonth) {
    return <div className="aspect-square min-h-7" aria-hidden />;
  }

  const value = metric === "visits" ? day.visitCount : day.revenue;
  const intensity = value / maxValue;
  const labelDate = format(parseISO(day.dateKey), "MMM d, yyyy");
  const customerLabel =
    day.visitCount === 1 ? "1 customer" : `${day.visitCount} customers`;
  const ariaLabel = `${labelDate}: ${customerLabel}, ${formatCompactNpr(day.revenue)} income`;

  const hasValue = value > 0;
  const textClass = hasValue
    ? intensity >= 0.45
      ? "text-on-primary"
      : "text-on-surface"
    : "text-on-surface-variant/50";

  return (
    <div className="group/cell relative aspect-square min-h-7">
      <div
        className={cn(
          "squircle flex size-full items-center justify-center text-[10px] font-bold transition-colors",
          isPeak &&
            hasValue &&
            "ring-2 ring-primary ring-offset-1 ring-offset-surface-container-low",
          !hasValue && "bg-surface-container-high",
          textClass,
        )}
        style={
          hasValue
            ? {
                backgroundColor: `color-mix(in oklch, var(--color-primary) ${Math.round(20 + intensity * 80)}%, transparent)`,
              }
            : undefined
        }
        aria-label={ariaLabel}
      >
        {day.dayOfMonth}
      </div>
      {hasValue ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-on-surface px-3 py-2 text-left shadow-lg group-hover/cell:block"
        >
          <p className="text-[10px] font-bold tracking-wide text-surface-bright uppercase">
            {labelDate}
          </p>
          <p className="text-xs text-surface-container-lowest/90">{customerLabel}</p>
          <p className="text-xs font-semibold text-surface-bright">
            {formatCompactNpr(day.revenue)} income
          </p>
        </div>
      ) : null}
    </div>
  );
}
