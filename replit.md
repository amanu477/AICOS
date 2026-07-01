# AICOS – AI Commerce Operating System

An AI-powered Shopify store management platform. Nova, the AI employee, handles product management, SEO, pricing optimization, automation, analytics, and more via a chat interface backed by Groq (llama-3.3-70b-versatile).

## Run & Operate

- **Frontend**: `pnpm --filter @workspace/aicos run dev` — React + Vite SPA (port from `$PORT`, base path from `$BASE_PATH`)
- **API Server**: `pnpm --filter @workspace/api-server run dev` — Express 5 backend (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `GROQ_API_KEY` | Nova AI (llama-3.3-70b-versatile via Groq) |
| `CLERK_SECRET_KEY` | Clerk auth — auto-provisioned |
| `CLERK_PUBLISHABLE_KEY` | Clerk auth — auto-provisioned |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth (frontend) — auto-provisioned |
| `SESSION_SECRET` | Express session signing |

## Optional Services

| Service | Env Var | Behavior without it |
|---------|---------|---------------------|
| Redis | `REDIS_URL` | Shopify sync runs inline; BullMQ jobs unavailable |
| Shopify | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_TOKEN_ENCRYPTION_KEY` | Shopify connect flow disabled |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc. | Billing features disabled |
| UploadThing | `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID` | File uploads disabled |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18, Vite 7, TailwindCSS v4, shadcn/ui, Wouter, TanStack Query, Zustand
- API: Express 5, Drizzle ORM, PostgreSQL, Zod, Pino logging
- AI: Groq SDK (llama-3.3-70b-versatile), SSE streaming
- Auth: Replit-managed Clerk (cookie-based on web)
- Jobs: BullMQ on Redis (optional)

## Where things live

- DB schema: `lib/db/src/schema/`
- API routes: `artifacts/api-server/src/routes/`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Frontend pages: `artifacts/aicos/src/app/` and `artifacts/aicos/src/pages/`
- Nova AI: routes at `/api/nova/*`, frontend at `/nova`, model config at `artifacts/api-server/src/lib/groq.ts`
- Shopify integration: `artifacts/api-server/src/routes/shopify.ts`, `lib/db/src/schema/stores.ts`

## Architecture decisions

- OpenAPI-first: `lib/api-spec/openapi.yaml` is the single source of truth; Orval generates typed hooks and Zod schemas
- Drizzle over Prisma: lighter, SQL-closer, better Zod integration
- BullMQ for AI/sync jobs: long-running operations never block HTTP
- SSE for Nova streaming: simpler than WebSockets for unidirectional AI output
- Multi-tenant via `store_id`: every DB query scoped to a store; cross-tenant leaks are structurally impossible
- Clerk auth: cookie-based on web (no bearer tokens needed in frontend code)

## Gotchas

- `GROQ_API_KEY` is imported at module load time — the server won't start without it
- `REDIS_URL` is optional; missing it logs a warning but the app still runs (Shopify sync runs inline)
- Clerk dev keys warning in browser console is expected and harmless during development
- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after changing DB schema files

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `ARCHITECTURE.md` for full system design docs
