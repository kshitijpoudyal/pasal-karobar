# Database

**Database:** PostgreSQL  
**Backend:** Supabase  
**Version:** MVP

---

# Design Principles

- UUID primary keys
- Soft deletes where appropriate
- `created_at`
- `updated_at`
- Foreign Keys
- Indexes
- Multi-tenant ready

---

# Relationships

```
Business
├── Services
├── Expense Categories
├── Transactions
└── Business Settings
```

---

# Tables

## `business`

| Column         | Notes |
| -------------- | ----- |
| id             |       |
| name           |       |
| business_type  |       |
| currency       |       |
| timezone       |       |
| created_at     |       |
| updated_at     |       |

---

## `services`

| Column         | Notes |
| -------------- | ----- |
| id             |       |
| business_id    |       |
| name           |       |
| default_price  |       |
| icon           |       |
| color          |       |
| display_order  |       |
| is_active      |       |
| created_at     |       |
| updated_at     |       |

**Remove from catalog (app):** sets `is_active = false` (soft remove). Income rows keep their `service_id`; no FK cascade or check-constraint updates.

---

## `expense_categories`

| Column         | Notes |
| -------------- | ----- |
| id             |       |
| business_id    |       |
| name           |       |
| icon           |       |
| color          |       |
| display_order  |       |
| is_active      |       |
| created_at     |       |
| updated_at     |       |

---

## `transactions`

| Column               | Notes |
| -------------------- | ----- |
| id                   |       |
| business_id          |       |
| type                 |       |
| service_id           |       |
| expense_category_id  |       |
| subtotal             |       |
| tip                  |       |
| total                |       |
| payment_method       |       |
| note                 |       |
| transaction_date     |       |
| created_at           |       |
| updated_at           |       |

### Rules

**Income**

- `service_id` required when recording new income (nullable on existing rows if the service was removed)
- `expense_category_id` null

**Expense**

- `expense_category_id` required when recording new expenses (nullable on existing rows if the category was removed)
- `service_id` null

---

## `business_settings`

| Column         | Notes |
| -------------- | ----- |
| business_id    |       |
| setting_key    |       |
| setting_value  |       |

Primary key: `(business_id, setting_key)`.

---

## `business_members` (tenancy / RLS)

Links Supabase Auth users to a business for row-level isolation. Not a product domain table; required for policies.

| Column       | Notes                          |
| ------------ | ------------------------------ |
| id           | UUID primary key               |
| business_id  | FK → `business`                |
| user_id      | FK → `auth.users`              |
| created_at   |                                |

Unique `(business_id, user_id)`. On `business` insert, the creator is added via trigger when authenticated. The app creates businesses through `create_business_for_owner()` (see migration `20260730194500_create_business_for_owner.sql`) so membership and RLS stay consistent.

**Seeded data:** `supabase/seed.sql` does not insert `business_members`. After sign-in, either let the app bootstrap a new business or link your user in the SQL editor:

```sql
INSERT INTO public.business_members (business_id, user_id)
SELECT b.id, auth.uid()
FROM public.business b
WHERE b.name = 'Royal Cuts Barber Shop'
ON CONFLICT DO NOTHING;
```

(Run while authenticated in the SQL editor, or substitute your user UUID for `auth.uid()`.)

---

# Migrations

SQL migrations live in `supabase/migrations/`.

| Migration                               | Description        |
| --------------------------------------- | ------------------ |
| `20260330183000_initial_schema.sql`     | MVP schema + RLS   |
| `20260730194500_create_business_for_owner.sql` | Onboarding RPC (avoids business INSERT 403) |

Apply with the Supabase CLI (`supabase db push`) or the SQL editor in the Supabase dashboard.

**Order matters.** Always apply `20260330183000_initial_schema.sql` before `20260730194500_create_business_for_owner.sql`. If the SQL editor reports `type public.business_type does not exist`, the initial schema has not been applied yet.

### Supabase SQL Editor (empty project)

1. Open **SQL → New query**.
2. Paste and run the **full** contents of `supabase/migrations/20260330183000_initial_schema.sql`.
3. Paste and run `supabase/migrations/20260730194500_create_business_for_owner.sql`.
   (Same SQL is copied at `supabase/sql/create_business_for_owner.sql` for convenience.)
4. Optional: run `supabase/seed.sql` for demo rows (then link your auth user in `business_members`; see above).

### Daily mock transactions (dev / demo)

Add more **today** rows without resetting the database:

1. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Supabase → **Project Settings → API → service_role**).
2. Run:

```bash
npm run seed:daily
```

Optional flags: `npm run seed:daily -- --income 60 --expense 5`. Env overrides: `SEED_BUSINESS_ID`, `SEED_INCOME_COUNT`, `SEED_EXPENSE_COUNT`, `SEED_TIMEZONE` (default `Asia/Kathmandu`).

Schedule locally (macOS cron example, 8:00 daily):

```cron
0 8 * * * cd /path/to/pasal-karobar && npm run seed:daily >> /tmp/pasal-seed-daily.log 2>&1
```

### RPC 404 but function exists in SQL

If `SELECT proname ... create_business_for_owner` returns a row but the app still gets `POST .../rpc/create_business_for_owner 404`:

1. In SQL Editor, run:

```sql
NOTIFY pgrst, 'reload schema';
```

2. Wait ~10 seconds, hard-refresh the app, sign out and sign in again.

3. Confirm execute grant:

```sql
SELECT has_function_privilege(
  'authenticated',
  'public.create_business_for_owner(text, public.business_type, text, text)',
  'EXECUTE'
) AS authenticated_can_execute;
```

`authenticated_can_execute` should be `t`. If not, re-run `supabase/sql/create_business_for_owner.sql`.

4. In the browser Network tab, a successful bootstrap should show **200** on `rpc/create_business_for_owner` (or a **201** on `business` if the app fallback runs).

---

# Enums

## `transaction_type`

- `INCOME`
- `EXPENSE`

## `payment_method`

- `CASH`
- `ESEWA`
- `KHALTI`
- `FONEPAY`
- `BANK_TRANSFER`

## `business_type`

- `BARBER`
- `SALON`
- `GROCERY`
- `PHARMACY`
- `RESTAURANT`
- `OTHER`

---

# Indexes

## `transactions`

- `business_id`
- `transaction_date`
- `type`
- `payment_method`

## `services`

- `business_id`
- `display_order`

## `expense_categories`

- `business_id`
- `display_order`

---

# Analytics Supported

- Revenue
- Expenses
- Profit
- Revenue by Service
- Top Services
- Revenue Trends
- Peak Hours
- Peak Days
- Average Sale
- Cash vs Digital
- Expense Breakdown
- Monthly Revenue
- Quarterly Revenue
- Yearly Revenue
- Forecasting

---

# Future Tables

- customers
- appointments
- employees
- inventory
- suppliers
- branches
- subscriptions
- audit_logs
- roles
- permissions
- reports

---

# Migration Rules

All schema changes require:

- SQL migration
- Updated TypeScript types
- Updated repository
- Updated documentation
- Updated Supabase policies

---

# Row Level Security

Every table must enforce business-level isolation.

Users should only access records belonging to their own business.

Policies should be enabled for every table before production.
