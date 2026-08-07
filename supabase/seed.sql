-- Pasal Karobar seed.sql
BEGIN;

TRUNCATE TABLE
    transactions,
    services,
    expense_categories,
    business_settings,
    business
RESTART IDENTITY CASCADE;

-- Business
INSERT INTO business (id, name)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Classic Gents Salon'
);

INSERT INTO business_settings (business_id, setting_key, setting_value)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'business_type',
    'BARBER'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'currency',
    'NPR'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'timezone',
    'Asia/Kathmandu'
  );

-- Services
INSERT INTO services
(id,business_id,name,default_price,icon,color,display_order,is_active)
VALUES
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Haircut',500,'hair','#4F46E5',1,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Beard Trim',250,'beard','#16A34A',2,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Haircut + Beard',700,'combo','#EA580C',3,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Kids Haircut',350,'kids','#2563EB',4,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Facial',1200,'facial','#9333EA',5,true);

-- Expense Categories
INSERT INTO expense_categories
(id,business_id,name,icon,color,display_order,is_active)
VALUES
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Rent','home','#DC2626',1,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Electricity','bolt','#EAB308',2,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Supplies','package','#3B82F6',3,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Water','droplets','#06B6D4',4,true),
(gen_random_uuid(),'11111111-1111-1111-1111-111111111111','Internet','wifi','#8B5CF6',5,true);

INSERT INTO business_settings (business_id,setting_key,setting_value)
VALUES
('11111111-1111-1111-1111-111111111111','theme','light'),
('11111111-1111-1111-1111-111111111111','language','en'),
('11111111-1111-1111-1111-111111111111','currency','NPR');

-- 200 Income Transactions
INSERT INTO transactions
(id,business_id,type,service_id,expense_category_id,subtotal,tip,total,payment_method,note,transaction_date)
SELECT
gen_random_uuid(),
b.id,
'INCOME'::transaction_type,
s.id,
NULL,
s.default_price,
tip,
s.default_price + tip,
CASE floor(random()*5)
 WHEN 0 THEN 'CASH'::payment_method
 WHEN 1 THEN 'CASH'::payment_method
 WHEN 2 THEN 'ESEWA'::payment_method
 WHEN 3 THEN 'KHALTI'::payment_method
 ELSE 'BANK_TRANSFER'::payment_method
END,
NULL,
now()
- (floor(random()*30)||' days')::interval
- (floor(random()*10)||' hours')::interval
FROM generate_series(1,200)
CROSS JOIN business b
CROSS JOIN LATERAL (
    SELECT * FROM services ORDER BY random() LIMIT 1
) s
CROSS JOIN LATERAL (
    SELECT CASE WHEN random()<0.30 THEN (floor(random()*120)+20)::numeric(12,2) ELSE 0::numeric(12,2) END AS tip
) t;

-- 40 Expense Transactions
INSERT INTO transactions
(id,business_id,type,service_id,expense_category_id,subtotal,tip,total,payment_method,note,transaction_date)
SELECT
gen_random_uuid(),
b.id,
'EXPENSE'::transaction_type,
NULL,
c.id,
amount,
0,
amount,
CASE floor(random()*3)
 WHEN 0 THEN 'CASH'::payment_method
 WHEN 1 THEN 'BANK_TRANSFER'::payment_method
 ELSE 'ESEWA'::payment_method
END,
NULL,
now() - (floor(random()*30)||' days')::interval
FROM generate_series(1,40)
CROSS JOIN business b
CROSS JOIN LATERAL (
    SELECT * FROM expense_categories ORDER BY random() LIMIT 1
) c
CROSS JOIN LATERAL (
    SELECT (floor(random()*4000)+500)::numeric(12,2) AS amount
) a;

-- ---------------------------------------------------------------------------
-- Extra mock volume: current week (Mon–Sun) + heavier today
-- Re-run: supabase db reset / seed.sql (dates stay relative to seed time)
-- ---------------------------------------------------------------------------

INSERT INTO transactions
(id,business_id,type,service_id,expense_category_id,subtotal,tip,total,payment_method,note,transaction_date)
SELECT
gen_random_uuid(),
'11111111-1111-1111-1111-111111111111'::uuid,
'INCOME'::transaction_type,
s.id,
NULL,
s.default_price,
tip,
s.default_price + tip,
CASE floor(random()*5)
 WHEN 0 THEN 'CASH'::payment_method
 WHEN 1 THEN 'CASH'::payment_method
 WHEN 2 THEN 'ESEWA'::payment_method
 WHEN 3 THEN 'KHALTI'::payment_method
 ELSE 'FONEPAY'::payment_method
