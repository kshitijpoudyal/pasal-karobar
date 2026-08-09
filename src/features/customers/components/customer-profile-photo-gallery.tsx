"use client";

import { Loader2 } from "lucide-react";

import { useCustomerPhotosQuery } from "@/hooks/queries/use-customer-photo-queries";

type CustomerProfilePhotoGalleryProps = {
  customerId: string;
};

export function CustomerProfilePhotoGallery({
  customerId,
}: CustomerProfilePhotoGalleryProps) {
  const photosQuery = useCustomerPhotosQuery(customerId);
  const photos = photosQuery.data ?? [];

  if (photosQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading photos…
      </div>
    );
  }

  if (photos.length === 0) return null;

  return (
    <div>
      <p className="font-body text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase">
        Reference photos
      </p>
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
            {photo.caption ? (
              <p className="px-2 py-2 text-xs text-on-surface-variant">
                {photo.caption}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
