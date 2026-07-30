# Architecture decisions

> **Status:** Placeholder — use ADR-style entries as decisions are made.

## Template

```markdown
### ADR-NNN: Title

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Superseded

**Context:** …

**Decision:** …

**Consequences:** …
```

## Log

| ID    | Title                                      | Status   |
| ----- | ------------------------------------------ | -------- |
| ADR-001 | Supabase data layer (repository + service) | Accepted |

### ADR-001: Supabase data layer (repository + service)

**Date:** 2026-03-30  
**Status:** Accepted

**Context:** MVP needs typed Postgres access with business-level isolation and a strict UI → hooks → services → repository boundary.

**Decision:** Use `@supabase/supabase-js` + `@supabase/ssr` for clients; class-based repositories in `src/repository/`; Zod-validated services in `src/services/`; TanStack Query hooks in `src/hooks/queries/`. Schema in `supabase/migrations/` with `business_members` for RLS.

**Consequences:** Components must not import Supabase or repositories directly. Auth/onboarding must create or join `business_members` rows. Dashboard analytics computed in services in a later task.
