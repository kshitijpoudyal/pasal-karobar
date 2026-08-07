# Business timezone

## Model

| Layer | Rule |
| ----- | ---- |
| **Database** | `transactions.transaction_date` is a UTC instant (ISO 8601 with offset). New entries use `new Date().toISOString()`. |
| **Business setting** | `businesses.timezone` is an IANA name (default `Asia/Kathmandu` from onboarding). |
| **UI & aggregates** | All user-visible times, day grouping, and dashboard period windows use the **active business timezone**, not the device clock or server region. |

## Code map

- [`src/utils/business-datetime.ts`](../src/utils/business-datetime.ts) — `dateKeyInTimeZone`, `hourInTimeZone`, `formatTimeInBusinessZone`, `zonedPeriodBounds`, activity/dashboard range helpers, `groupTransactionsByDayInTimeZone`.
- [`src/hooks/use-business-timezone.ts`](../src/hooks/use-business-timezone.ts) — client hook reading `useActiveBusiness().business.timezone`.
- [`src/utils/date-ranges.ts`](../src/utils/date-ranges.ts) — dashboard scrubber ranges; pass `timeZone` (defaults to Kathmandu if omitted).
- [`src/services/dashboard.service.ts`](../src/services/dashboard.service.ts) — loads business timezone on the server for summaries, charts, and peak analysis.

## Debugging mismatches

1. Compare Supabase `transaction_date` (UTC) with your business timezone in Settings.
2. In development, watch the console for `[business-datetime] local vs business hour mismatch` when your laptop timezone differs from the shop (set `NEXT_PUBLIC_DEBUG_TZ=0` to silence).
3. Run unit tests: `npm test` (`src/utils/business-datetime.test.ts`).

## Changing timezone

Update timezone under **Settings → Business Identity** (default Kathmandu, Nepal). All screens pick up the value after save and refetch.
