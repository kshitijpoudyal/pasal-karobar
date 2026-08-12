"use client";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAmountVisibility } from "@/providers/amount-visibility-provider";

type AmountVisibilityToggleProps = {
  className?: string;
  /** For primary-colored stat cards. */
  variant?: "default" | "onPrimary";
};

export function AmountVisibilityToggle({
  className,
  variant = "default",
}: AmountVisibilityToggleProps) {
  const { amountsHidden, toggleAmountsHidden } = useAmountVisibility();
  const Icon = amountsHidden ? EyeOff : Eye;
  const label = amountsHidden ? "Show amounts" : "Hide amounts";

  return (
    <button
      type="button"
      onClick={toggleAmountsHidden}
      aria-label={label}
      aria-pressed={amountsHidden}
      title={label}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95",
        variant === "onPrimary"
          ? "text-on-primary-container hover:bg-on-primary/10"
          : "text-on-surface-variant hover:bg-surface-container-high",
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2} aria-hidden />
    </button>
  );
}
