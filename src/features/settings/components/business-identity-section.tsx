"use client";

import { useState } from "react";
import { Store, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClassName =
  "squircle h-14 w-full border-none bg-surface-container-high px-6 font-medium text-on-surface transition-all outline-none focus:ring-2 focus:ring-primary";

const labelClassName =
  "px-1 text-xs font-semibold tracking-widest text-on-surface-variant uppercase";

export function BusinessIdentitySection() {
  const [saveState, setSaveState] = useState<"idle" | "confirmed">("idle");

  function handleApply() {
    setSaveState("confirmed");
    window.setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="squircle bg-surface-container-low p-8 lg:col-span-2">
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
              defaultValue="Royal Cuts Barber Shop"
              className={fieldClassName}
            />
          </div>
          <div className="space-y-3">
            <label className={labelClassName} htmlFor="business-type">
              Business Type
            </label>
            <select id="business-type" defaultValue="unisex" className={fieldClassName}>
              <option value="unisex">Unisex Grooming</option>
              <option value="mens">Men&apos;s Only</option>
              <option value="spa">Styling &amp; Spa</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className={labelClassName} htmlFor="currency">
              Currency
            </label>
            <select id="currency" defaultValue="npr" className={fieldClassName}>
              <option value="npr">NPR (Nepalese Rupee)</option>
              <option value="usd">USD (United States Dollar)</option>
              <option value="inr">INR (Indian Rupee)</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleApply}
              className={cn(
                "squircle h-14 w-full border-0 font-semibold shadow-xl active:scale-95",
                saveState === "confirmed"
                  ? "bg-secondary text-on-secondary shadow-secondary/20 hover:opacity-90"
                  : "deep-indigo-gradient text-white shadow-primary/20 hover:brightness-110",
              )}
            >
              {saveState === "confirmed" ? "Confirmed" : "Apply Changes"}
            </Button>
          </div>
        </div>
      </div>
      <div className="squircle relative flex flex-col justify-between overflow-hidden bg-primary p-8 shadow-xl shadow-primary/20">
        <div className="relative z-10 text-on-primary">
          <p className="mb-2 text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">
            Portfolio Volume
          </p>
          <h4 className="font-headline text-5xl font-semibold">12</h4>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold tracking-widest uppercase opacity-80">
            <span>Top Service</span>
            <span>Haircut</span>
          </div>
          <div className="squircle h-1.5 w-full overflow-hidden bg-white/10">
            <div className="h-full w-4/5 bg-white/60" />
          </div>
        </div>
        <Wallet
          className="absolute -right-6 -bottom-6 size-[180px] opacity-5"
          strokeWidth={1}
        />
      </div>
    </section>
  );
}
