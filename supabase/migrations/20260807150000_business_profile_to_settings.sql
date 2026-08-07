-- Move business_type, currency, timezone from public.business → business_settings.
--
-- Run in Supabase SQL Editor (or: supabase db push) AFTER:
--   20260330183000_initial_schema.sql
--   20260730194500_create_business_for_owner.sql
--
-- Safe to re-run: skips data copy if profile columns are already dropped.

DO $migrate$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'business'
      AND column_name = 'business_type'
  ) THEN
    INSERT INTO public.business_settings (business_id, setting_key, setting_value)
    SELECT id, 'business_type', business_type::text
    FROM public.business
    ON CONFLICT (business_id, setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;

    INSERT INTO public.business_settings (business_id, setting_key, setting_value)
    SELECT id, 'currency', currency
    FROM public.business
    ON CONFLICT (business_id, setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;

    INSERT INTO public.business_settings (business_id, setting_key, setting_value)
    SELECT id, 'timezone', timezone
    FROM public.business
    ON CONFLICT (business_id, setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;

    ALTER TABLE public.business
      DROP COLUMN business_type,
      DROP COLUMN currency,
      DROP COLUMN timezone;
  END IF;
END
$migrate$;

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

  INSERT INTO public.business (name)
  VALUES (p_name)
  RETURNING * INTO v_business;

  INSERT INTO public.business_settings (business_id, setting_key, setting_value)
  VALUES
    (v_business.id, 'business_type', p_business_type::text),
    (v_business.id, 'currency', p_currency),
    (v_business.id, 'timezone', p_timezone)
  ON CONFLICT (business_id, setting_key) DO UPDATE
  SET setting_value = EXCLUDED.setting_value;

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
