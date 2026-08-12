import { LineChart, Scissors, Sparkles, UserPlus, UserRound } from "lucide-react";

import { formatCompactNpr } from "@/utils/format";
import { MonthDayHeatmapCard } from "@/features/dashboard/components/month-day-heatmap-card";
import type { MonthDayHeatmap } from "@/services/dashboard-summary";

type TopService = { name: string; total: number };

type DashboardBottomSectionProps = {
  topServices?: TopService[];
  monthDayHeatmap?: MonthDayHeatmap | null;
};

export function DashboardBottomSection({
  topServices = [],
  monthDayHeatmap = null,
}: DashboardBottomSectionProps) {
  const rows = topServices.slice(0, 3);
  const icons = [Scissors, UserRound, Sparkles];

  return (
    <section className="hidden grid-cols-1 gap-6 lg:grid xl:grid-cols-12 xl:gap-8">
      <div className="squircle min-w-0 bg-surface-container-low p-6 xl:col-span-4 xl:p-10">
        <h3 className="font-headline-md text-headline-md mb-8 text-on-surface">
          Premium Services
        </h3>
        <div className="space-y-4">
          {rows.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No service revenue yet.</p>
          ) : (
            rows.map(({ name, total }, index) => {
              const Icon = icons[index] ?? Scissors;
              return (
                <div
                  key={name}
                  className="squircle flex items-center justify-between bg-surface-container p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="squircle flex size-12 items-center justify-center bg-primary/10 text-primary">
                      <Icon className="size-6" strokeWidth={1.75} />
                    </div>
                    <span className="min-w-0 truncate font-bold text-on-surface">
                      {name}
                    </span>
                  </div>
                  <span className="font-bold text-primary">
                    {formatCompactNpr(total)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <MonthDayHeatmapCard heatmap={monthDayHeatmap} />

      <div className="squircle flex min-w-0 flex-col bg-surface-container-low p-6 xl:col-span-4 xl:p-10">
        <h3 className="font-headline-md text-headline-md mb-8 text-on-surface">
          Monthly Projection
        </h3>
        <div className="squircle flex flex-1 flex-col justify-center border-2 border-dashed border-outline-variant bg-surface-container p-6 xl:p-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-label-sm mb-1 font-bold tracking-widest text-on-surface-variant uppercase">
                  Target Yield
                </span>
                <span className="text-2xl font-bold text-on-surface xl:text-3xl">
                  रू 52,000
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-on-surface-variant uppercase">
                +23% <LineChart className="size-[18px]" strokeWidth={2.25} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-label-sm mb-1 font-bold tracking-widest text-on-surface-variant uppercase">
                  Patron Count
                </span>
                <span className="text-2xl font-bold text-on-surface xl:text-3xl">
                  182
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-on-surface-variant uppercase">
                +34 <UserPlus className="size-[18px]" strokeWidth={2.25} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
