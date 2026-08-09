"use client";

import { cn } from "@/lib/utils";
import {
  CUSTOMER_VISIT_FILTERS,
  type CustomerVisitFilter,
} from "@/features/customers/constants";

type CustomerVisitFilterSegmentProps = {
  visitFilter: CustomerVisitFilter;
  onVisitFilterChange: (value: CustomerVisitFilter) => void;
  className?: string;
};

export function CustomerVisitFilterSegment({
  visitFilter,
  onVisitFilterChange,
  className,
}: CustomerVisitFilterSegmentProps) {
  return (
    <div
      className={cn(
        "flex rounded-full border border-outline-variant/80 bg-surface-container-low p-1",
        className,
      )}
    >
      {CUSTOMER_VISIT_FILTERS.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onVisitFilterChange(label)}
          className={cn(
            "flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
            visitFilter === label
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-lowest/80",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
