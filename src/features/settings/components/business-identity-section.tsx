"use client";

import { Store, Wallet } from "lucide-react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { useBusinessIdentityForm } from "@/features/settings/hooks/use-business-identity-form";
import { cn } from "@/lib/utils";
import { formatNpr } from "@/utils/format";

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
    summary,
    refetch,
  } = useBusinessIdentityForm();

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          className="squircle bg-surface-container-low p-8 lg:col-span-2"
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
                    ? "bg-secondary text-on-secondary shadow-secondary/20 hover:opacity-90"
                    : "deep-indigo-gradient text-white shadow-primary/20 hover:brightness-110",
                )}
              >
                {isSaving ? "Saving…" : isSaveSuccess ? "Confirmed" : "Apply Changes"}
              </Button>
            </div>
          </div>
        </form>
        <div className="squircle relative flex flex-col justify-between overflow-hidden bg-primary p-8 shadow-xl shadow-primary/20">
          <div className="relative z-10 text-on-primary">
            <p className="mb-2 text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">
              Portfolio Volume
            </p>
            <h4 className="font-headline text-5xl font-semibold">
              {summary?.patronCount ?? 0}
            </h4>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold tracking-widest uppercase opacity-80">
              <span>Top Service</span>
              <span>{summary?.topServiceName ?? "—"}</span>
            </div>
            <div className="squircle h-1.5 w-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-white/60 transition-all"
                style={{
                  width:
                    summary && summary.revenue > 0 && summary.serviceRevenue[0]
                      ? `${Math.min(100, (summary.serviceRevenue[0].total / summary.revenue) * 100)}%`
                      : "0%",
                }}
              />
            </div>
            {summary ? (
              <p className="text-xs opacity-70">
                Revenue {formatNpr(summary.revenue, form.getValues("currency"))}
              </p>
            ) : null}
          </div>
          <Wallet
            className="absolute -right-6 -bottom-6 size-[180px] opacity-5"
            strokeWidth={1}
          />
        </div>
      </section>
    </QueryState>
  );
}
