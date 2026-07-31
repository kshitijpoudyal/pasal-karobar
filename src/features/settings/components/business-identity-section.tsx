"use client";

import { Store } from "lucide-react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { useBusinessIdentityForm } from "@/features/settings/hooks/use-business-identity-form";
import { cn } from "@/lib/utils";

const fieldClassName =
  "squircle h-14 w-full border-none bg-surface-container-high px-6 font-medium text-on-surface transition-all outline-none focus:ring-2 focus:ring-primary";

const labelClassName =
  "px-1 text-xs font-semibold tracking-widest text-on-surface-variant uppercase";

const BUSINESS_TYPES = [
  { value: "BARBER", label: "Barber / men's grooming" },
  { value: "SALON", label: "Salon / unisex" },
  { value: "GROCERY", label: "Grocery" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "OTHER", label: "Other" },
] as const;

export function BusinessIdentitySection() {
  const {
    form,
    onSubmit,
    isLoading,
    error,
    isSaving,
    isSaveSuccess,
    refetch,
  } = useBusinessIdentityForm();

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section>
        <form
          className="squircle bg-surface-container-low p-8"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="squircle bg-primary-container p-3 text-on-primary-container">
              <Store className="size-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-headline text-xl font-semibold">Business Identity</h3>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <label className={labelClassName} htmlFor="business-name">
                Business Name
              </label>
              <input
                id="business-name"
                type="text"
                className={fieldClassName}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-error">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-3">
              <label className={labelClassName} htmlFor="business-type">
                Business Type
              </label>
              <select
                id="business-type"
                className={fieldClassName}
                {...register("business_type")}
              >
                {BUSINESS_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className={labelClassName} htmlFor="currency">
                Currency
              </label>
              <select id="currency" className={fieldClassName} {...register("currency")}>
                <option value="NPR">NPR (Nepalese Rupee)</option>
                <option value="USD">USD (United States Dollar)</option>
                <option value="INR">INR (Indian Rupee)</option>
              </select>
              {errors.currency ? (
                <p className="text-xs text-error">{errors.currency.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end justify-end gap-2">
              <Button
                type="submit"
                disabled={isSaving}
                className={cn(
                  "squircle h-14 w-full border-0 font-semibold shadow-xl active:scale-95",
                  isSaveSuccess
                    ? "bg-secondary-container text-on-secondary-container shadow-secondary/20 hover:opacity-90"
                    : "deep-indigo-gradient text-on-primary shadow-primary/20 hover:brightness-110",
                )}
              >
                {isSaving ? "Saving…" : isSaveSuccess ? "Confirmed" : "Apply Changes"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </QueryState>
  );
}
