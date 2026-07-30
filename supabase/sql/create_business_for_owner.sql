-- Paste this entire file into Supabase Dashboard → SQL → New query → Run
-- Requires: migrations/20260330183000_initial_schema.sql already applied

DO $precheck$
BEGIN
  IF to_regtype('public.business_type') IS NULL THEN
    RAISE EXCEPTION
      'Missing public.business_type. Run 20260330183000_initial_schema.sql first.';
  END IF;
  IF to_regclass('public.business') IS NULL THEN
    RAISE EXCEPTION
      'Missing public.business. Run 20260330183000_initial_schema.sql first.';
  END IF;
END
$precheck$;

CREATE OR REPLACE FUNCTION public.create_business_for_owner(
  p_name TEXT,
  p_business_type public.business_type DEFAULT 'BARBER',
  p_currency TEXT DEFAULT 'NPR',
  p_timezone TEXT DEFAULT 'Asia/Kathmandu'
)
RETURNS public.business
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_business public.business;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.business (name, business_type, currency, timezone)
  VALUES (p_name, p_business_type, p_currency, p_timezone)
  RETURNING * INTO v_business;

  INSERT INTO public.business_members (business_id, user_id)
  VALUES (v_business.id, v_uid)
  ON CONFLICT (business_id, user_id) DO NOTHING;

  RETURN v_business;
END;
$$;

REVOKE ALL ON FUNCTION public.create_business_for_owner(
  TEXT,
  public.business_type,
  TEXT,
  TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_business_for_owner(
  TEXT,
  public.business_type,
  TEXT,
  TEXT
) TO authenticated;

NOTIFY pgrst, 'reload schema';
