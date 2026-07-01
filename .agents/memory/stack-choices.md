---
name: Stack Choices and Conventions
description: Durable decisions about the AICOS stack that should be consistent across sessions.
---

## ORM: Drizzle only
User explicitly said NOT to use Prisma despite some prompts mentioning it. Always use Drizzle ORM.

## Zod import
- Frontend: import from `"zod/v4"` (via catalog in Vite artifact)
- Backend (api-server): import from `"zod"` (must be added as explicit dependency)
- `zod` is NOT transitive from `@workspace/api-zod` into `api-server`; must be listed in `artifacts/api-server/package.json` dependencies

## Lib rebuild required after schema changes
After adding tables to `lib/db/src/schema/`, always run `pnpm run typecheck:libs` before running api-server typecheck, otherwise TypeScript sees stale declarations and reports false "no exported member" errors.

**Why:** lib packages are composite — they emit declarations to `dist/`. api-server imports from the declaration output, not source.
