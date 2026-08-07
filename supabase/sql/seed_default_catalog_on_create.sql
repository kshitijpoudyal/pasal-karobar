-- Default services + expense categories for every new business (onboarding).
-- SQL Editor copy of: supabase/migrations/20260807153000_seed_default_catalog_on_create.sql

CREATE OR REPLACE FUNCTION public.seed_default_business_catalog(p_business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF NOT public.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Not a member of this business' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.services s WHERE s.business_id = p_business_id
  ) THEN
    INSERT INTO public.services (
      business_id,
      name,
      default_price,
      icon,
      display_order,
      is_active
    )
    VALUES
      (p_business_id, 'Haircut', 500, 'hair', 1, TRUE),
      (p_business_id, 'Beard Trim', 350, 'beard', 2, TRUE),
      (p_business_id, 'Haircut + Beard', 700, 'combo', 3, TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.expense_categories ec
    WHERE ec.business_id = p_business_id
  ) THEN
    INSERT INTO public.expense_categories (
      business_id,
      name,
      display_order,
      is_active
    )
    VALUES
      (p_business_id, 'Rent', 1, TRUE),
      (p_business_id, 'Electricity', 2, TRUE),
      (p_business_id, 'Supplies', 3, TRUE);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_default_business_catalog(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_default_business_catalog(UUID) TO authenticated;

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

  PERFORM public.seed_default_business_catalog(v_business.id);

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
