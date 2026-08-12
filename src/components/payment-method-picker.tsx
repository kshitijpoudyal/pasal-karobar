"use client";

import type { ReactNode } from "react";
import { Banknote, Landmark, QrCode } from "lucide-react";

import { PaymentMethodIcon } from "@/components/payment-method-icon";
import { cn } from "@/lib/utils";
import type { BusinessPaymentMethodRecord } from "@/types/database";
import type { PaymentMethod } from "@/types/database";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

export type PaymentMethodPickerOption = {
  id: string;
  methodCode: PaymentMethod;
  label: string;
};

export function businessPaymentRowsToPickerOptions(
  rows: BusinessPaymentMethodRecord[],
): PaymentMethodPickerOption[] {
  return rows.map((row) => ({
    id: row.id,
    methodCode: row.method_code,
    label: row.label.trim(),
  }));
}

export function PaymentMethodVisual({
  methodCode,
  size = "md",
}: {
  methodCode: PaymentMethod;
  size?: "sm" | "md";
}) {
  const scale = size === "sm" ? "scale-90" : "";
  return (
    <span className={cn("inline-flex items-center justify-center", scale)}>
      {renderPickerIcon(methodCode, size)}
    </span>
  );
}

function renderPickerIcon(
  methodCode: PaymentMethod,
  size: "sm" | "md" = "md",
): ReactNode {
  const iconSize = size === "sm" ? "size-5" : "size-7";
  const badgeSize = size === "sm" ? "size-5 text-[7px]" : "size-7 text-[10px]";
  if (methodCode === "OTHER") {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-lg bg-surface-container-highest font-bold text-on-surface-variant",
          badgeSize,
        )}
      >
        ···
      </span>
    );
  }
  if (methodCode === "ESEWA") {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-[#4CAF50] font-bold text-white",
          badgeSize,
        )}
      >
        eS
      </div>
    );
  }
  if (methodCode === "KHALTI") {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-[#673AB7] font-bold text-white",
          badgeSize,
        )}
      >
        K
      </div>
    );
  }
  if (methodCode === "CASH") {
    return (
      <Banknote
        className={cn(iconSize, "text-secondary")}
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  if (methodCode === "BANK_TRANSFER") {
    return (
      <Landmark
        className={cn(iconSize, "text-primary")}
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  if (methodCode === "FONEPAY") {
    return (
      <QrCode
        className={cn(iconSize, "text-tertiary-fixed-dim")}
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  return <PaymentMethodIcon method={methodCode} iconClassName={iconSize} />;
}

type PaymentMethodPickerProps = {
  options: PaymentMethodPickerOption[];
  valueId: string;
  onChange: (option: PaymentMethodPickerOption) => void;
  labelClassName?: string;
};

export function PaymentMethodPicker({
  options,
  valueId,
  onChange,
  labelClassName = FIELD_LABEL,
}: PaymentMethodPickerProps) {
  const selected =
    options.find((option) => option.id === valueId) ?? options[0] ?? null;

  if (options.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        Add at least one payment method in Settings.
      </p>
    );
  }

  return (
    <div>
      <p className={`${labelClassName} mb-4`}>Payment Method</p>
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 hide-scrollbar sm:hidden">
        {options.map((option) => (
          <button
            key={`${option.id}-pill`}
            type="button"
            data-selected={selected?.id === option.id}
            onClick={() => onChange(option)}
            className="payment-method-pill shrink-0 flex cursor-pointer items-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 shadow-sm active:scale-95"
          >
            <span className="flex shrink-0 items-center justify-center [&_svg]:size-5">
              {renderPickerIcon(option.methodCode)}
            </span>
            <span className="font-body text-sm font-medium whitespace-nowrap text-on-surface">
              {option.label}
            </span>
          </button>
        ))}
      </div>
      <div className="hidden flex-wrap gap-3 sm:flex">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            data-selected={selected?.id === option.id}
            onClick={() => onChange(option)}
            className="payment-method-tile squircle flex min-w-[90px] flex-1 cursor-pointer flex-col items-center gap-2 bg-surface-container-low py-4 shadow-sm hover:shadow-md active:scale-95"
          >
            {renderPickerIcon(option.methodCode)}
            <span className="font-body text-[12px] font-medium text-on-surface">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PaymentMethodListIcon({
  methodCode,
  label,
}: {
  methodCode: PaymentMethod;
  label: string;
}) {
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high"
      aria-hidden
    >
      <span className="flex scale-90 items-center justify-center">
        {renderPickerIcon(methodCode)}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
