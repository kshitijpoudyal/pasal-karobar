"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaymentMethodPresetCode } from "@/constants/payment-method-presets";
import { cn } from "@/lib/utils";

const FIELD_LABEL =
  "block text-xs font-semibold tracking-wider text-on-surface-variant uppercase";

const FIELD_INPUT =
  "font-body w-full border-none bg-surface-container-low py-3 text-base text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none rounded-squircle-sm px-4";

type InactivePreset = {
  code: PaymentMethodPresetCode;
  defaultLabel: string;
};

type RegisterPaymentMethodModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  addMode: "preset" | "custom";
  onAddModeChange: (mode: "preset" | "custom") => void;
  inactivePresets: InactivePreset[];
  presetCode: PaymentMethodPresetCode;
  onPresetCodeChange: (code: PaymentMethodPresetCode) => void;
  customLabel: string;
  onCustomLabelChange: (value: string) => void;
  editLabel: string;
  onEditLabelChange: (value: string) => void;
  editEntryPosition?: number;
  onEditEntryPositionChange?: (value: number) => void;
  maxEntryPosition?: number;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function RegisterPaymentMethodModal({
  open,
  onClose,
  mode,
  addMode,
  onAddModeChange,
  inactivePresets,
  presetCode,
  onPresetCodeChange,
  customLabel,
  onCustomLabelChange,
  editLabel,
  onEditLabelChange,
  editEntryPosition = 1,
  onEditEntryPositionChange,
  maxEntryPosition = 1,
  onSubmit,
  isSubmitting,
}: RegisterPaymentMethodModalProps) {
  const titleId = useId();
  const labelFieldId = useId();
  const positionFieldId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const title = mode === "add" ? "Add payment method" : "Edit payment method";
  const submitLabel = mode === "add" ? "Add" : "Save changes";
  const canSubmit =
    mode === "edit"
      ? editLabel.trim().length > 0
      : addMode === "custom"
        ? customLabel.trim().length > 0
        : inactivePresets.length > 0;

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
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </header>

        <form
          className="space-y-6 px-8 py-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit || isSubmitting) return;
            onSubmit();
          }}
        >
          {mode === "edit" ? (
            <>
              <div className="space-y-2">
                <label className={FIELD_LABEL} htmlFor={labelFieldId}>
                  Display name
                </label>
                <input
                  id={labelFieldId}
                  className={FIELD_INPUT}
                  value={editLabel}
                  onChange={(event) => onEditLabelChange(event.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className={FIELD_LABEL} htmlFor={positionFieldId}>
                  Entry form position
                </label>
                <input
                  id={positionFieldId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxEntryPosition}
                  className={FIELD_INPUT}
                  value={editEntryPosition}
                  onChange={(event) =>
                    onEditEntryPositionChange?.(
                      Number.parseInt(event.target.value, 10) || 1,
                    )
                  }
                />
                <p className="text-xs text-on-surface-variant">
                  1 shows first when recording entries (max {maxEntryPosition}).
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={addMode === "preset" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onAddModeChange("preset")}
                >
                  Standard type
                </Button>
                <Button
                  type="button"
                  variant={addMode === "custom" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onAddModeChange("custom")}
                >
                  Custom name
                </Button>
              </div>
              {addMode === "preset" ? (
                inactivePresets.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    All standard payment types are already active.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <label className={FIELD_LABEL} htmlFor={labelFieldId}>
                      Type
                    </label>
                    <select
                      id={labelFieldId}
                      className={cn(FIELD_INPUT, "cursor-pointer")}
                      value={presetCode}
                      onChange={(event) =>
                        onPresetCodeChange(
                          event.target.value as PaymentMethodPresetCode,
                        )
                      }
                    >
                      {inactivePresets.map((preset) => (
                        <option key={preset.code} value={preset.code}>
                          {preset.defaultLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <label className={FIELD_LABEL} htmlFor={labelFieldId}>
                    Name
                  </label>
                  <input
                    id={labelFieldId}
                    className={FIELD_INPUT}
                    placeholder="e.g. Connect IPS"
                    value={customLabel}
                    onChange={(event) => onCustomLabelChange(event.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
