"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import type { Customer } from "@/types/database";
import { cn } from "@/lib/utils";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";

const MIN_DIGITS_FOR_SUGGESTIONS = 2;
const MIN_NAME_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 8;

function normalizePhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("977") && digits.length >= 12) {
    digits = digits.slice(3);
  }
  return digits;
}

function matchCustomers(customers: Customer[], query: string): Customer[] {
  const trimmed = query.trim();
  const digits = trimmed.replace(/\D/g, "");
  const qLower = trimmed.toLowerCase();
  const seen = new Set<string>();
  const matched: Customer[] = [];

  function add(customer: Customer) {
    if (seen.has(customer.id)) return;
    seen.add(customer.id);
    matched.push(customer);
  }

  if (digits.length >= MIN_DIGITS_FOR_SUGGESTIONS) {
    for (const customer of customers) {
      if (customer.phone_normalized.includes(digits)) {
        add(customer);
      }
    }
  }

  if (qLower.length >= MIN_NAME_QUERY_LENGTH) {
    for (const customer of customers) {
      const name = customer.name?.trim().toLowerCase() ?? "";
      if (name.includes(qLower)) {
        add(customer);
      }
    }
  }

  matched.sort((a, b) => {
    if (digits.length >= MIN_DIGITS_FOR_SUGGESTIONS) {
      const aPrefix = a.phone_normalized.startsWith(digits) ? 0 : 1;
      const bPrefix = b.phone_normalized.startsWith(digits) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    }
    return a.phone_normalized.localeCompare(b.phone_normalized);
  });

  return matched.slice(0, MAX_SUGGESTIONS);
}

function findCustomerByPhoneDigits(
  customers: Customer[],
  rawPhone: string,
): Customer | undefined {
  const local = normalizePhoneDigits(rawPhone);
  if (local.length !== 10) return undefined;
  return customers.find((customer) => customer.phone_normalized === local);
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
  nameValue?: string;
  onNameChange?: (name: string) => void;
  nameInputId?: string;
  showLinkedNameField?: boolean;
  /** When false, name is only set from suggestion picks (not from typing a matching phone). */
  autoFillNameFromPhone?: boolean;
};

const EMBEDDED_INPUT_CLASS =
  "font-body w-full border-none bg-transparent p-0 text-lg font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0";

const DEFAULT_FIELD_WRAP_CLASS = "flex flex-col gap-2";

const DEFAULT_INPUT_CLASS =
  "font-body w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none focus:border-primary";

export function CustomerPhoneAutocomplete({
  id,
  labelClassName,
  label = "Customer phone (optional)",
  value,
  onChange,
  inputClassName,
  variant = "default",
  nameValue = "",
  onNameChange,
  nameInputId,
  showLinkedNameField = false,
  autoFillNameFromPhone = true,
}: CustomerPhoneAutocompleteProps) {
  const listboxId = useId();
  const generatedNameInputId = useId();
  const resolvedNameInputId = nameInputId ?? generatedNameInputId;
  const rootRef = useRef<HTMLDivElement>(null);
  const { businessId } = useActiveBusiness();
  const customersQuery = useCustomersQuery(businessId);
  const customers = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [nameQuery, setNameQuery] = useState("");

  const suggestionQuery = showLinkedNameField && nameQuery.trim() ? nameQuery : value;

  const suggestions = useMemo(
    () => matchCustomers(customers, suggestionQuery),
    [customers, suggestionQuery],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, suggestionQuery]);

  useEffect(() => {
    if (!autoFillNameFromPhone || !onNameChange || !value.trim()) return;
    syncNameFromPhone(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when customers load for prefilled phone
  }, [autoFillNameFromPhone, customers, value, onNameChange]);

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

  function applyCustomer(customer: Customer) {
    onChange(customer.phone_normalized);
    onNameChange?.(customer.name?.trim() ?? "");
    setNameQuery("");
    setOpen(false);
  }

  function syncNameFromPhone(rawPhone: string) {
    if (!onNameChange) return;
    const match = findCustomerByPhoneDigits(customers, rawPhone);
    if (match) {
      onNameChange(match.name?.trim() ?? "");
    }
  }

  function handlePhoneChange(raw: string) {
    onChange(raw);
    if (autoFillNameFromPhone) {
      syncNameFromPhone(raw);
    }
    setOpen(true);
  }

  const linkedPair = showLinkedNameField && onNameChange && variant !== "embedded";

  const phoneField = (
    <div
      className={cn(variant === "embedded" ? "space-y-3" : DEFAULT_FIELD_WRAP_CLASS)}
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
        onChange={(event) => handlePhoneChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showList) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
          } else if (event.key === "Enter" && suggestions[activeIndex]) {
            event.preventDefault();
            applyCustomer(suggestions[activeIndex]!);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(
          variant === "embedded" ? EMBEDDED_INPUT_CLASS : DEFAULT_INPUT_CLASS,
          inputClassName,
        )}
      />
    </div>
  );

  const nameField =
    linkedPair && onNameChange ? (
      <div className={DEFAULT_FIELD_WRAP_CLASS}>
        <label className={labelClassName} htmlFor={resolvedNameInputId}>
          Customer name (optional)
        </label>
        <input
          id={resolvedNameInputId}
          type="text"
          autoComplete="name"
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? listboxId : undefined}
          aria-autocomplete="list"
          placeholder="Customer name"
          value={nameValue}
          onChange={(event) => {
            onNameChange(event.target.value);
            setNameQuery(event.target.value);
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
              setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
            } else if (event.key === "Enter" && suggestions[activeIndex]) {
              event.preventDefault();
              applyCustomer(suggestions[activeIndex]!);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className={DEFAULT_INPUT_CLASS}
        />
      </div>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative",
        variant === "embedded" && "squircle bg-surface-container-lowest p-5 shadow-sm",
        !linkedPair && variant !== "embedded" && "flex flex-col gap-4",
      )}
    >
      {linkedPair ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {phoneField}
          {nameField}
        </div>
      ) : (
        phoneField
      )}

      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          {suggestions.map((customer, index) => {
            const phoneLabel = formatNepalPhoneDisplay(customer.phone_normalized);
            const displayName = customer.name?.trim();
            return (
              <li key={customer.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyCustomer(customer)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-container-low",
                    index === activeIndex && "bg-surface-container-low",
                  )}
                >
                  <span className="font-medium text-on-surface">
                    {displayName || phoneLabel}
                  </span>
                  {displayName ? (
                    <span className="text-xs text-on-surface-variant">
                      {phoneLabel}
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
