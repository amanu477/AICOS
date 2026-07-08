# AICOS — AI Commerce Operating System

An AI-driven commerce platform that acts as an "AI employee" for Shopify merchants — automating SEO, pricing optimization, and providing proactive insights via an AI assistant.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, Shadcn UI, Wouter, React Query 5 |
| Backend | Express 5, Node.js 24, BullMQ, Pino, Zod |
| Database | PostgreSQL 16 (Replit built-in), Drizzle ORM |
| Cache/Queue | Redis via ioredis + BullMQ (optional — falls back to inline sync) |
| Auth | Clerk |
| AI | Groq (llama-3.3-70b-versatile), OpenAI |
| Shopify | OAuth, Webhooks, Storefront sync |

## Structure

```
artifacts/
  aicos/          # React SPA (port 23013)
  api-server/     # Express backend (port 8080)
lib/
  db/             # Drizzle schema + migrations
  api-spec/       # OpenAPI contract
  api-zod/        # Zod schemas
  api-client-react/  # Generated React Query hooks
  integrations/   # Shopify + AI logic
```

## Running

Two workflows run in parallel (started automatically with the Run button):
- **Start application** — Vite dev server on port 5000
- **Start Backend** — Express API on port 8080

To push DB schema changes:
```bash
pnpm --filter @workspace/db run push
```

To install dependencies:
```bash
pnpm install
```

## Required Secrets

| Secret | Purpose | Required for startup |
|---|---|---|
| `GROQ_API_KEY` | AI assistant (Groq llama-3.3-70b) | ✅ Yes — crashes without it |
| `SHOPIFY_TOKEN_ENCRYPTION_KEY` | AES-256-GCM encryption for Shopify tokens | When Shopify is used |
| `CLERK_PUBLISHABLE_KEY` | Clerk auth (frontend) | Auth features |
| `CLERK_SECRET_KEY` | Clerk auth (backend) | Auth features |
| `SHOPIFY_API_KEY` | Shopify OAuth | Shopify integration |
| `SHOPIFY_API_SECRET` | Shopify HMAC verification | Shopify integration |
| `REDIS_URL` | BullMQ job queue | Optional — falls back to inline sync |

`DATABASE_URL` is managed automatically by Replit's built-in PostgreSQL module.

## User Preferences

- Groq (llama-3.3-70b-versatile) is the primary AI model
