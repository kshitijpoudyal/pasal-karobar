# Coding standards

> **Status:** Initial baseline from project tooling.

## TypeScript

- Strict mode enabled (`tsconfig.json`)
- Prefer `type` imports for types-only symbols
- Path alias: `@/*` → `src/*`

## Linting & formatting

- **ESLint:** `eslint.config.mjs` (Next.js core-web-vitals + TypeScript)
- **Prettier:** `prettier.config.mjs` — run `npm run format` before commits

## React / Next.js

- Default to Server Components; add `"use client"` only when needed
- Colocate feature code under `src/features/<name>/`
- Shared UI in `src/components/`
- Do **not** import `@/supabase/*` or `@/repository/*` from components — use hooks in `src/hooks/queries/`

## Forms & validation

- React Hook Form + Zod (`@hookform/resolvers`) — patterns _TBD in features_

## Naming

_TBD — file naming, exports, feature folder names._
