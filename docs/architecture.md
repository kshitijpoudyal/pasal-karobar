# Architecture

Version: MVP

---

# Technology Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## State

- TanStack Query
- React Context

## Forms

- React Hook Form
- Zod

## Backend

- Supabase
- PostgreSQL
- Row Level Security

## Deployment

- Vercel

---

# Architecture Style

Feature First Architecture

Every feature owns:

- UI
- Hooks
- Services
- Types

Shared functionality lives in shared folders.

---

# High Level Architecture

```
Presentation
    ↓
Hooks
    ↓
Services
    ↓
Repository
    ↓
Supabase
    ↓
PostgreSQL
```

React Components never communicate directly with Supabase.

---

# Data layer (Supabase)

| Piece | Location |
| ----- | -------- |
| Browser client | `src/supabase/client.ts` |
| Server client | `src/supabase/server.ts` |
| Admin client (server-only) | `src/supabase/admin.ts` |
| Types | `src/types/database.ts` |
| Repositories | `src/repository/*.repository.ts` |
| Services | `src/services/*.service.ts` (includes `dashboard.service.ts`) |
| Query hooks | `src/hooks/queries/` |
| SQL migrations | `supabase/migrations/` |

Factory helpers: `createRepositories()`, `createAppServices()`, `getClientAppServices()`, `getServerAppServices()`.

---

# Folder Structure

```
src/
  app/
  components/
  features/
  hooks/
  repository/
  services/
  providers/
  supabase/
  constants/
  types/
  utils/
  styles/
```

---

# Feature Structure

Example:

```
features/
  dashboard/
    components/
    hooks/
    services/
    types/
  activity/
  settings/
  transactions/
```

---

# Responsibilities

| Layer        | Responsibility              |
| ------------ | --------------------------- |
| Components   | Display UI only             |
| Hooks        | Manage component state      |
| Services     | Business logic              |
| Repository   | Database communication      |
| Supabase     | Persistence                 |

---

# State Management

## React Context

- Auth (Supabase session)
- Business (active business for the signed-in user)
- Theme

## TanStack Query

- Transactions
- Dashboard
- Services
- Expense Categories
- Business

---

# Design Principles

- Reusable components
- Small files
- Composition over inheritance
- Single responsibility
- Strict typing

---

# Code Standards

- Never use `any`
- No duplicated logic
- No business logic in components
- Prefer named exports
- Use async/await
- Absolute imports
- Strict TypeScript

---

# Error Handling

- Loading States
- Error States
- Empty States
- Error Boundary

---

# Documentation

Every architecture change must update:

- `architecture.md`
- `database.md`
- `decisions.md`

---

# AI Rules

Before implementation:

- Read all docs
- Reuse existing components
- Do not create duplicate UI
- Keep documentation synchronized
