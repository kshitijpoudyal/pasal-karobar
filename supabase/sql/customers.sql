-- Customers (phone profiles) + link on income transactions.
-- SQL Editor copy of: supabase/migrations/20260808120000_customers.sql

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  name TEXT,
  first_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_business_phone_unique UNIQUE (business_id, phone_normalized)
);

CREATE INDEX idx_customers_business_id ON public.customers (business_id);
CREATE INDEX idx_customers_phone_normalized ON public.customers (business_id, phone_normalized);

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_customer_id ON public.transactions (customer_id);

CREATE TRIGGER customers_set_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_all ON public.customers
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

NOTIFY pgrst, 'reload schema';
