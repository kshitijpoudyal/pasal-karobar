-- Merge duplicate INCOME rows logged for the same customer visit when multiple
-- services were recorded as separate transactions (same timestamp + payment).

CREATE TEMP TABLE duplicate_income_clusters ON COMMIT DROP AS
SELECT
  customer_id,
  payment_method,
  transaction_date,
  MIN(id) AS keep_id,
  ARRAY_AGG(id ORDER BY created_at, id) AS all_ids,
  SUM(subtotal) AS merged_subtotal,
  SUM(tip) AS merged_tip,
  SUM(total) AS merged_total
FROM public.transactions
WHERE type = 'INCOME'
  AND customer_id IS NOT NULL
GROUP BY customer_id, payment_method, transaction_date
HAVING COUNT(*) > 1;

CREATE TEMP TABLE merged_income_notes ON COMMIT DROP AS
SELECT
  dc.keep_id,
  string_agg(
    DISTINCT COALESCE(NULLIF(BTRIM(t.note), ''), s.name, 'Income'),
    ' + '
    ORDER BY COALESCE(NULLIF(BTRIM(t.note), ''), s.name, 'Income')
  ) AS combined_note
FROM duplicate_income_clusters dc
JOIN public.transactions t ON t.id = ANY (dc.all_ids)
LEFT JOIN public.services s ON s.id = t.service_id
GROUP BY dc.keep_id;

UPDATE public.transactions AS t
SET
  subtotal = dc.merged_subtotal,
  tip = dc.merged_tip,
  total = dc.merged_total,
  note = mn.combined_note,
  updated_at = NOW()
FROM duplicate_income_clusters dc
JOIN merged_income_notes mn ON mn.keep_id = dc.keep_id
WHERE t.id = dc.keep_id;

DELETE FROM public.transactions AS t
USING duplicate_income_clusters dc
WHERE t.id = ANY (dc.all_ids)
  AND t.id <> dc.keep_id;

UPDATE public.customers AS c
SET
  first_visit_at = sub.first_visit,
  updated_at = NOW()
FROM (
  SELECT
    customer_id,
    MIN(transaction_date) AS first_visit
  FROM public.transactions
  WHERE type = 'INCOME'
    AND customer_id IS NOT NULL
  GROUP BY customer_id
) AS sub
WHERE c.id = sub.customer_id;

NOTIFY pgrst, 'reload schema';
