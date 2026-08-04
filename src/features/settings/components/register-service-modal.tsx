"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";
import type { UseFormReturn } from "react-hook-form";

import { ServiceIconPicker } from "@/features/settings/components/service-icon-picker";
import type { RegisterServiceFormValues } from "@/features/settings/hooks/use-service-catalog-section";
import { cn } from "@/lib/utils";

const FIELD_LABEL =
  "block text-xs font-semibold tracking-wider text-on-surface-variant uppercase";

const FIELD_INPUT =
  "font-body w-full border-none bg-surface-container-low py-3 text-base text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none rounded-squircle-sm px-4";

type RegisterServiceModalProps = {
  open: boolean;
  onClose: () => void;
  form: UseFormReturn<RegisterServiceFormValues>;
  onSubmit: () => void;
  isSubmitting: boolean;
  title?: string;
  submitLabel?: string;
  submittingLabel?: string;
};

export function RegisterServiceModal({
  open,
  onClose,
  form,
  onSubmit,
  isSubmitting,
  title = "Add Service",
  submitLabel = "Add service",
  submittingLabel = "Saving…",
}: RegisterServiceModalProps) {
  const titleId = useId();
  const fieldIdPrefix = useId();
  const nameFieldId = `${fieldIdPrefix}-service-name`;
  const priceFieldId = `${fieldIdPrefix}-service-price`;
  const {
    register,
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-squircle bg-surface-container-lowest shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-surface-container-high px-8 pt-8 pb-6">
          <h2
            id={titleId}
            className="font-headline m-0 text-2xl font-semibold text-on-surface"
          >
            {title}
          </h2>
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-6" strokeWidth={2} aria-hidden />
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className="space-y-8 p-8">
            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor={nameFieldId}>
                Name
              </label>
              <input
                id={nameFieldId}
                type="text"
                placeholder="Enter service name"
                autoFocus
                className={FIELD_INPUT}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-error">{errors.name.message}</p>
              ) : null}
            </div>
            <ServiceIconPicker control={control} name="icon" />
            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor={priceFieldId}>
                Default Price
              </label>
              <div className="relative">
                <span className="font-body pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant">
                  Rs.
                </span>
                <input
                  id={priceFieldId}
                  type="number"
                  inputMode="decimal"
                  className={cn(FIELD_INPUT, "record-entry-amount-input pl-14")}
                  {...register("default_price", { valueAsNumber: true })}
                />
              </div>
              {errors.default_price ? (
                <p className="text-xs text-error">{errors.default_price.message}</p>
              ) : null}
            </div>
          </div>

          <footer className="flex flex-wrap gap-4 px-8 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-squircle bg-primary-container px-8 py-3 font-medium text-white transition-colors hover:bg-primary-container/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:opacity-60"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-squircle border border-outline-variant bg-transparent px-8 py-3 font-medium text-on-surface transition-colors hover:bg-surface-container-low focus:ring-2 focus:ring-outline focus:ring-offset-2 focus:outline-none"
            >
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
