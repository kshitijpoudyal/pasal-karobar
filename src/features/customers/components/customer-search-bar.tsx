"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { CustomerVisitFilterSegment } from "@/features/customers/components/customer-secondary-filters";
import { hasCustomerSecondaryFilters } from "@/features/customers/constants";
import type { CustomerVisitFilter } from "@/features/customers/constants";
import { cn } from "@/lib/utils";

type CustomerSearchBarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  visitFilter: CustomerVisitFilter;
  onVisitFilterChange: (value: CustomerVisitFilter) => void;
};

export function CustomerSearchBar({
  searchQuery,
  onSearchQueryChange,
  visitFilter,
  onVisitFilterChange,
}: CustomerSearchBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const filtersActive = hasCustomerSecondaryFilters(visitFilter);

  useEffect(() => {
    if (!filtersOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setFiltersOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [filtersOpen]);

  return (
    <div className="relative flex w-full min-w-0 items-center gap-0 rounded-full border border-outline-variant bg-surface-container-lowest shadow-sm">
      <Search
        className="pointer-events-none absolute left-4 size-5 text-on-surface-variant"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        placeholder="Search name or phone…"
        className="font-body min-w-0 flex-1 rounded-l-full border-none bg-transparent py-3 pr-2 pl-12 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
        aria-label="Search customers"
      />
      <div ref={rootRef} className="relative shrink-0 pr-1.5">
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-haspopup="true"
          aria-controls={filtersOpen ? menuId : undefined}
          aria-label="Filter by visits"
          onClick={() => setFiltersOpen((open) => !open)}
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-colors",
            filtersActive || filtersOpen
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-low",
          )}
        >
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </button>
        {filtersOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute top-[calc(100%+0.5rem)] right-0 z-30 w-[min(calc(100vw-2.5rem),20rem)] rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              <span className="text-label-sm font-semibold tracking-widest text-on-surface-variant uppercase">
                Visits
              </span>
              <CustomerVisitFilterSegment
                visitFilter={visitFilter}
                onVisitFilterChange={(value) => {
                  onVisitFilterChange(value);
                  setFiltersOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
