# Dashboard stats troubleshooting

Dashboard KPIs and charts are **recomputed from `transactions`** on each fetch. If numbers look stale, work through this list before assuming a bug.

## 1. Match the period to what you expect

Dashboard defaults to **Day / today**. Activity uses **This Week / Month / Year** — totals will differ until you align them.

On Dashboard, use the period tabs (**Day · Week · Month · Year**) and the date scrubber so the selected range includes the entries you care about. Compare Activity using a similar window (e.g. Dashboard **Week** vs Activity **This Week**).

## 2. Refresh in the app

- Tap the **refresh** control (circular arrow) next to the period scrubber on Dashboard. This reloads dashboard summaries and transaction lists from Supabase.
- If an error banner appears, use **Retry**.
- **Hard reload** the tab (`Cmd+Shift+R`) to clear in-memory React Query cache after deploying a new build.

## 3. Activity filters do not apply to Dashboard

Search, **Type**, and **Pay** on Activity only affect Activity. Clear search and set filters to **All** before comparing screens.

## 4. Verify data in Supabase

In **SQL Editor**, replace `<business_id>` with your shop UUID:

```sql
SELECT id, type, total, payment_method, transaction_date, note
FROM public.transactions
WHERE business_id = '<business_id>'
ORDER BY transaction_date DESC
LIMIT 50;
```

If deleted rows still appear here, the database was not updated (check RLS / delete errors). If SQL is correct but the UI is wrong after refresh, see below.

## 5. PWA / cached builds

Installed PWAs may serve an older bundle. Open the site in a normal browser tab after deploy, or unregister the service worker, then hard reload.

## 6. Development: React Query Devtools

In `npm run dev`, open Devtools (bottom-left). Find queries keyed `["dashboard","summary", …]`. **Invalidate** them after a test add/delete to confirm refetch behavior.

## Success check

1. Hard reload once.
2. Set Dashboard to **Week** (or your comparison window).
3. Add or delete a test entry on Activity.
4. Open Dashboard — numbers should update within a couple of seconds, or immediately after **Refresh stats**.
