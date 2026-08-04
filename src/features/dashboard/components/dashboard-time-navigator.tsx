"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { PeriodPickerDialog } from "@/components/period-picker";
import type { PeriodPickerMode } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import {
  clampAnchorToToday,
  formatDashboardScrubberLabel,
  isDashboardAtLatest,
  resolveDashboardRange,
  stepDashboardAnchor,
  type DashboardGranularity,
} from "@/utils/date-ranges";

const GRANULARITIES: { id: DashboardGranularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

type DashboardTimeNavigatorProps = {
  granularity: DashboardGranularity;
  anchorDate: Date;
  onGranularityChange: (value: DashboardGranularity) => void;
  onAnchorChange: (date: Date) => void;
};

export function DashboardTimeNavigator({
  granularity,
  anchorDate,
  onGranularityChange,
  onAnchorChange,
}: DashboardTimeNavigatorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const periodTriggerRef = useRef<HTMLDivElement>(null);
  const range = resolveDashboardRange(granularity, anchorDate);
  const scrubberLabel = formatDashboardScrubberLabel(
    granularity,
    anchorDate,
    range,
  );
  const atLatest = isDashboardAtLatest(granularity, anchorDate);

  function step(direction: -1 | 1) {
    onAnchorChange(stepDashboardAnchor(granularity, anchorDate, direction));
  }

  const pickerMode = granularity as PeriodPickerMode;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div
          className="flex w-full rounded-full border border-outline-variant bg-surface-container-lowest p-1.5 lg:w-1/2 lg:max-w-none"
          role="tablist"
          aria-label="Dashboard period"
        >
          {GRANULARITIES.map(({ id, label }) => {
            const selected = granularity === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onGranularityChange(id)}
                className={cn(
                  "min-w-0 flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors",
                  selected
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          ref={periodTriggerRef}
          className="inline-flex w-fit items-center self-start rounded-full border border-outline-variant bg-surface-container-lowest p-1.5 lg:ml-auto lg:shrink-0"
        >
          <button
            type="button"
            aria-label="Previous period"
            onClick={() => step(-1)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="font-headline max-w-[12rem] shrink-0 rounded-full px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low sm:max-w-none"
            aria-label="Choose period"
          >
            <span className="block truncate sm:whitespace-nowrap">{scrubberLabel}</span>
          </button>

          <button
            type="button"
            aria-label="Next period"
            disabled={atLatest}
            onClick={() => step(1)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-30"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <PeriodPickerDialog
        open={pickerOpen}
        mode={pickerMode}
        anchorDate={anchorDate}
        anchorRef={periodTriggerRef}
        onClose={() => setPickerOpen(false)}
        onApply={(date) => onAnchorChange(clampAnchorToToday(date))}
      />
    </>
  );
}
