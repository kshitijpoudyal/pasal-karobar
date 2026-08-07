# State management

Version: MVP

## Server state (TanStack Query)

Configured in `src/lib/query-client.ts` and `src/providers/query-provider.tsx`.

- Default query `staleTime`: 60 seconds
- Query `retry`: 1; mutations do not retry
- Query keys: `src/constants/query-keys.ts`

### Data access flow

React components and route UI **must not** import `@/supabase/*` or `@/repository/*`.

```
Component → hook (src/hooks/queries/*) → service → repository → Supabase
```

Server Components / Server Actions (future):

```
getServerAppServices() → service → repository → Supabase
```

(`src/services/server.ts`)

### Hook modules

| Hook module                         | Domain              |
| ----------------------------------- | ------------------- |
| `use-business-queries`              | Business            |
| `use-transaction-queries`           | Transactions        |
| `use-service-catalog-queries`       | Services catalog    |
| `use-expense-category-queries`      | Expense categories  |
| `use-business-setting-queries`      | Business settings   |
| `use-dashboard-queries`               | Dashboard summary   |

Dashboard summaries use `refetchOnMount: "always"` and `refetchOnWindowFocus: true`. After transaction edits, `syncAfterTransactionChange` / `refreshBusinessStats` in `transaction-query-cache.ts` invalidates lists and refetches dashboard queries. See [dashboard-troubleshooting.md](./dashboard-troubleshooting.md) if KPIs look stale.

Transaction timestamps are stored in UTC and displayed in the business timezone — see [timezone.md](./timezone.md).

Feature-level hooks (UI orchestration, filters, forms) live under `src/features/*/hooks/` and call the query modules above — they must not import Supabase or repositories directly.

## Client / UI state

- **Theme:** `next-themes` (`src/providers/theme-provider.tsx`)
- **Auth:** `AuthProvider` — Supabase session, email/password sign-in (`src/providers/auth-provider.tsx`)
- **Active business:** `BusinessProvider` — first business for the signed-in user, bootstrap create when empty (`src/providers/business-provider.tsx`)
- **Supabase gate:** `SupabaseGate` — blocks the app until env, auth, and business are ready (`src/components/layout/supabase-gate.tsx`)

## Forms

- React Hook Form + Zod — feature forms validate with schemas in `src/services/schemas.ts` where shared with services

## Global providers

Composed in `src/providers/app-providers.tsx`: Theme → TanStack Query → Auth → Business → SupabaseGate → record-transaction modal provider.
