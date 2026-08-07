-- =============================================================================
-- Business profile → business_settings (manual Supabase SQL Editor copy)
-- =============================================================================
-- Same as: supabase/migrations/20260807150000_business_profile_to_settings.sql
--
-- Prerequisites: initial schema + create_business_for_owner migrations applied.
--
-- Steps:
-- 1. Supabase Dashboard → SQL → New query
-- 2. Paste this entire file → Run
-- 3. Wait ~10s, hard-refresh the app (PostgREST schema reload at end)
--
-- Verify:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'business';
--   (should NOT list business_type, currency, timezone)
--
--   SELECT business_id, setting_key, setting_value
--   FROM public.business_settings
--   WHERE setting_key IN ('business_type', 'currency', 'timezone');
-- =============================================================================

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
