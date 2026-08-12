"use client";

import { Store } from "lucide-react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import {
  CALENDAR_SYSTEMS,
  calendarSystemLabel,
} from "@/constants/calendar-system";
import {
  DEFAULT_BUSINESS_TIMEZONE,
  timezoneOptionsIncludingCurrent,
} from "@/constants/business-timezones";
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
    watch,
    formState: { errors },
  } = form;

  const timezoneValue = watch("timezone") || DEFAULT_BUSINESS_TIMEZONE;
  const timezoneOptions = timezoneOptionsIncludingCurrent(timezoneValue);

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section>
        <form
          className="squircle bg-surface-container-low p-5 lg:p-8"
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
            <div className="space-y-3">
              <label className={labelClassName} htmlFor="calendar-system">
                Calendar
              </label>
              <select
                id="calendar-system"
                className={fieldClassName}
                {...register("calendar_system")}
              >
                {CALENDAR_SYSTEMS.map((system) => (
                  <option key={system} value={system}>
                    {calendarSystemLabel(system)}
                  </option>
                ))}
              </select>
              <p className="px-1 text-xs text-on-surface-variant">
                Controls how dates and report periods are shown. Transaction
                times stay in UTC.
              </p>
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className={labelClassName} htmlFor="timezone">
                Timezone
              </label>
              <select
                id="timezone"
                className={fieldClassName}
                {...register("timezone")}
              >
                {timezoneOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="px-1 text-xs text-on-surface-variant">
                Activity and dashboard times use this zone. Stored transactions
                stay in UTC.
              </p>
              {errors.timezone ? (
                <p className="text-xs text-error">{errors.timezone.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end justify-end gap-2 md:col-span-2 lg:col-span-1 lg:col-start-2">
              <Button
                type="submit"
                variant={isSaveSuccess ? "secondary" : "primary"}
                size="prominent"
                disabled={isSaving}
                className={cn(
                  "w-full shadow-xl",
                  isSaveSuccess &&
                    "border-0 bg-secondary-container text-on-secondary-container shadow-secondary/20 hover:bg-secondary-container hover:opacity-90",
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
