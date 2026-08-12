-- Staff profiles, member roles, and transaction attribution.

CREATE TYPE public.member_role AS ENUM ('OWNER', 'STAFF');

ALTER TABLE public.business_members
  ADD COLUMN IF NOT EXISTS role public.member_role NOT NULL DEFAULT 'STAFF';

UPDATE public.business_members
SET role = 'OWNER'
WHERE role = 'STAFF';

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS recorded_by_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_recorded_by
  ON public.transactions (business_id, recorded_by_user_id);

CREATE OR REPLACE FUNCTION public.set_transaction_recorded_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.recorded_by_user_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.recorded_by_user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_set_recorded_by ON public.transactions;

CREATE TRIGGER transactions_set_recorded_by
BEFORE INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_transaction_recorded_by();

CREATE OR REPLACE FUNCTION public.is_business_owner(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members bm
    WHERE bm.business_id = p_business_id
      AND bm.user_id = auth.uid()
      AND bm.role = 'OWNER'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_business_owner(UUID) TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.business_members bm_self
    JOIN public.business_members bm_peer
      ON bm_self.business_id = bm_peer.business_id
    WHERE bm_self.user_id = auth.uid()
      AND bm_peer.user_id = profiles.id
  )
  OR id = auth.uid()
);

CREATE POLICY profiles_insert ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS business_members_select ON public.business_members;

CREATE POLICY business_members_select ON public.business_members
FOR SELECT
TO authenticated
USING (public.is_business_member(business_id));

CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'OWNER')
    ON CONFLICT (business_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_business_for_owner(
  p_name TEXT,
  p_business_type public.business_type DEFAULT 'BARBER',
  p_currency TEXT DEFAULT 'NPR',
  p_timezone TEXT DEFAULT 'Asia/Kathmandu',
  p_display_name TEXT DEFAULT NULL
)
RETURNS public.business
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_business public.business;
  v_display_name TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '42501';
  END IF;

  v_display_name := NULLIF(TRIM(p_display_name), '');
  IF v_display_name IS NULL THEN
    v_display_name := 'Admin';
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

  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business.id, v_uid, 'OWNER')
  ON CONFLICT (business_id, user_id) DO UPDATE
  SET role = 'OWNER';

  INSERT INTO public.profiles (id, display_name, email)
  VALUES (v_uid, v_display_name, NULL)
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name;

  RETURN v_business;
END;
$$;

REVOKE ALL ON FUNCTION public.create_business_for_owner(
  TEXT,
  public.business_type,
  TEXT,
  TEXT,
  TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_business_for_owner(
  TEXT,
  public.business_type,
  TEXT,
  TEXT,
  TEXT
) TO authenticated;

NOTIFY pgrst, 'reload schema';
