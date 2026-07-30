-- Link auth user to demo business (Classic Gents Salon + seed transactions)
-- Run in Supabase Dashboard → SQL Editor

INSERT INTO public.business_members (business_id, user_id)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'eefdff6d-8cc5-4652-b664-e5e9524f9727'
)
ON CONFLICT (business_id, user_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
