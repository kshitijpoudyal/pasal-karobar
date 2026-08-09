"use client";

import { useEffect, useState } from "react";

import { CustomerProfilePhotos } from "@/features/customers/components/customer-profile-photos";
import { useUpdateCustomerMutation } from "@/hooks/queries/use-customer-queries";
import { useConnectivity } from "@/providers/connectivity-provider";
import type { Customer } from "@/types/database";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

type CustomerProfileEditorProps = {
  businessId: string;
  customer: Customer;
  onDone?: () => void;
};

export function CustomerProfileEditor({
  businessId,
  customer,
  onDone,
}: CustomerProfileEditorProps) {
  const [nameDraft, setNameDraft] = useState(customer.name ?? "");
  const [noteDraft, setNoteDraft] = useState(customer.profile_note ?? "");
  const [noteError, setNoteError] = useState<string | null>(null);
  const updateMutation = useUpdateCustomerMutation(businessId);
  const { isOnline } = useConnectivity();

  useEffect(() => {
    setNameDraft(customer.name ?? "");
    setNoteDraft(customer.profile_note ?? "");
    setNoteError(null);
  }, [customer.id, customer.name, customer.profile_note]);

  async function saveName() {
    await updateMutation.mutateAsync({
      customerId: customer.id,
      input: { name: nameDraft.trim() || null },
    });
  }

  async function saveNote() {
    if (!isOnline) {
      setNoteError("You're offline. Connect to save notes.");
      return;
    }
    setNoteError(null);
    await updateMutation.mutateAsync({
      customerId: customer.id,
      input: { profile_note: noteDraft.trim() || null },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="customer-edit-name"
          className={FIELD_LABEL}
        >
          Name (optional)
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="customer-edit-name"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            className="font-body min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2.5 text-base"
          />
          <button
            type="button"
            onClick={() => void saveName()}
            disabled={updateMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="customer-edit-note" className={FIELD_LABEL}>
          Note (optional)
        </label>
        <div className="squircle mt-3 space-y-3 bg-surface-container-lowest p-4 shadow-sm">
          <textarea
            id="customer-edit-note"
            rows={4}
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Hairstyle preferences, products used…"
            className="font-body w-full resize-none border-none bg-transparent p-0 text-sm text-on-surface outline-none placeholder:text-outline-variant focus:ring-0"
          />
          {noteError ? (
            <p className="text-xs text-error" role="alert">
              {noteError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void saveNote()}
            disabled={updateMutation.isPending || !isOnline}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            Save note
          </button>
        </div>
      </div>

      <CustomerProfilePhotos
        businessId={businessId}
        customerId={customer.id}
        isOnline={isOnline}
      />

      {onDone ? (
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-3 text-sm font-medium text-on-surface"
        >
          Done editing
        </button>
      ) : null}
    </div>
  );
}
