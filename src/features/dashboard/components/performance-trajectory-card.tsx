"use client";

import type { TrajectoryPoint } from "@/services/dashboard.service";
import { formatCompactNpr } from "@/utils/format";
import { cn } from "@/lib/utils";

type PerformanceTrajectoryCardProps = {
  points?: TrajectoryPoint[];
};

export function PerformanceTrajectoryCard({
  points = [],
}: PerformanceTrajectoryCardProps) {
  const safePoints = points ?? [];

  const maxValue = Math.max(
    1,
    ...safePoints.flatMap((p) => [p.income, p.expense]),
  );

  const peak = safePoints.reduce<TrajectoryPoint | null>((best, point) => {
    if (!best || point.income > best.income) return point;
    return best;
  }, null);

  return (
    <div className="squircle col-span-8 flex flex-col bg-surface-container-low p-10">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Performance Trajectory
        </h3>
        <div className="flex items-center gap-6">
          <span className="text-label-sm flex items-center gap-2 text-on-surface-variant">
            <span className="squircle size-3 bg-primary" />
            Income
          </span>
          <span className="text-label-sm flex items-center gap-2 text-on-surface-variant">
            <span className="squircle size-3 bg-surface-container-highest" />
            Expense
          </span>
        </div>
      </div>
      {safePoints.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No transaction data for this period.
        </p>
      ) : (
        <div className="relative min-h-[350px] flex-1">
          <div className="absolute inset-0 flex items-end gap-2 px-2 pb-14 sm:gap-4">
            {safePoints.map((point) => {
              const incomeHeight = (point.income / maxValue) * 100;
              const expenseHeight = (point.expense / maxValue) * 100;
              const isPeak = peak?.label === point.label && point.income > 0;

              return (
                <div
                  key={point.label}
                  className="flex h-full flex-1 items-end justify-center gap-1"
                >
                  <div className="relative flex h-full w-1/2 max-w-8 flex-col justify-end">
                    <div
                      className={cn(
                        "squircle w-full min-h-[4px] rounded-b-none bg-primary transition-all",
                        isPeak && "ring-2 ring-primary/30",
                      )}
                      style={{
                        height: `${Math.max(incomeHeight, point.income > 0 ? 4 : 0)}%`,
                      }}
                      title={`Income ${formatCompactNpr(point.income)}`}
                    />
                    {isPeak ? (
                      <div className="squircle absolute -top-11 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap bg-on-surface px-3 py-1.5 text-[10px] font-bold tracking-wider text-surface-bright uppercase sm:block">
                        {formatCompactNpr(point.income)}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex h-full w-1/2 max-w-8 flex-col justify-end">
                    <div
                      className="squircle w-full min-h-[4px] rounded-b-none bg-surface-container-highest transition-all"
                      style={{
                        height: `${Math.max(expenseHeight, point.expense > 0 ? 4 : 0)}%`,
                      }}
                      title={`Expense ${formatCompactNpr(point.expense)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-label-sm absolute bottom-0 flex w-full justify-between gap-1 border-t border-surface-container-high pt-6 font-bold text-on-surface-variant uppercase">
            {safePoints.map((point) => (
              <span key={point.label} className="flex-1 truncate text-center text-[10px] sm:text-xs">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
