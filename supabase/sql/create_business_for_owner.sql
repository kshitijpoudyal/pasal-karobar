-- Copy of migration RPC (run after 20260807150000_business_profile_to_settings.sql)

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

GRANT EXECUTE ON FUNCTION public.create_business_for_owner(
  TEXT,
  public.business_type,
  TEXT,
  TEXT
) TO authenticated;

NOTIFY pgrst, 'reload schema';
