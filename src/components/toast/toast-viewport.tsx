"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  dismissToast,
  subscribeToasts,
  type ToastItem,
} from "@/components/toast/toast-store";
import { cn } from "@/lib/utils";

function ToastCard({ item }: { item: ToastItem }) {
  const isSuccess = item.variant === "success";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 squircle border border-outline-variant/50 px-4 py-3 shadow-lg",
        "animate-[toastIn_0.25s_ease-out]",
        isSuccess
          ? "bg-secondary-container text-on-secondary-container"
          : "bg-error-container text-on-surface",
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <XCircle className="mt-0.5 size-5 shrink-0 text-error" strokeWidth={2} aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm leading-snug">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">{item.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="shrink-0 rounded-md px-1 text-xs font-medium opacity-70 hover:opacity-100"
        onClick={() => dismissToast(item.id)}
      >
        Dismiss
      </button>
    </div>
  );
}

export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-8 lg:items-end lg:px-8"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
