"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { MAX_CUSTOMER_PHOTOS } from "@/constants/customer-photos";
import type { AllowedCustomerPhotoMimeType } from "@/constants/customer-photos";
import { CustomerPhotoAddControls } from "@/features/customers/components/customer-photo-add-controls";
import {
  CustomerPhotoLimitError,
  CustomerPhotoValidationError,
} from "@/services/customer-photo.service";
import { fileToArrayBuffer, resizeImageFileForUpload } from "@/utils/image-resize";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

export type PendingCustomerPhoto = {
  localId: string;
  previewUrl: string;
  contentType: AllowedCustomerPhotoMimeType;
  byteLength: number;
  data: ArrayBuffer;
  caption: string;
};

type CustomerPhotoDraftPickerProps = {
  photos: PendingCustomerPhoto[];
  onChange: (photos: PendingCustomerPhoto[]) => void;
  disabled?: boolean;
};

export function revokePendingPhotoUrls(photos: PendingCustomerPhoto[]): void {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl);
  }
}

export function CustomerPhotoDraftPicker({
  photos,
  onChange,
  disabled = false,
}: CustomerPhotoDraftPickerProps) {
  const [pickError, setPickError] = useState<string | null>(null);
  const canAddMore = photos.length < MAX_CUSTOMER_PHOTOS;

  async function addPhotoFile(file: File) {
    if (disabled) return;

    if (photos.length >= MAX_CUSTOMER_PHOTOS) {
      setPickError(`You can add up to ${MAX_CUSTOMER_PHOTOS} photos per customer.`);
      return;
    }

    setPickError(null);
    try {
      const resized = await resizeImageFileForUpload(file);
      const data = await fileToArrayBuffer(resized.blob);
      const previewUrl = URL.createObjectURL(resized.blob);
      onChange([
        ...photos,
        {
          localId: crypto.randomUUID(),
          previewUrl,
          contentType: resized.contentType,
          byteLength: resized.byteLength,
          data,
          caption: "",
        },
      ]);
    } catch (error) {
      if (
        error instanceof CustomerPhotoLimitError ||
        error instanceof CustomerPhotoValidationError
      ) {
        setPickError(error.message);
        return;
      }
      setPickError(error instanceof Error ? error.message : "Could not add photo.");
    }
  }

  function removePhoto(localId: string) {
    const target = photos.find((p) => p.localId === localId);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.localId !== localId));
  }

  function updateCaption(localId: string, caption: string) {
    onChange(photos.map((p) => (p.localId === localId ? { ...p, caption } : p)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-2">
        <p className={FIELD_LABEL}>Hairstyle photos (optional)</p>
        <span className="font-label-sm text-label-sm text-outline">
          {photos.length}/{MAX_CUSTOMER_PHOTOS}
        </span>
      </div>
      {pickError ? (
        <p className="text-sm text-error" role="alert">
          {pickError}
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((photo) => (
          <li
            key={photo.localId}
            className="overflow-hidden rounded-[24px] border border-outline-variant/60 bg-surface-container-lowest shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt={photo.caption || "Selected hairstyle reference"}
              className="aspect-square w-full object-cover"
            />
            <div className="space-y-2 p-2">
              <input
                type="text"
                placeholder="Label (optional)"
                value={photo.caption}
                disabled={disabled}
                onChange={(event) => updateCaption(photo.localId, event.target.value)}
                className="font-body w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removePhoto(photo.localId)}
                className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-error hover:bg-error-container/30 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                Remove
              </button>
            </div>
          </li>
        ))}
        {canAddMore ? (
          <li>
            <CustomerPhotoAddControls disabled={disabled} onFile={addPhotoFile} />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
