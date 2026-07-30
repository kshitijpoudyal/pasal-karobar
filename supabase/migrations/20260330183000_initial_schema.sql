-- Pasal Karobar MVP schema (see docs/database.md)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.transaction_type AS ENUM ('INCOME', 'EXPENSE');

CREATE TYPE public.payment_method AS ENUM (
  'CASH',
  'ESEWA',
  'KHALTI',
  'FONEPAY',
  'BANK_TRANSFER'
);

CREATE TYPE public.business_type AS ENUM (
  'BARBER',
  'SALON',
  'GROCERY',
  'PHARMACY',
  'RESTAURANT',
  'OTHER'
);

-- ---------------------------------------------------------------------------
-- Utilities
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Core tables (docs/database.md)
-- ---------------------------------------------------------------------------

CREATE TABLE public.business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type public.business_type NOT NULL DEFAULT 'BARBER',
  currency TEXT NOT NULL DEFAULT 'NPR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kathmandu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  icon TEXT,
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  service_id UUID REFERENCES public.services (id) ON DELETE SET NULL,
  expense_category_id UUID REFERENCES public.expense_categories (id) ON DELETE SET NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  tip NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  payment_method public.payment_method NOT NULL,
  note TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transactions_income_fields CHECK (
    (
      type = 'INCOME'
      AND service_id IS NOT NULL
      AND expense_category_id IS NULL
    )
    OR (
      type = 'EXPENSE'
      AND expense_category_id IS NOT NULL
      AND service_id IS NULL
    )
  )
);

CREATE TABLE public.business_settings (
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  PRIMARY KEY (business_id, setting_key)
);

-- ---------------------------------------------------------------------------
-- Tenancy (required for business-level RLS; see docs/database.md)
-- ---------------------------------------------------------------------------

CREATE TABLE public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, user_id)
);

CREATE OR REPLACE FUNCTION public.is_business_member(p_business_id UUID)
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
  );
$$;

-- ---------------------------------------------------------------------------
-- Indexes (docs/database.md)
-- ---------------------------------------------------------------------------

CREATE INDEX idx_transactions_business_id ON public.transactions (business_id);
CREATE INDEX idx_transactions_transaction_date ON public.transactions (transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions (type);
CREATE INDEX idx_transactions_payment_method ON public.transactions (payment_method);

CREATE INDEX idx_services_business_id ON public.services (business_id);
CREATE INDEX idx_services_display_order ON public.services (display_order);

CREATE INDEX idx_expense_categories_business_id ON public.expense_categories (business_id);
CREATE INDEX idx_expense_categories_display_order ON public.expense_categories (display_order);

CREATE INDEX idx_business_members_user_id ON public.business_members (user_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER business_set_updated_at
BEFORE UPDATE ON public.business
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER services_set_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER expense_categories_set_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER transactions_set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_select ON public.business
FOR SELECT
TO authenticated
USING (public.is_business_member(id));

CREATE POLICY business_insert ON public.business
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

CREATE POLICY business_update ON public.business
FOR UPDATE
TO authenticated
USING (public.is_business_member(id))
WITH CHECK (public.is_business_member(id));

CREATE POLICY business_delete ON public.business
FOR DELETE
TO authenticated
USING (public.is_business_member(id));

CREATE POLICY business_members_select ON public.business_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY business_members_insert ON public.business_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY services_all ON public.services
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

CREATE POLICY expense_categories_all ON public.expense_categories
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

CREATE POLICY transactions_all ON public.transactions
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

CREATE POLICY business_settings_all ON public.business_settings
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

-- Link creator to new business (onboarding helper)
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_members (business_id, user_id)
    VALUES (NEW.id, auth.uid())
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_business_created
AFTER INSERT ON public.business
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_business();
