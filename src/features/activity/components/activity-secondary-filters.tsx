"use client";

import { PaymentMethodIcon } from "@/components/payment-method-icon";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";
import {
  PAYMENT_FILTERS,
  type ActivityCategoryFilter,
  type ActivityPaymentFilter,
} from "@/features/activity/constants";

const CATEGORIES = ["All", "Income", "Expense"] as const satisfies readonly ActivityCategoryFilter[];

type ActivityCategorySegmentProps = {
  category: ActivityCategoryFilter;
  onCategoryChange: (value: ActivityCategoryFilter) => void;
  className?: string;
};

export function ActivityCategorySegment({
  category,
  onCategoryChange,
  className,
}: ActivityCategorySegmentProps) {
  return (
    <div
      className={cn(
        "flex rounded-full border border-outline-variant/80 bg-surface-container-low p-1",
        className,
      )}
    >
      {CATEGORIES.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onCategoryChange(label)}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            category === label
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

type ActivityPaymentIconStripProps = {
  paymentMethod: ActivityPaymentFilter;
  onPaymentMethodChange: (value: ActivityPaymentFilter) => void;
  className?: string;
};

export function ActivityPaymentIconStrip({
  paymentMethod,
  onPaymentMethodChange,
  className,
}: ActivityPaymentIconStripProps) {
  return (
    <div
      className={cn(
        "hide-scrollbar flex gap-1.5 overflow-x-auto",
        className,
      )}
    >
      {PAYMENT_FILTERS.map(({ value, label }) => {
        const selected = paymentMethod === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={selected}
            title={label}
            onClick={() => onPaymentMethodChange(value)}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors active:scale-95",
              selected
                ? "border-primary bg-primary-container/25 ring-2 ring-primary/25"
                : "border-outline-variant/80 bg-surface-container-lowest hover:bg-surface-container-low",
            )}
          >
            {value === "All" ? (
              <span className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                All
              </span>
            ) : (
              <PaymentMethodIcon method={value as PaymentMethod} />
            )}
          </button>
        );
      })}
    </div>
  );
}
