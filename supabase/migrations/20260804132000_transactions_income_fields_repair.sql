-- Idempotent repair: relax transactions_income_fields (safe to re-run).
-- Settings "delete service" uses soft delete (is_active = false) and does not rely on this,
-- but hard DELETE on services/expense_categories still SET NULL on transactions.

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

-- Verify (run separately; should NOT contain "service_id IS NOT NULL" for INCOME):
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.transactions'::regclass AND contype = 'c';