END,
NULL,
date_trunc('week', now())
  + (day_idx || ' days')::interval
  + ((9 + floor(random()*9)) || ' hours')::interval
  + (floor(random()*60) || ' minutes')::interval
FROM generate_series(0, 6) AS day_idx
CROSS JOIN generate_series(1, 22) AS _n
CROSS JOIN LATERAL (
    SELECT * FROM services
    WHERE business_id = '11111111-1111-1111-1111-111111111111'
    ORDER BY random()
    LIMIT 1
) s
CROSS JOIN LATERAL (
    SELECT CASE
      WHEN random() < 0.35 THEN (floor(random()*150)+25)::numeric(12,2)
      ELSE 0::numeric(12,2)
    END AS tip
) t;

INSERT INTO transactions
(id,business_id,type,service_id,expense_category_id,subtotal,tip,total,payment_method,note,transaction_date)
SELECT
gen_random_uuid(),
'11111111-1111-1111-1111-111111111111'::uuid,
'INCOME'::transaction_type,
s.id,
NULL,
s.default_price,
tip,
s.default_price + tip,
CASE floor(random()*5)
 WHEN 0 THEN 'CASH'::payment_method
 WHEN 1 THEN 'ESEWA'::payment_method
 WHEN 2 THEN 'KHALTI'::payment_method
 WHEN 3 THEN 'FONEPAY'::payment_method
 ELSE 'BANK_TRANSFER'::payment_method
END,
NULL,
date_trunc('day', now())
  + ((8 + floor(random()*10)) || ' hours')::interval
  + (floor(random()*60) || ' minutes')::interval
FROM generate_series(1, 36) AS _n
CROSS JOIN LATERAL (
    SELECT * FROM services
    WHERE business_id = '11111111-1111-1111-1111-111111111111'
    ORDER BY random()
    LIMIT 1
) s
CROSS JOIN LATERAL (
    SELECT CASE
      WHEN random() < 0.40 THEN (floor(random()*200)+30)::numeric(12,2)
      ELSE 0::numeric(12,2)
    END AS tip
) t;

INSERT INTO transactions
(id,business_id,type,service_id,expense_category_id,subtotal,tip,total,payment_method,note,transaction_date)
SELECT
gen_random_uuid(),
'11111111-1111-1111-1111-111111111111'::uuid,
'EXPENSE'::transaction_type,
NULL,
c.id,
amount,
0,
amount,
CASE floor(random()*3)
 WHEN 0 THEN 'CASH'::payment_method
 WHEN 1 THEN 'BANK_TRANSFER'::payment_method
 ELSE 'ESEWA'::payment_method
END,
NULL,
date_trunc('week', now())
  + (day_idx || ' days')::interval
  + ((10 + floor(random()*6)) || ' hours')::interval
FROM generate_series(0, 6) AS day_idx
CROSS JOIN generate_series(1, 2) AS _n
CROSS JOIN LATERAL (
    SELECT * FROM expense_categories
    WHERE business_id = '11111111-1111-1111-1111-111111111111'
    ORDER BY random()
    LIMIT 1
) c
CROSS JOIN LATERAL (
    SELECT (floor(random()*2500)+300)::numeric(12,2) AS amount
) a;

INSERT INTO transactions
(id,business_id,type,service_id,expense_category_id,subtotal,tip,total,payment_method,note,transaction_date)
SELECT
gen_random_uuid(),
'11111111-1111-1111-1111-111111111111'::uuid,
'EXPENSE'::transaction_type,
NULL,
c.id,
amount,
0,
amount,
'CASH'::payment_method,
'Daily supplies',
date_trunc('day', now()) + ((11 + floor(random()*5)) || ' hours')::interval
FROM generate_series(1, 3) AS _n
CROSS JOIN LATERAL (
    SELECT * FROM expense_categories
    WHERE business_id = '11111111-1111-1111-1111-111111111111'
      AND name IN ('Supplies', 'Electricity')
    ORDER BY random()
    LIMIT 1
) c
CROSS JOIN LATERAL (
    SELECT (floor(random()*800)+200)::numeric(12,2) AS amount
) a;

-- Demo owner (local dev); change UUID or use link-demo-business-member.sql
INSERT INTO public.business_members (business_id, user_id)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'eefdff6d-8cc5-4652-b664-e5e9524f9727'
)
ON CONFLICT (business_id, user_id) DO NOTHING;

COMMIT;
