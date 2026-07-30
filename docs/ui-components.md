# UI components

> **Status:** Baseline shadcn/ui initialized.

## shadcn/ui

- Config: `components.json`
- Utilities: `src/utils/cn.ts` (re-exported as `@/lib/utils` for CLI compatibility)
- Add components: `npx shadcn@latest add <component>`

## Installed components

- `button` — `src/components/ui/button.tsx`

## Shared components

Place reusable non-feature UI in `src/components/` (not under a specific feature).

- **`AppLeftNav`** — fixed left navigation (same on Dashboard, Activity, Settings); `src/components/layout/app-left-nav.tsx`
- **`AppPageHeader`** — sticky top bar; pass `title` per screen; `src/components/layout/app-page-header.tsx`
- **`AppSidebar`** — deprecated alias for `AppLeftNav`

## Theming

- Dark/light via `ThemeProvider` in `src/providers/theme-provider.tsx`
- Tokens in `src/styles/globals.css`
