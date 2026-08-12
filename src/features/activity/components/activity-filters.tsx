"use client";

import { AmountVisibilityToggle } from "@/components/amount-visibility-toggle";
import { ActivitySearchBar } from "@/features/activity/components/activity-search-bar";
import { useAmountFormat } from "@/hooks/use-amount-format";
import { cn } from "@/lib/utils";
import {
  TIMEFRAMES,
  type ActivityCategoryFilter,
  type ActivityPaymentFilter,
  type ActivityTimeframe,
} from "@/features/activity/constants";

export { TIMEFRAMES };

type ActivityFiltersProps = {
  timeframe: ActivityTimeframe;
  category: ActivityCategoryFilter;
  paymentMethod: ActivityPaymentFilter;
  searchQuery: string;
  onTimeframeChange: (value: ActivityTimeframe) => void;
  onCategoryChange: (value: ActivityCategoryFilter) => void;
  onPaymentMethodChange: (value: ActivityPaymentFilter) => void;
  onSearchQueryChange: (value: string) => void;
};

export function ActivityFilters({
  timeframe,
  category,
  paymentMethod,
  searchQuery,
  onTimeframeChange,
  onCategoryChange,
  onPaymentMethodChange,
  onSearchQueryChange,
}: ActivityFiltersProps) {
  return (
    <div className="col-span-12 flex min-w-0 flex-col gap-3 xl:col-span-8">
      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {TIMEFRAMES.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onTimeframeChange(label)}
            className={cn(
              "shrink-0 rounded-full px-6 py-2.5 text-sm font-medium shadow-md transition-colors active:scale-95",
              timeframe === label
                ? "bg-primary text-on-primary"
                : "border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ActivitySearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        category={category}
        paymentMethod={paymentMethod}
        onCategoryChange={onCategoryChange}
        onPaymentMethodChange={onPaymentMethodChange}
      />
    </div>
  );
}

export function DailyNetRevenueCard({ netRevenue }: { netRevenue: number }) {
  const { formatNpr, formatNprNumber } = useAmountFormat();

  return (
    <>
      <section className="flex flex-col gap-1 rounded-2xl bg-primary px-6 py-4 text-on-primary shadow-lg lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-semibold tracking-[0.12em] text-on-primary-container uppercase">
            Net for period
          </span>
          <AmountVisibilityToggle variant="onPrimary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-title-md font-bold">रू</span>
          <h2 className="font-headline text-[32px] leading-none font-bold tracking-tight">
            {formatNprNumber(netRevenue)}
          </h2>
        </div>
      </section>

      <div className="relative col-span-12 hidden min-w-0 flex-col justify-between overflow-hidden rounded-squircle bg-primary p-6 text-on-primary shadow-xl lg:flex xl:col-span-4 xl:p-8">
        <div className="z-10 flex items-start justify-between gap-3">
          <div>
            <p className="text-label-sm font-bold tracking-[0.2em] uppercase opacity-70">
              Net for period
            </p>
            <h3 className="font-headline mt-2 text-3xl font-bold xl:text-4xl">
              {formatNpr(netRevenue)}
            </h3>
          </div>
          <AmountVisibilityToggle variant="onPrimary" />
        </div>
        <div className="z-10 mt-4 flex items-center gap-2 text-sm font-medium">
          <span className="text-on-primary/90">Income minus expenses</span>
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
    </>
  );
}
