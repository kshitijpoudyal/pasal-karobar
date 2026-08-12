# Offline support (PWA)

Pasal Karobar records income and expenses while offline, then syncs them to Supabase when connectivity returns. The installed PWA and the browser tab share the same behavior.

## What works offline

- **Record transaction** (income and expense) from the floating action / New Entry modal
- **Activity list** shows entries with a **Pending sync** badge until upload completes
- **Service catalog** and **expense categories** from the last online session (TanStack Query cache persisted to `localStorage`)
- **Session** via Supabase auth storage (you must sign in at least once while online)

## What does not sync until online

- Dashboard KPIs and charts (server summaries only; a footnote appears when entries are pending)
- Customer directory updates, settings changes, edits, and deletes

## Architecture

| Piece                        | Location                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| Outbox (IndexedDB)           | `src/offline/outbox-store.ts`                                    |
| Sync engine                  | `src/offline/sync-outbox.ts`                                     |
| Pending row ids              | `src/offline/pending-transaction.ts` (`pending-sync:{clientId}`) |
| Connectivity + sync UI state | `src/providers/connectivity-provider.tsx`                        |
| Status banner                | `src/components/layout/offline-status-banner.tsx`                |
| Query persistence filter     | `src/lib/query-persist.ts`                                       |
| Service worker (app shell)   | `src/sw.ts` (Serwist)                                            |

Offline creates enqueue a `CreateTransactionInput` payload. When online, sync calls the same `TransactionService.create` path as live entry (including customer phone resolution).

## Manual QA checklist (production build)

Serwist is **disabled in `npm run dev`**. Use a production build:

```bash
npm run build
npm run start
```

1. Open `http://localhost:3000`, sign in, open Dashboard once (loads catalog + business).
2. Install the PWA (browser install prompt) or use Application → Manifest in DevTools.
3. Record one income entry online; confirm it appears in Activity and Supabase.
4. DevTools → Network → **Offline** (or disable Wi‑Fi).
5. Confirm the top banner: offline message.
6. Record income and expense offline; confirm toasts say saved on device.
7. Open **Activity** — entries show **Pending sync**; delete menu is hidden for them.
8. Open **Dashboard** — footnote about pending entries; KPIs unchanged vs before offline entries.
9. Go **Online**; banner shows syncing, then synced toast.
10. Activity badges clear; dashboard refresh shows new totals.
11. Verify rows in Supabase for offline entries (including customer phone on income if used).

## Troubleshooting

- **Stuck on “Saving…” while offline:** Record entry uses `networkMode: 'always'` so the outbox runs when the browser is offline; reload after updating if an older build paused mutations until reconnect.
- **Stale PWA bundle:** unregister the service worker and hard reload (see [dashboard-troubleshooting.md](./dashboard-troubleshooting.md)).
- **First launch offline:** sign-in and business bootstrap require network once.
- **Sync errors:** use **Retry** on the banner; failed items stay in IndexedDB until retry succeeds.
