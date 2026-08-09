-- Customer profile note + hairstyle photos (metadata in Postgres, files in Storage).

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS profile_note TEXT;

CREATE TABLE public.customer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customer_photos_storage_path_unique UNIQUE (storage_path),
  CONSTRAINT customer_photos_sort_order_check CHECK (sort_order >= 0 AND sort_order <= 4)
);

CREATE INDEX idx_customer_photos_customer_id ON public.customer_photos (customer_id);
CREATE INDEX idx_customer_photos_business_id ON public.customer_photos (business_id);
CREATE INDEX idx_customer_photos_customer_sort ON public.customer_photos (customer_id, sort_order);

CREATE TRIGGER customer_photos_set_updated_at
BEFORE UPDATE ON public.customer_photos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.customer_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_photos_all ON public.customer_photos
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-photos',
  'customer-photos',
  false,
  4194304,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY customer_photos_storage_select ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-photos'
  AND public.is_business_member(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY customer_photos_storage_insert ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-photos'
  AND public.is_business_member(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY customer_photos_storage_update ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'customer-photos'
  AND public.is_business_member(((storage.foldername(name))[1])::uuid)
)
WITH CHECK (
  bucket_id = 'customer-photos'
  AND public.is_business_member(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY customer_photos_storage_delete ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'customer-photos'
  AND public.is_business_member(((storage.foldername(name))[1])::uuid)
);

NOTIFY pgrst, 'reload schema';
