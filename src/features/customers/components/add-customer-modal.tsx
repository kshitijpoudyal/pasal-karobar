"use client";

import { useEffect, useId, useState } from "react";
import { CirclePlus, Loader2, X } from "lucide-react";

import {
  CustomerPhotoDraftPicker,
  revokePendingPhotoUrls,
  type PendingCustomerPhoto,
} from "@/features/customers/components/customer-photo-draft-picker";
import { CustomerPhoneAutocomplete } from "@/features/transactions/components/customer-phone-autocomplete";
import { useUploadCustomerPhotoMutation } from "@/hooks/queries/use-customer-photo-queries";
import { useCreateCustomerMutation } from "@/hooks/queries/use-customer-queries";
import { useConnectivity } from "@/providers/connectivity-provider";
import {
  CustomerDuplicateError,
  CustomerPhoneError,
} from "@/services/customer.service";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/database";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

const SQUIRCLE_FIELD_INPUT =
  "font-body w-full border-none bg-transparent p-0 text-lg font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0";

type AddCustomerModalProps = {
  open: boolean;
  businessId: string;
  onClose: () => void;
  onCreated?: (customer: Customer) => void;
};

export function AddCustomerModal({
  open,
  businessId,
  onClose,
  onCreated,
}: AddCustomerModalProps) {
  const titleId = useId();
  const nameInputId = useId();
  const noteInputId = useId();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingCustomerPhoto[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const createMutation = useCreateCustomerMutation(businessId);
  const uploadPhotoMutation = useUploadCustomerPhotoMutation(businessId);
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (!open) {
      setPhone("");
      setName("");
      setNote("");
      setFormError(null);
      setPendingPhotos((prev) => {
        revokePendingPhotoUrls(prev);
        return [];
      });
      return;
    }
    setPhone("");
    setName("");
    setNote("");
    setFormError(null);
    setPendingPhotos((prev) => {
      revokePendingPhotoUrls(prev);
      return [];
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit() {
    if (!isOnline) {
      setFormError("You're offline. Connect to the internet to add a customer.");
      return;
    }
    setFormError(null);
    setIsSaving(true);
    try {
      const customer = await createMutation.mutateAsync({
        phone: phone.trim(),
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(note.trim() ? { profile_note: note.trim() } : {}),
      });

      for (const photo of pendingPhotos) {
        await uploadPhotoMutation.mutateAsync({
          business_id: businessId,
          customer_id: customer.id,
          content_type: photo.contentType,
          byte_length: photo.byteLength,
          data: photo.data,
          caption: photo.caption.trim() || null,
        });
      }

      revokePendingPhotoUrls(pendingPhotos);
      setPendingPhotos([]);
      setPhone("");
      setName("");
      setNote("");
      onCreated?.(customer);
      onClose();
    } catch (error) {
      if (error instanceof CustomerPhoneError || error instanceof CustomerDuplicateError) {
        setFormError(error.message);
        return;
      }
      setFormError(
        error instanceof Error ? error.message : "Could not save customer.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const canSubmit =
    phone.trim().length > 0 && !isSaving && !createMutation.isPending && isOnline;

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
          <div
            className="h-1.5 w-12 rounded-full bg-outline-variant/50"
            aria-hidden
          />
        </div>

        <div className="shrink-0 px-6 pt-2 pb-4 lg:px-8 lg:pt-8 lg:pb-6">
          <header className="flex items-center justify-between">
            <h2
              id={titleId}
              className="font-headline text-2xl leading-relaxed font-medium tracking-tight text-on-surface lg:text-3xl"
            >
              Add customer
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
          <CustomerPhoneAutocomplete
            id="add-customer-phone"
            label="Phone number"
            labelClassName={FIELD_LABEL}
            value={phone}
            onChange={setPhone}
            variant="embedded"
          />

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

          <CustomerPhotoDraftPicker
            photos={pendingPhotos}
            onChange={setPendingPhotos}
            disabled={!isOnline || isSaving}
          />
        </div>

        <footer className="shrink-0 bg-surface-bright px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8 lg:pt-6 lg:pb-8">
          {formError ? (
            <p className="mb-3 text-center text-sm text-error" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
            className="font-headline deep-indigo-gradient squircle flex h-16 w-full items-center justify-center gap-3 text-xl font-medium tracking-wide text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
          >
            {isSaving || createMutation.isPending ? (
              <>
                <Loader2 className="size-6 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <CirclePlus className="size-6" strokeWidth={2} aria-hidden />
                Add customer
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
