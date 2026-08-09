"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { runConfirmedAction, useConfirmDrawer } from "@/components/confirm-drawer";
import { MAX_CUSTOMER_PHOTOS } from "@/constants/customer-photos";
import {
  useCustomerPhotosQuery,
  useDeleteCustomerPhotoMutation,
  useUpdateCustomerPhotoCaptionMutation,
  useUploadCustomerPhotoMutation,
} from "@/hooks/queries/use-customer-photo-queries";
import {
  CustomerPhotoLimitError,
  CustomerPhotoValidationError,
} from "@/services/customer-photo.service";
import { cn } from "@/lib/utils";
import {
  fileToArrayBuffer,
  resizeImageFileForUpload,
} from "@/utils/image-resize";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

type CustomerProfilePhotosProps = {
  businessId: string;
  customerId: string;
  isOnline: boolean;
};

export function CustomerProfilePhotos({
  businessId,
  customerId,
  isOnline,
}: CustomerProfilePhotosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirmDrawer();
  const photosQuery = useCustomerPhotosQuery(customerId);
  const uploadMutation = useUploadCustomerPhotoMutation(businessId);
  const captionMutation = useUpdateCustomerPhotoCaptionMutation(
    businessId,
    customerId,
  );
  const deleteMutation = useDeleteCustomerPhotoMutation(businessId, customerId);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>(
    {},
  );

  const photos = photosQuery.data ?? [];
  const canAddMore = isOnline && photos.length < MAX_CUSTOMER_PHOTOS;
  const busy =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    captionMutation.isPending;

  function captionForPhoto(photoId: string, serverCaption: string | null) {
    if (photoId in captionDrafts) return captionDrafts[photoId]!;
    return serverCaption ?? "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isOnline) return;

    setUploadError(null);
    try {
      const resized = await resizeImageFileForUpload(file);
      const data = await fileToArrayBuffer(resized.blob);
      await uploadMutation.mutateAsync({
        business_id: businessId,
        customer_id: customerId,
        content_type: resized.contentType,
        byte_length: resized.byteLength,
        data,
      });
    } catch (error) {
      if (error instanceof CustomerPhotoLimitError) {
        setUploadError(error.message);
        return;
      }
      if (error instanceof CustomerPhotoValidationError) {
        setUploadError(error.message);
        return;
      }
      setUploadError(
        error instanceof Error ? error.message : "Could not upload photo.",
      );
    }
  }

  async function saveCaption(photoId: string, raw: string) {
    const caption = raw.trim() || null;
    await captionMutation.mutateAsync({
      photoId,
      input: { caption },
    });
    setCaptionDrafts((prev) => {
      const next = { ...prev };
      delete next[photoId];
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className={FIELD_LABEL}>Hairstyle photos (optional)</p>
        <span className="text-[11px] text-on-surface-variant">
          {photos.length}/{MAX_CUSTOMER_PHOTOS}
        </span>
      </div>
      {!isOnline ? (
        <p className="mt-2 text-xs text-on-surface-variant">
          Connect to the internet to add or remove photos.
        </p>
      ) : null}
      {uploadError ? (
        <p className="mt-2 text-sm text-error" role="alert">
          {uploadError}
        </p>
      ) : null}

      {photosQuery.isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading photos…
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="squircle overflow-hidden border border-outline-variant/60 bg-surface-container-lowest shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.signed_url}
                alt={photo.caption ?? "Customer hairstyle reference"}
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-2 p-2">
                <input
                  type="text"
                  placeholder="Label (optional)"
                  value={captionForPhoto(photo.id, photo.caption)}
                  disabled={!isOnline || busy}
                  onChange={(event) =>
                    setCaptionDrafts((prev) => ({
                      ...prev,
                      [photo.id]: event.target.value,
                    }))
                  }
                  onBlur={() => {
                    const draft = captionForPhoto(photo.id, photo.caption);
                    const normalized = draft.trim() || null;
                    if (normalized === (photo.caption?.trim() || null)) return;
                    void saveCaption(photo.id, draft);
                  }}
                  className="font-body w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={!isOnline || busy}
                  onClick={() => {
                    void runConfirmedAction(
                      confirm,
                      {
                        title: "Remove photo?",
                        description:
                          "This reference image will be deleted from the customer profile.",
                        confirmLabel: "Remove",
                        cancelLabel: "Keep",
                        tone: "destructive",
                      },
                      () => deleteMutation.mutateAsync(photo.id),
                    );
                  }}
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
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "squircle flex aspect-square w-full flex-col items-center justify-center gap-2",
                  "border-2 border-dashed border-outline-variant bg-surface-container-high",
                  "text-on-surface-variant transition-colors hover:border-primary hover:bg-primary-container/20",
                  busy && "opacity-60",
                )}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                ) : (
                  <ImagePlus className="size-6" strokeWidth={1.75} aria-hidden />
                )}
                <span className="text-xs font-medium">Add photo</span>
              </button>
            </li>
          ) : null}
        </ul>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}
