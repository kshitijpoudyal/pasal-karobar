# Pasal Karobar

Production-oriented Next.js application scaffold. Application features are not implemented yet.

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (Radix)
- TanStack Query, React Hook Form, Zod
- Lucide React, date-fns
- Serwist (PWA service worker)

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Dev server (Turbopack)     |
| `npm run build`     | Production build + Serwist |
| `npm run start`     | Start production server    |
| `npm run lint`      | ESLint                     |
| `npm run format`    | Prettier write             |
| `npm run typecheck` | TypeScript check           |

## Documentation

See the [`docs/`](./docs/) directory for architecture, standards, and product placeholders.

## Path aliases

`@/*` maps to `src/*` (see `tsconfig.json`).
