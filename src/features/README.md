# Feature modules

Feature-first layout: each domain feature owns UI, hooks, and local types under `src/features/<feature-name>/`.

Suggested structure per feature:

```
src/features/<feature-name>/
  components/
  hooks/
  types.ts
  index.ts
```

Cross-cutting UI belongs in `src/components/`. Data access belongs in `src/repository/` and `src/services/`.

See `docs/architecture.md`.
