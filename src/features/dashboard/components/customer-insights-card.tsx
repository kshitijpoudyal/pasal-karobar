"use client";

import Link from "next/link";

import type { CustomerPeriodInsights } from "@/services/customer-analytics.service";

type CustomerInsightsCardProps = {
  insights: CustomerPeriodInsights;
};

export function CustomerInsightsCard({ insights }: CustomerInsightsCardProps) {
  return (
    <section className="squircle bg-surface-container-low p-5 shadow-natural-ink lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-headline text-lg font-bold text-primary">
            Customers
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            New vs returning for this period (tracked by phone on income).
          </p>
        </div>
        <Link
          href="/customers"
          className="text-sm font-medium text-primary hover:underline"
        >
          Full report
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "New", value: insights.newCustomers },
          { label: "Returning", value: insights.returningCustomers },
          { label: "Tracked visits", value: insights.trackedVisits },
          { label: "Anonymous", value: insights.anonymousVisits },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-surface-container-lowest px-3 py-3"
          >
            <p className="text-[10px] font-medium tracking-wide text-on-surface-variant uppercase">
              {item.label}
            </p>
            <p className="font-headline text-xl font-bold text-on-surface">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
