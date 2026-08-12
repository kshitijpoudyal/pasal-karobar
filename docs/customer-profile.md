# Customer profile (note + photos)

Optional fields on each customer at **`/customers/{phone}`** (detail page, not a main nav item):

- **Note** — `customers.profile_note` (max 2000 characters in app validation).
- **Hairstyle photos** — up to **5** images in Storage bucket `customer-photos`, with optional **caption** per photo (max 100 characters).

The directory at `/customers` lists everyone; tapping a row opens the detail URL with the normalized 10-digit phone (e.g. `/customers/9841234567`).

## Requirements

- **Network:** Photo upload, remove, and caption save require an online connection (same as add-customer). Notes and name save also require network in the current UI.
- **Add customer:** You can attach up to 5 photos in the add-customer modal; they upload right after the customer row is created.
- **Migration:** Apply `supabase/migrations/20260809140000_customer_profile_photos.sql` (creates `customer_photos`, `profile_note`, bucket, and storage policies).

## Manual QA

1. Open a customer from the directory; confirm URL includes phone; check total visits, revenue, and visit history.
2. Use **Edit profile** to save a note and photos; **View profile** shows read-only note and gallery.
3. Upload 5 photos with captions; confirm sixth upload shows limit error.
4. Remove one photo; upload another.
5. Go offline (DevTools); confirm add/remove photo is disabled; reconnect and sync works.
6. In Supabase Storage, verify objects under `{business_id}/{customer_id}/`.

## Code map

| Concern              | Location                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Service / validation | `src/services/customer-photo.service.ts`                                                      |
| Hooks                | `src/hooks/queries/use-customer-photo-queries.ts`                                             |
| UI                   | `customer-detail-page-view.tsx`, `customer-profile-editor.tsx`, `customer-profile-photos.tsx` |
| Resize before upload | `src/utils/image-resize.ts`                                                                   |
