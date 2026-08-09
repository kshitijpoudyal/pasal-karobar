export const CUSTOMER_PHOTOS_BUCKET = "customer-photos";
export const MAX_CUSTOMER_PHOTOS = 5;
export const MAX_CUSTOMER_PHOTO_BYTES = 4 * 1024 * 1024;
export const CUSTOMER_PHOTO_SIGNED_URL_TTL_SEC = 3600;

export const ALLOWED_CUSTOMER_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedCustomerPhotoMimeType =
  (typeof ALLOWED_CUSTOMER_PHOTO_MIME_TYPES)[number];

export function extensionForMimeType(mime: AllowedCustomerPhotoMimeType): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

export function buildCustomerPhotoStoragePath(
  businessId: string,
  customerId: string,
  photoId: string,
  mime: AllowedCustomerPhotoMimeType,
): string {
  return `${businessId}/${customerId}/${photoId}.${extensionForMimeType(mime)}`;
}
