"use client";

import { useEffect, useId, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import { CustomerProfilePhotos } from "@/features/customers/components/customer-profile-photos";
import { useUpdateCustomerMutation } from "@/hooks/queries/use-customer-queries";
import { useConnectivity } from "@/providers/connectivity-provider";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/database";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

const SQUIRCLE_FIELD_INPUT =
  "font-body w-full border-none bg-transparent p-0 text-lg font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0";

type EditCustomerProfileModalProps = {
  open: boolean;
  businessId: string;
  customer: Customer;
  onClose: () => void;
  onSaved?: () => void;
};

export function EditCustomerProfileModal({
  open,
  businessId,
  customer,
  onClose,
  onSaved,
}: EditCustomerProfileModalProps) {
  const titleId = useId();
  const nameInputId = useId();
  const noteInputId = useId();
  const [name, setName] = useState(customer.name ?? "");
  const [note, setNote] = useState(customer.profile_note ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const updateMutation = useUpdateCustomerMutation(businessId);
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (!open) return;
    setName(customer.name ?? "");
    setNote(customer.profile_note ?? "");
    setFormError(null);
  }, [open, customer.id, customer.name, customer.profile_note]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const displayPhone = formatNepalPhoneDisplay(customer.phone_normalized);
  const nameTrim = name.trim();
  const noteTrim = note.trim();
  const initialName = customer.name?.trim() ?? "";
  const initialNote = customer.profile_note?.trim() ?? "";
  const hasChanges = nameTrim !== initialName || noteTrim !== initialNote;

  async function handleSubmit() {
    if (!isOnline) {
      setFormError("You're offline. Connect to the internet to save changes.");
      return;
    }
    if (!hasChanges) {
      onClose();
      return;
    }

    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        customerId: customer.id,
        input: {
          name: nameTrim || null,
          profile_note: noteTrim || null,
        },
      });
      onSaved?.();
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save profile.",
      );
    }
  }

  const canSubmit = !updateMutation.isPending && (!hasChanges || isOnline);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm lg:items-center lg:bg-black/30 lg:p-8 lg:frosted-vellum"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "flex w-full max-w-2xl flex-col overflow-hidden bg-surface-bright shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)]",
          "max-h-[92dvh] animate-[slideUpSheet_0.3s_ease-out] rounded-t-[32px] pb-[env(safe-area-inset-bottom)]",
          "lg:max-h-[90vh] lg:squircle lg:animate-none lg:rounded-[24px] lg:pb-0",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1.5 w-12 rounded-full bg-outline-variant/50" aria-hidden />
        </div>

        <div className="shrink-0 px-6 pt-2 pb-4 lg:px-8 lg:pt-8 lg:pb-6">
          <header className="flex items-center justify-between">
            <h2
              id={titleId}
              className="font-headline text-2xl leading-relaxed font-medium tracking-tight text-on-surface lg:text-3xl"
            >
              Edit profile
            </h2>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm transition-colors hover:bg-surface-container active:scale-95"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5 text-on-surface-variant" strokeWidth={1.75} />
            </button>
          </header>
        </div>

        <div className="hide-scrollbar flex-1 space-y-10 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
          <div className="squircle space-y-3 bg-surface-container-lowest p-5 shadow-sm">
            <p className={FIELD_LABEL}>Phone number</p>
            <p className="font-body text-lg font-medium text-on-surface">{displayPhone}</p>
          </div>

          <div className="squircle space-y-3 bg-surface-container-lowest p-5 shadow-sm">
            <label className={FIELD_LABEL} htmlFor={nameInputId}>
              Name (optional)
            </label>
            <input
              id={nameInputId}
              type="text"
              autoComplete="name"
              placeholder="Customer name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={SQUIRCLE_FIELD_INPUT}
            />
          </div>

          <div className="squircle space-y-3 bg-surface-container-lowest p-5 shadow-sm">
            <label className={FIELD_LABEL} htmlFor={noteInputId}>
              Notes (optional)
            </label>
            <textarea
              id={noteInputId}
              rows={3}
              placeholder="Preferences, allergies, special requests…"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={cn(SQUIRCLE_FIELD_INPUT, "resize-none")}
            />
          </div>

          <CustomerProfilePhotos
            businessId={businessId}
            customerId={customer.id}
            isOnline={isOnline}
          />
        </div>

        <footer className="shrink-0 bg-surface-bright px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8 lg:pt-6 lg:pb-8">
          {formError || updateMutation.isError ? (
            <p className="mb-3 text-center text-sm text-error" role="alert">
              {formError ?? updateMutation.error?.message}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
            className="font-headline deep-indigo-gradient squircle flex h-16 w-full items-center justify-center gap-3 text-xl font-medium tracking-wide text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-6 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <Check className="size-6" strokeWidth={2} aria-hidden />
                {hasChanges ? "Save changes" : "Done"}
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
