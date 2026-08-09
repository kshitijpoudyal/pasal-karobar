"use client";

import { Plus } from "lucide-react";

import { CustomerSearchBar } from "@/features/customers/components/customer-search-bar";
import { TIMEFRAMES } from "@/features/activity/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityTimeframe } from "@/utils/date-ranges";
import type { CustomerVisitFilter } from "@/features/customers/constants";

type CustomerFiltersProps = {
  timeframe: ActivityTimeframe;
  visitFilter: CustomerVisitFilter;
  searchQuery: string;
  onTimeframeChange: (value: ActivityTimeframe) => void;
  onVisitFilterChange: (value: CustomerVisitFilter) => void;
  onSearchQueryChange: (value: string) => void;
  onAddCustomer?: () => void;
  showDesktopAdd?: boolean;
};

export function CustomerFilters({
  timeframe,
  visitFilter,
  searchQuery,
  onTimeframeChange,
  onVisitFilterChange,
  onSearchQueryChange,
  onAddCustomer,
  showDesktopAdd = false,
}: CustomerFiltersProps) {
  return (
    <div className="col-span-12 flex min-w-0 flex-col gap-3 xl:col-span-8">
      <div className="flex items-center gap-3">
        <div className="hide-scrollbar -mx-5 min-w-0 flex flex-1 gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
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
        {showDesktopAdd && onAddCustomer ? (
          <Button
            type="button"
            variant="primary"
            size="cta"
            className="hidden shrink-0 lg:inline-flex"
            onClick={onAddCustomer}
          >
            <Plus className="size-5" strokeWidth={2.25} aria-hidden />
            Add customer
          </Button>
        ) : null}
      </div>

      <CustomerSearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        visitFilter={visitFilter}
        onVisitFilterChange={onVisitFilterChange}
      />
    </div>
  );
}
