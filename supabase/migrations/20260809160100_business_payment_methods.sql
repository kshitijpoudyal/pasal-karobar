-- Per-business payment method catalog (order, labels, enable/disable, custom types).

CREATE TABLE public.business_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business (id) ON DELETE CASCADE,
  method_code public.payment_method NOT NULL,
  label TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT business_payment_methods_label_len CHECK (
    char_length(trim(label)) >= 1 AND char_length(label) <= 80
  )
);

CREATE UNIQUE INDEX business_payment_methods_preset_unique
  ON public.business_payment_methods (business_id, method_code)
  WHERE method_code <> 'OTHER'::public.payment_method;

CREATE UNIQUE INDEX business_payment_methods_other_label_unique
  ON public.business_payment_methods (business_id, lower(trim(label)))
  WHERE method_code = 'OTHER'::public.payment_method;

CREATE INDEX idx_business_payment_methods_business_id
  ON public.business_payment_methods (business_id);

CREATE INDEX idx_business_payment_methods_display_order
  ON public.business_payment_methods (display_order);

CREATE TRIGGER business_payment_methods_set_updated_at
BEFORE UPDATE ON public.business_payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.business_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_payment_methods_all ON public.business_payment_methods
FOR ALL
TO authenticated
USING (public.is_business_member(business_id))
WITH CHECK (public.is_business_member(business_id));

CREATE OR REPLACE FUNCTION public.seed_default_business_payment_methods(p_business_id UUID)
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
    SELECT 1
    FROM public.business_payment_methods bpm
    WHERE bpm.business_id = p_business_id
  ) THEN
    INSERT INTO public.business_payment_methods (
      business_id,
      method_code,
      label,
      display_order,
      is_active
    )
    VALUES
      (p_business_id, 'CASH', 'Cash', 1, TRUE),
      (p_business_id, 'ESEWA', 'eSewa', 2, TRUE),
      (p_business_id, 'KHALTI', 'Khalti', 3, TRUE),
      (p_business_id, 'BANK_TRANSFER', 'eBank', 4, TRUE),
      (p_business_id, 'FONEPAY', 'fonPay', 5, TRUE);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_default_business_payment_methods(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_default_business_payment_methods(UUID) TO authenticated;

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

  PERFORM public.seed_default_business_payment_methods(p_business_id);

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

INSERT INTO public.business_payment_methods (
  business_id,
  method_code,
  label,
  display_order,
  is_active
)
SELECT
  b.id,
  v.method_code,
  v.label,
  v.display_order,
  TRUE
FROM public.business b
CROSS JOIN (
  VALUES
    ('CASH'::public.payment_method, 'Cash', 1),
    ('ESEWA'::public.payment_method, 'eSewa', 2),
    ('KHALTI'::public.payment_method, 'Khalti', 3),
    ('BANK_TRANSFER'::public.payment_method, 'eBank', 4),
    ('FONEPAY'::public.payment_method, 'fonPay', 5)
) AS v(method_code, label, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.business_payment_methods existing
  WHERE existing.business_id = b.id
);

NOTIFY pgrst, 'reload schema';
