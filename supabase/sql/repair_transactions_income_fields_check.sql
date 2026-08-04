-- Run in Supabase SQL Editor if service/category hard-delete still errors.
-- Catalog remove in the app uses is_active = false (no transaction updates).

BEGIN;

UPDATE public.transactions
SET expense_category_id = NULL
WHERE type = 'INCOME'
  AND expense_category_id IS NOT NULL;

UPDATE public.transactions
SET service_id = NULL
WHERE type = 'EXPENSE'
  AND service_id IS NOT NULL;

ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_income_fields;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_income_fields CHECK (
  (
    type = 'INCOME'
    AND expense_category_id IS NULL
  )
  OR (
    type = 'EXPENSE'
    AND service_id IS NULL
  )
);

COMMIT;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.transactions'::regclass
  AND contype = 'c';
