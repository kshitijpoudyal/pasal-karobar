import {
  LineChart,
  Scissors,
  Sparkles,
  UserPlus,
  UserRound,
} from "lucide-react";

import { formatCompactNpr } from "@/utils/format";

type TopService = { name: string; total: number };

type DashboardBottomSectionProps = {
  topServices?: TopService[];
};

export function DashboardBottomSection({
  topServices = [],
}: DashboardBottomSectionProps) {
  const rows = topServices.slice(0, 3);
  const icons = [Scissors, UserRound, Sparkles];

  return (
    <section className="grid grid-cols-12 gap-8">
      <div className="squircle col-span-4 bg-surface-container-low p-10">
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
                    <span className="font-bold text-on-surface">{name}</span>
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

      <div className="squircle col-span-4 bg-surface-container-low p-10">
        <h3 className="font-headline-md text-headline-md mb-8 text-on-surface">
          Occupancy Flow
        </h3>
        <div className="flex h-60 items-end gap-2 px-2">
          <div
            className="squircle h-[15%] flex-1 rounded-b-none bg-surface-container-high"
            title="9 AM"
          />
          <div
            className="squircle h-[25%] flex-1 rounded-b-none bg-surface-container-high"
            title="10 AM"
          />
          <div
            className="squircle h-[50%] flex-1 rounded-b-none bg-secondary/20"
            title="11 AM"
          />
          <div
            className="squircle h-[65%] flex-1 rounded-b-none bg-secondary/40"
            title="12 PM"
          />
          <div
            className="squircle h-[90%] flex-1 rounded-b-none bg-secondary/60"
            title="1 PM"
          />
          <div
            className="squircle h-[85%] flex-1 rounded-b-none bg-secondary/80"
            title="2 PM"
          />
          <div
            className="squircle h-full flex-1 rounded-b-none bg-secondary"
            title="3 PM"
          />
          <div
            className="squircle h-[95%] flex-1 rounded-b-none bg-secondary/80"
            title="4 PM"
          />
          <div
            className="squircle h-[75%] flex-1 rounded-b-none bg-secondary/60"
            title="5 PM"
          />
          <div
            className="squircle h-[35%] flex-1 rounded-b-none bg-surface-container-high"
            title="6 PM"
          />
        </div>
        <div className="text-label-sm mt-8 flex justify-between font-bold text-on-surface-variant uppercase">
          <span>09:00</span>
          <span className="text-secondary">15:00 Apex</span>
          <span>18:00</span>
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-8">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Monthly Projection
        </h3>
        <div className="squircle flex flex-1 flex-col justify-center border-2 border-dashed border-primary/20 bg-primary/5 p-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-label-sm mb-1 font-bold tracking-widest text-on-surface-variant uppercase">
                  Target Yield
                </span>
                <span className="text-3xl font-bold text-primary">रू 52,000</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-secondary uppercase">
                +23% <LineChart className="size-[18px]" strokeWidth={2.25} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-label-sm mb-1 font-bold tracking-widest text-on-surface-variant uppercase">
                  Patron Count
                </span>
                <span className="text-3xl font-bold text-on-surface">182</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-secondary uppercase">
                +34 <UserPlus className="size-[18px]" strokeWidth={2.25} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
