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

- `service_id` required
- `expense_category_id` null

**Expense**

- `expense_category_id` required
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

Unique `(business_id, user_id)`. On `business` insert, the creator is added via trigger when authenticated.

---

# Migrations

SQL migrations live in `supabase/migrations/`.

| Migration                               | Description        |
| --------------------------------------- | ------------------ |
| `20260330183000_initial_schema.sql`     | MVP schema + RLS   |

Apply with the Supabase CLI (`supabase db push`) or the SQL editor in the Supabase dashboard.

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
