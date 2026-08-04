-- Allow historical income/expense rows after catalog rows are deleted (FK ON DELETE SET NULL).

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

COMMENT ON CONSTRAINT transactions_income_fields ON public.transactions IS
  'INCOME must not use expense categories; EXPENSE must not use services. service_id / expense_category_id may be NULL when a catalog item was deleted.';
