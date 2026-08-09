"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import type { Customer } from "@/types/database";
import { cn } from "@/lib/utils";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";

const MIN_DIGITS_FOR_SUGGESTIONS = 2;
const MAX_SUGGESTIONS = 8;

function matchCustomers(customers: Customer[], query: string): Customer[] {
  const digits = query.replace(/\D/g, "");
  if (digits.length < MIN_DIGITS_FOR_SUGGESTIONS) return [];

  const matched = customers.filter((customer) =>
    customer.phone_normalized.includes(digits),
  );

  matched.sort((a, b) => {
    const aPrefix = a.phone_normalized.startsWith(digits) ? 0 : 1;
    const bPrefix = b.phone_normalized.startsWith(digits) ? 0 : 1;
    if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    return a.phone_normalized.localeCompare(b.phone_normalized);
  });

  return matched.slice(0, MAX_SUGGESTIONS);
}

type CustomerPhoneAutocompleteProps = {
  id: string;
  labelClassName: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  /** Matches squircle field cards in add-customer (same as name / notes). */
  variant?: "default" | "embedded";
};

const EMBEDDED_INPUT_CLASS =
  "font-body w-full border-none bg-transparent p-0 text-lg font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0";

export function CustomerPhoneAutocomplete({
  id,
  labelClassName,
  label = "Customer phone (optional)",
  value,
  onChange,
  inputClassName,
  variant = "default",
}: CustomerPhoneAutocompleteProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const { businessId } = useActiveBusiness();
  const customersQuery = useCustomersQuery(businessId);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(
    () => matchCustomers(customersQuery.data ?? [], value),
    [customersQuery.data, value],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, value]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const showList = open && suggestions.length > 0;

  function pickCustomer(customer: Customer) {
    onChange(customer.phone_normalized);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative",
        variant === "embedded"
          ? "squircle space-y-3 bg-surface-container-lowest p-5 shadow-sm"
          : "flex flex-col gap-2",
      )}
    >
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listboxId : undefined}
        aria-autocomplete="list"
        placeholder="9841234567"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showList) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex(
              (i) => (i - 1 + suggestions.length) % suggestions.length,
            );
          } else if (event.key === "Enter" && suggestions[activeIndex]) {
            event.preventDefault();
            pickCustomer(suggestions[activeIndex]!);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(
          variant === "embedded"
            ? EMBEDDED_INPUT_CLASS
            : "font-body w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none focus:border-primary",
          inputClassName,
        )}
      />
      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          {suggestions.map((customer, index) => {
            const label = formatNepalPhoneDisplay(customer.phone_normalized);
            return (
              <li key={customer.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pickCustomer(customer)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-container-low",
                    index === activeIndex && "bg-surface-container-low",
                  )}
                >
                  <span className="font-medium text-on-surface">{label}</span>
                  {customer.name ? (
                    <span className="text-xs text-on-surface-variant">
                      {customer.name}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
