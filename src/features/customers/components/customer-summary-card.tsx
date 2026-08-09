"use client";

import { Users } from "lucide-react";

type CustomerSummaryCardProps = {
  trackedVisits: number;
  totalCustomers: number;
};

export function CustomerSummaryCard({
  trackedVisits,
  totalCustomers,
}: CustomerSummaryCardProps) {
  return (
    <div className="relative col-span-12 hidden min-w-0 flex-col justify-between overflow-hidden rounded-squircle bg-primary p-6 text-on-primary shadow-xl lg:flex xl:col-span-4 xl:p-8">
      <div className="z-10">
        <p className="text-label-sm font-bold tracking-[0.2em] uppercase opacity-70">
          Tracked visits
        </p>
        <h3 className="font-headline mt-2 text-3xl font-bold xl:text-4xl">
          {trackedVisits}
        </h3>
        <p className="mt-2 text-sm font-medium text-on-primary/90">
          {totalCustomers} customer{totalCustomers === 1 ? "" : "s"} on file
        </p>
      </div>
      <div className="z-10 mt-4 flex items-center gap-2 text-sm font-medium">
        <Users className="size-[18px]" strokeWidth={2} />
        <span className="text-on-primary/90">Named or phone-linked income</span>
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
