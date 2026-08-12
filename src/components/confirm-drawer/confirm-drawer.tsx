"use client";

import { useEffect, useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDrawerTone = "default" | "destructive";

export type ConfirmDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDrawerTone;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDrawer({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, isConfirming]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-md lg:items-end lg:justify-center lg:p-6"
      role="presentation"
      onClick={isConfirming ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "flex w-full max-w-lg flex-col overflow-hidden border border-outline-variant/60 shadow-2xl",
          "rounded-t-[32px] bg-surface/95 backdrop-blur-xl lg:rounded-squircle lg:bg-surface-container-lowest",
          "animate-[slideUpSheet_0.3s_ease-out]",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center py-3">
          <div className="h-1.5 w-12 rounded-full bg-outline-variant/50" />
        </div>
        <div className="space-y-3 px-6 pt-2 pb-2">
          <h2
            id={titleId}
            className="font-headline text-xl font-semibold text-on-surface lg:text-2xl"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="text-sm leading-relaxed text-on-surface-variant"
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-3 px-6 pt-6 pb-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="cta"
            className="w-full sm:w-auto"
            disabled={isConfirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "primary"}
            size="cta"
            className={cn(
              "w-full sm:w-auto",
              tone === "destructive" && "font-semibold",
            )}
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? "Please wait…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
