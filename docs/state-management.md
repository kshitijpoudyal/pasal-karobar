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

Dashboard analytics queries will use `queryKeys.dashboard` when implemented.

## Client / UI state

- **Theme:** `next-themes` (`src/providers/theme-provider.tsx`)
- **Business context:** _TBD_ (active business selection for multi-device use)

## Forms

- React Hook Form + Zod — feature forms validate with schemas in `src/services/schemas.ts` where shared with services

## Global providers

Composed in `src/providers/app-providers.tsx`: Theme, TanStack Query
