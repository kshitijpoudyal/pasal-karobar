-- Enum values must be committed before use in indexes/constraints (separate migration).

ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'OTHER';

NOTIFY pgrst, 'reload schema';
