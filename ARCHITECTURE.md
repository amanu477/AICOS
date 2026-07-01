# AICOS — AI Commerce Operating System
## Phase 1: Complete Architecture Blueprint

> Every merchant receives their own AI employee. The platform must feel like hiring
> a full-time team member, not using software.

---

## Table of Contents

1. [Project Vision & Principles](#1-project-vision--principles)
2. [Tech Stack Decisions](#2-tech-stack-decisions)
3. [Folder & Package Structure](#3-folder--package-structure)
4. [Component Architecture](#4-component-architecture)
5. [Database Architecture](#5-database-architecture)
6. [API Architecture](#6-api-architecture)
7. [Authentication Flow](#7-authentication-flow)
8. [Shopify Integration Flow](#8-shopify-integration-flow)
9. [AI Architecture](#9-ai-architecture)
10. [Billing Architecture](#10-billing-architecture)
11. [State Management Strategy](#11-state-management-strategy)
12. [Security Strategy](#12-security-strategy)
13. [Deployment Strategy](#13-deployment-strategy)

---

## 1. Project Vision & Principles

### Core Metaphor
AICOS is not a dashboard. It is an AI employee. Every feature should reinforce
that metaphor: the AI speaks, proactively acts, makes recommendations, and learns.

### Design Principles
| Principle | Implementation |
|-----------|---------------|
| **Contract-first** | OpenAPI spec written before any code |
| **Multi-tenant safe** | Every DB row scoped to `store_id` |
| **AI-first** | Every domain module has an AI job queue attached |
| **Background-first** | Heavy work (sync, AI, reports) always queued, never inline |
| **Observable** | Structured logging, job status, audit trail on every write |
| **Fail loudly** | No silent fallbacks; explicit error states surfaced to user |

---

## 2. Tech Stack Decisions

### Frontend
| Library | Version | Why |
|---------|---------|-----|
| React + Vite | 18 / 6 | Fast HMR, tree-shaking, native ESM — fits our monorepo |
| TypeScript | 5.9 | Strict mode throughout; generated types from OpenAPI & Drizzle |
| Tailwind CSS | 4 | Utility-first; pairs with design tokens in `index.css` |
| Shadcn UI | latest | Unstyled + accessible; owned source — not a black-box dep |
| Framer Motion | 11 | Declarative animations; essential for "alive" AI assistant feel |
| React Query | 5 | Server-state cache; pairs with Orval-generated hooks |
| React Hook Form + Zod | 7 / 3 | Type-safe forms; Zod schemas shared with backend |
| Wouter | 3 | Lightweight router; no server-side routing needed (SPA) |

### Backend
| Library | Why |
|---------|-----|
| Express 5 | Mature, minimal surface area; async error propagation built-in |
| Drizzle ORM | Type-safe SQL; migrations as code; lighter than Prisma |
| PostgreSQL | Primary database — ACID, JSON columns, full-text search |
| Redis | Job queues (BullMQ), rate limiting, session cache |
| BullMQ | Durable job queue on Redis; retries, priorities, concurrency |
| Zod | Runtime validation on all API inputs |
| Pino | Structured JSON logging |

### External Services
| Service | Role |
|---------|------|
| Shopify Admin API | Store data, products, orders, webhooks |
| OpenAI API (GPT-4o) | AI employee brain — chat, analysis, generation |
| Stripe | Subscription billing + usage-based metering |
| UploadThing | File uploads (product images, CSV imports) |
| Clerk / Replit Auth | User identity, multi-tenant session |

---

## 3. Folder & Package Structure

```text
aicos/                                  ← monorepo root
├── artifacts/
│   ├── aicos/                          ← React + Vite frontend SPA
│   │   └── src/
│   │       ├── app/                    ← Route-level page components
│   │       │   ├── (auth)/
│   │       │   │   ├── login/
│   │       │   │   └── onboarding/
│   │       │   ├── (dashboard)/
│   │       │   │   ├── layout.tsx      ← Shell: sidebar, topbar, AI drawer
│   │       │   │   ├── dashboard/      ← /dashboard — command center
│   │       │   │   ├── products/       ← /products — catalog management
│   │       │   │   ├── suppliers/      ← /suppliers — supplier directory
│   │       │   │   ├── analytics/      ← /analytics — store insights
│   │       │   │   ├── ai/             ← /ai — AI employee chat & jobs
│   │       │   │   ├── seo/            ← /seo — SEO health & recommendations
│   │       │   │   ├── pricing/        ← /pricing — pricing optimizer
│   │       │   │   ├── automation/     ← /automation — workflow builder
│   │       │   │   ├── reports/        ← /reports — generated reports
│   │       │   │   ├── notifications/  ← /notifications — alert center
│   │       │   │   └── settings/       ← /settings — store & account config
│   │       │   └── (public)/
│   │       │       └── landing/        ← Marketing landing page
│   │       ├── components/
│   │       │   ├── ui/                 ← Shadcn primitives (owned source)
│   │       │   ├── layout/             ← Shell, Sidebar, Topbar, AIDrawer
│   │       │   ├── ai/                 ← AIChat, AIJobCard, AISuggestion
│   │       │   ├── products/           ← ProductCard, ProductTable, BulkActions
│   │       │   ├── analytics/          ← Charts, KPICard, TrendSparkline
│   │       │   ├── billing/            ← PlanBadge, UsageMeter, UpgradeModal
│   │       │   ├── shopify/            ← ConnectShopifyBanner, SyncStatus
│   │       │   └── shared/             ← EmptyState, SkeletonCard, ErrorBoundary
│   │       ├── hooks/                  ← Custom React hooks (non-API)
│   │       │   ├── use-ai-stream.ts
│   │       │   ├── use-store.ts
│   │       │   └── use-plan-limits.ts
│   │       ├── stores/                 ← Zustand slices (client-only state)
│   │       │   ├── ui-store.ts         ← Sidebar open, drawer open, theme
│   │       │   └── session-store.ts    ← Current store context
│   │       ├── lib/
│   │       │   ├── utils.ts
│   │       │   ├── constants.ts
│   │       │   └── formatters.ts
│   │       ├── types/                  ← Shared frontend-only types
│   │       ├── App.tsx
│   │       ├── index.css
│   │       └── main.tsx
│   │
│   └── api-server/                     ← Express backend
│       └── src/
│           ├── routes/
│           │   ├── index.ts            ← Route registry
│           │   ├── health.ts
│           │   ├── auth.ts             ← /api/auth/*
│           │   ├── stores.ts           ← /api/stores/*
│           │   ├── products.ts         ← /api/products/*
│           │   ├── suppliers.ts        ← /api/suppliers/*
│           │   ├── analytics.ts        ← /api/analytics/*
│           │   ├── ai.ts               ← /api/ai/* (chat + stream)
│           │   ├── jobs.ts             ← /api/jobs/* (status polling)
│           │   ├── seo.ts              ← /api/seo/*
│           │   ├── pricing.ts          ← /api/pricing/*
│           │   ├── automation.ts       ← /api/automation/*
│           │   ├── reports.ts          ← /api/reports/*
│           │   ├── notifications.ts    ← /api/notifications/*
│           │   ├── subscriptions.ts    ← /api/subscriptions/*
│           │   ├── shopify.ts          ← /api/shopify/* (OAuth + webhooks)
│           │   ├── settings.ts         ← /api/settings/*
│           │   └── uploads.ts          ← /api/uploads/* (UploadThing proxy)
│           ├── services/               ← Business logic (no HTTP concerns)
│           │   ├── shopify.service.ts
│           │   ├── ai.service.ts
│           │   ├── pricing.service.ts
│           │   ├── seo.service.ts
│           │   ├── notification.service.ts
│           │   └── stripe.service.ts
│           ├── workers/                ← BullMQ job processors
│           │   ├── ai-job.worker.ts    ← Runs AI jobs from queue
│           │   ├── shopify-sync.worker.ts
│           │   ├── report.worker.ts
│           │   └── automation.worker.ts
│           ├── queues/                 ← BullMQ queue definitions
│           │   ├── ai.queue.ts
│           │   ├── shopify.queue.ts
│           │   └── report.queue.ts
│           ├── middlewares/
│           │   ├── auth.middleware.ts  ← Verify session + inject store
│           │   ├── plan.middleware.ts  ← Enforce plan limits
│           │   └── ratelimit.middleware.ts
│           ├── lib/
│           │   ├── logger.ts
│           │   ├── redis.ts
│           │   └── openai.ts
│           ├── app.ts
│           └── index.ts
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml                ← Single source of truth for all contracts
│   ├── api-client-react/               ← Orval-generated React Query hooks
│   ├── api-zod/                        ← Orval-generated Zod schemas
│   └── db/
│       └── src/
│           └── schema/                 ← Drizzle table definitions (one file per domain)
│               ├── users.ts
│               ├── stores.ts
│               ├── products.ts
│               ├── suppliers.ts
│               ├── subscriptions.ts
│               ├── reports.ts
│               ├── notifications.ts
│               ├── ai-jobs.ts
│               ├── store-analytics.ts
│               ├── settings.ts
│               ├── automation.ts
│               └── logs.ts
│
└── scripts/                            ← Utility scripts (seed, migrate, etc.)
```

**Why this structure?**
- Pages live under `app/` grouped by auth context `(auth)` vs `(dashboard)`. This mirrors
  Next.js App Router conventions, making a future migration trivial.
- `services/` holds pure business logic; `routes/` only parses HTTP. Services are testable
  without spinning up Express.
- `workers/` are separate BullMQ processors — they run in the same Node process but
  are decoupled from the HTTP request/response cycle.

---

## 4. Component Architecture

### Component Layers

```
Page (route)
  └── Layout (shell, sidebar, topbar)
       └── Feature Component (ProductTable, AIChat)
            └── Domain Component (ProductCard, AISuggestionBubble)
                 └── UI Primitive (Button, Card, Badge from Shadcn)
```

### Key Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppShell` | `layout/AppShell.tsx` | Authenticated shell: sidebar + topbar + AI drawer |
| `Sidebar` | `layout/Sidebar.tsx` | Nav links, store switcher, AI indicator |
| `AIDrawer` | `ai/AIDrawer.tsx` | Slide-over chat panel with streaming responses |
| `AISuggestionCard` | `ai/AISuggestionCard.tsx` | Proactive inline AI tip on any page |
| `KPICard` | `analytics/KPICard.tsx` | Metric tile with sparkline + trend delta |
| `ProductTable` | `products/ProductTable.tsx` | Virtualized data table, bulk actions |
| `PlanGate` | `billing/PlanGate.tsx` | Wraps features; shows upgrade prompt if locked |
| `SyncBanner` | `shopify/SyncBanner.tsx` | Real-time sync progress with job status |
| `ErrorBoundary` | `shared/ErrorBoundary.tsx` | Catches render errors, shows recovery UI |
| `EmptyState` | `shared/EmptyState.tsx` | Contextual empty states with AI call-to-action |

### AI Drawer — Core UX Pattern
The AI Drawer is accessible from every page via keyboard shortcut (`⌘K`).
It maintains conversation context per page, allowing the AI employee to give
page-aware advice ("I see you're on the Pricing page. Here's what I'd change…").

```
AIDrawer
  ├── ConversationHistory      ← persisted messages per store
  ├── StreamingMessageBubble   ← useAIStream() hook, SSE connection
  ├── QuickActions             ← suggested prompts per page context
  └── JobStatusFeed            ← live updates of background AI jobs
```

---

## 5. Database Architecture

### Design Principles
- Every table has `id` (UUID), `created_at`, `updated_at`
- Every merchant-scoped table has `store_id` (FK + index) — **no cross-tenant leakage**
- Soft deletes via `deleted_at` on all resource tables
- JSON columns for extensible metadata rather than premature normalization

---

### `users`
Stores the platform account (human who logs in).

```sql
users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,         -- external auth provider ID
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'owner', -- owner | member | viewer
  plan_id       UUID REFERENCES subscriptions(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
)
```

**Why:** `clerk_id` ties us to the auth provider without coupling our schema to it.
`role` is stored here for cross-store admin use; store-level roles live in `stores`.

---

### `stores`
One user can connect multiple Shopify stores (agency use case).

```sql
stores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shopify_domain      TEXT UNIQUE NOT NULL,   -- mystore.myshopify.com
  shopify_access_token TEXT NOT NULL,         -- encrypted at rest
  name                TEXT NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'USD',
  timezone            TEXT NOT NULL DEFAULT 'UTC',
  plan_id             UUID REFERENCES subscriptions(id),
  sync_status         TEXT NOT NULL DEFAULT 'idle', -- idle|syncing|error
  last_synced_at      TIMESTAMPTZ,
  installed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at      TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
)
```

**Why:** `shopify_access_token` encrypted at rest (AES-256). `sync_status` lets the
UI show live sync state without polling a job queue. `uninstalled_at` supports
app uninstall webhook without deleting data.

---

### `products`
Mirrors Shopify products with AICOS-specific enrichment fields.

```sql
products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_product_id  TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  description_ai      TEXT,                   -- AI-generated description
  vendor              TEXT,
  product_type        TEXT,
  tags                TEXT[],
  status              TEXT NOT NULL DEFAULT 'active',
  price               NUMERIC(10,2),
  compare_at_price    NUMERIC(10,2),
  ai_price_suggestion NUMERIC(10,2),          -- from pricing optimizer
  cost_per_item       NUMERIC(10,2),
  inventory_quantity  INTEGER DEFAULT 0,
  images              JSONB DEFAULT '[]',
  seo_title           TEXT,
  seo_description     TEXT,
  seo_score           INTEGER,                -- 0–100 from SEO analyzer
  supplier_id         UUID REFERENCES suppliers(id),
  ai_tags             TEXT[],                 -- AI-suggested tags
  metadata            JSONB DEFAULT '{}',
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, shopify_product_id)
)
```

**Why:** Keeping both `description` (Shopify source) and `description_ai`
(AI-generated) lets merchants compare and choose. `seo_score` is computed
async and cached here — not recalculated on every request.

---

### `suppliers`
Supplier directory that merchants can build over time.

```sql
suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website       TEXT,
  country       TEXT,
  lead_time_days INTEGER,
  moq           INTEGER,                      -- minimum order quantity
  reliability_score NUMERIC(3,2),            -- 0.00–1.00, AI-computed
  notes         TEXT,
  tags          TEXT[],
  metadata      JSONB DEFAULT '{}',
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
)
```

---

### `subscriptions`
Stripe subscription mirror — the billing source of truth.

```sql
subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  store_id              UUID REFERENCES stores(id),
  stripe_customer_id    TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id       TEXT,
  plan_name             TEXT NOT NULL,          -- starter|growth|pro|enterprise
  status                TEXT NOT NULL,          -- active|past_due|canceled|trialing
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ,
  ai_credits_used       INTEGER DEFAULT 0,      -- metered usage
  ai_credits_limit      INTEGER NOT NULL DEFAULT 100,
  features              JSONB DEFAULT '{}',     -- feature flags per plan
  canceled_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
)
```

**Why:** `features` JSONB stores per-plan feature flags. This avoids hard-coded plan
checks in application code — the plan record itself is the source of truth.

---

### `reports`
AI-generated and scheduled reports.

```sql
reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,            -- performance|seo|pricing|trend|custom
  status      TEXT NOT NULL DEFAULT 'pending', -- pending|generating|ready|failed
  content     JSONB,                    -- structured report data
  summary     TEXT,                     -- AI narrative summary
  file_url    TEXT,                     -- PDF/CSV export URL
  scheduled_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ,
  job_id      UUID REFERENCES ai_jobs(id),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
)
```

---

### `notifications`
In-app notification center + webhook delivery tracking.

```sql
notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL,            -- alert|insight|job_complete|billing
  title       TEXT NOT NULL,
  body        TEXT,
  action_url  TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  priority    TEXT NOT NULL DEFAULT 'normal',  -- low|normal|high|critical
  metadata    JSONB DEFAULT '{}',
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
)
```

---

### `ai_jobs`
Queue manifest — every AI background task creates a row here.

```sql
ai_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id),
  type          TEXT NOT NULL,          -- seo_analysis|price_opt|description|trend_scan|chat
  status        TEXT NOT NULL DEFAULT 'queued', -- queued|running|done|failed|cancelled
  priority      INTEGER NOT NULL DEFAULT 5,     -- 1 (highest) – 10 (lowest)
  input         JSONB NOT NULL DEFAULT '{}',
  output        JSONB,
  error_message TEXT,
  model_used    TEXT,                   -- e.g. gpt-4o
  tokens_used   INTEGER DEFAULT 0,
  duration_ms   INTEGER,
  bullmq_job_id TEXT,
  retries       INTEGER DEFAULT 0,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
)
```

**Why:** Decouples job orchestration (BullMQ) from visibility (DB row).
The UI polls `/api/jobs/:id` to show live progress without coupling to Redis internals.
`tokens_used` feeds into subscription metering.

---

### `store_analytics`
Daily aggregated snapshot per store — pre-computed for fast dashboard loads.

```sql
store_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  revenue         NUMERIC(12,2) DEFAULT 0,
  orders_count    INTEGER DEFAULT 0,
  aov             NUMERIC(10,2) DEFAULT 0,    -- average order value
  sessions        INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  top_products    JSONB DEFAULT '[]',          -- [{product_id, revenue, units}]
  ai_insights     JSONB DEFAULT '{}',          -- AI-generated commentary
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, date)
)
```

**Why:** Shopify Analytics API is slow and rate-limited. Pre-aggregating into
daily snapshots (via scheduled job) makes dashboards instant. `ai_insights`
stores the AI narrative generated overnight.

---

### `settings`
Per-store configuration — extensible without schema migrations.

```sql
settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  ai_persona  TEXT NOT NULL DEFAULT 'professional', -- professional|friendly|formal
  ai_language TEXT NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_sync   BOOLEAN DEFAULT true,
  sync_interval_hours INTEGER DEFAULT 6,
  pricing_strategy TEXT DEFAULT 'competitive',     -- competitive|premium|budget
  seo_auto_optimize BOOLEAN DEFAULT false,
  report_schedule TEXT DEFAULT 'weekly',
  integrations JSONB DEFAULT '{}',               -- future integration configs
  preferences  JSONB DEFAULT '{}',               -- misc user preferences
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
)
```

---

### `automation`
Workflow automation rules (if-this-then-that engine).

```sql
automation (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  trigger_type TEXT NOT NULL,                   -- price_drop|stock_low|order_spike|schedule
  trigger_config JSONB NOT NULL DEFAULT '{}',   -- thresholds, cron expression, etc.
  action_type TEXT NOT NULL,                    -- notify|reprice|reorder|ai_analyze|email
  action_config JSONB NOT NULL DEFAULT '{}',
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
)
```

---

### `logs`
Immutable audit trail — append-only.

```sql
logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID REFERENCES stores(id),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,                    -- product.updated | shopify.sync | ai.job.queued
  entity_type TEXT,                             -- product | store | subscription
  entity_id   UUID,
  before      JSONB,                            -- state before change
  after       JSONB,                            -- state after change
  ip_address  INET,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()         -- no updated_at: immutable
)
```

**Why:** Append-only audit log — no UPDATE or DELETE ever runs on this table.
Supports compliance, debugging, and "undo" features in the future.

### Database Indexes

```sql
-- Multi-tenant isolation (most critical)
CREATE INDEX idx_products_store    ON products(store_id);
CREATE INDEX idx_ai_jobs_store     ON ai_jobs(store_id);
CREATE INDEX idx_analytics_store_date ON store_analytics(store_id, date DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_logs_store_action ON logs(store_id, action, created_at DESC);
CREATE INDEX idx_automation_store_active ON automation(store_id, is_active);

-- SEO / full-text search on products
CREATE INDEX idx_products_title_fts ON products USING gin(to_tsvector('english', title));
```

---

## 6. API Architecture

### Contract-First Flow

```
lib/api-spec/openapi.yaml
        ↓  pnpm codegen
lib/api-client-react/   →  React Query hooks (frontend)
lib/api-zod/            →  Zod schemas (backend validation)
```

### Route Namespacing

| Prefix | Domain | Auth |
|--------|--------|------|
| `GET  /api/healthz` | Health | Public |
| `POST /api/auth/callback` | Auth | Public |
| `GET  /api/stores` | Stores | User |
| `GET  /api/stores/:id/products` | Products | User + Plan |
| `GET  /api/stores/:id/analytics` | Analytics | User + Plan |
| `POST /api/ai/chat` | AI Chat | User + Credits |
| `POST /api/ai/jobs` | AI Jobs | User + Credits |
| `GET  /api/jobs/:id` | Job Status | User |
| `POST /api/shopify/install` | Shopify OAuth | Public |
| `POST /api/shopify/webhooks` | Shopify Webhooks | HMAC |
| `GET  /api/subscriptions` | Billing | User |
| `POST /api/stripe/webhook` | Stripe Events | Signature |

### Request Lifecycle

```
Client → Express → auth.middleware → plan.middleware → route handler
                                                          ↓
                                                    Zod validate input
                                                          ↓
                                                    Service layer
                                                          ↓
                                                    Drizzle query
                                                          ↓
                                                    Optional: queue BullMQ job
                                                          ↓
                                                    Return response + log
```

### Streaming (AI Chat)

```
POST /api/ai/chat → Server-Sent Events (SSE)
  - Content-Type: text/event-stream
  - OpenAI stream piped directly to response
  - useAIStream() hook on frontend handles EventSource
```

---

## 7. Authentication Flow

### Provider: Clerk (recommended) or Replit Auth

```
1. User hits /login
2. Clerk hosted UI handles OAuth / email magic link
3. On success → Clerk issues signed JWT
4. Frontend stores JWT in memory (not localStorage)
5. Every API request: Authorization: Bearer <token>
6. auth.middleware:
     a. Verify JWT with Clerk public key
     b. Extract clerk_id
     c. Lookup user in DB (or create on first login)
     d. Attach { user, storeId } to req.context
7. All downstream handlers read req.context — never re-fetch user
```

### Multi-Store Context

```
User selects store → storeId stored in session-store (Zustand)
Every API call includes X-Store-Id header
auth.middleware verifies user owns store before attaching to context
```

### Shopify App OAuth (Separate Flow)

```
Merchant installs app from Shopify App Store
  → /api/shopify/install?shop=mystore.myshopify.com
  → Redirect to Shopify OAuth
  → Shopify redirects back with code
  → /api/shopify/callback
  → Exchange code for permanent access token
  → Encrypt + store in stores.shopify_access_token
  → Trigger initial sync job
  → Redirect merchant to AICOS dashboard
```

---

## 8. Shopify Integration Flow

### Install Flow
```
App Store → /api/shopify/install → Shopify OAuth → /api/shopify/callback
  → Store access token (encrypted AES-256)
  → Register webhooks (products/update, orders/create, app/uninstalled)
  → Queue: ShopifySyncJob (initial full sync)
  → Create store record, settings record, first notification
```

### Webhook Processing
All webhooks verified via HMAC-SHA256 before processing:

| Webhook Topic | Handler | Action |
|---------------|---------|--------|
| `products/create` | products.ts | Upsert product row |
| `products/update` | products.ts | Diff + update, queue AI re-analyze if changed |
| `products/delete` | products.ts | Soft delete |
| `orders/create` | analytics.ts | Increment daily analytics snapshot |
| `orders/updated` | analytics.ts | Recalculate revenue |
| `app/uninstalled` | stores.ts | Set uninstalled_at, cancel subscriptions |
| `shop/update` | stores.ts | Refresh store metadata |

### Sync Strategy
- **Initial sync**: Full product catalog pulled in batches of 250 (Shopify REST limit)
  via BullMQ job; resumable on failure using cursor
- **Ongoing sync**: Webhook-driven — near real-time for updates
- **Fallback sync**: Scheduled hourly job reconciles any missed webhooks

---

## 9. AI Architecture

### The AI Employee Model

The AI operates in two modes:

| Mode | Description | Latency |
|------|-------------|---------|
| **Chat** | Conversational, streaming, page-aware | < 3s first token |
| **Jobs** | Background tasks queued in BullMQ | Seconds → minutes |

### AI Job Types

| Job Type | Trigger | Output |
|----------|---------|--------|
| `seo_analysis` | Manual or scheduled | seo_score + recommendations per product |
| `description_rewrite` | Manual per product | description_ai field updated |
| `price_optimization` | Scheduled or threshold | ai_price_suggestion per product |
| `trend_scan` | Daily scheduled | Trend report, product recommendations |
| `performance_report` | Weekly scheduled | AI narrative in reports table |
| `chat` | User message | Streaming SSE response |
| `bulk_tag` | Bulk action on products | Updated ai_tags array |
| `supplier_score` | On supplier save | reliability_score computed |

### AI Service Architecture

```
ai.service.ts
  ├── buildSystemPrompt(store, page, history)
  │     ← Injects store context: name, plan, top products, current page
  ├── streamChat(messages) → AsyncIterator<string>
  │     ← GPT-4o with streaming
  ├── runJob(jobType, input) → JobOutput
  │     ← Dispatched to BullMQ; returns job ID immediately
  └── getContextForPage(storeId, page) → PageContext
        ← Fetches relevant data to inject into system prompt
```

### Context Injection (What Makes It Feel Like an Employee)

```
System Prompt Template:
  "You are [store.name]'s AI Commerce Employee at AICOS.
   Store: {name}, Currency: {currency}, Plan: {plan}
   Today's stats: Revenue ${revenue}, Orders {orders}, Top product: {title}
   Current page: {page}
   Your job: help this merchant grow revenue and save time.
   Tone: {settings.ai_persona}"
```

### Token Budget Management

- Per-request budget: 4,000 tokens
- Per-job budget: 8,000 tokens
- Monthly limit per plan: Starter 100K / Growth 500K / Pro 2M / Enterprise unlimited
- `ai_jobs.tokens_used` tracks usage; feeds `subscriptions.ai_credits_used`
- Rate limiting via Redis: 10 req/min per store on chat endpoint

---

## 10. Billing Architecture

### Stripe Integration

```
Plans:
  Starter   $29/mo  — 1 store, 100 AI credits, core features
  Growth    $79/mo  — 3 stores, 500 AI credits, SEO + pricing
  Pro       $199/mo — 10 stores, 2,000 AI credits, automation
  Enterprise Custom  — unlimited + dedicated support

Usage-based add-on:
  AI Credits overage: $0.10 per 1,000 tokens beyond plan limit
```

### Billing Flow

```
1. User selects plan → /api/subscriptions/checkout
2. Create Stripe Checkout Session (hosted)
3. Stripe redirects back with session_id
4. /api/stripe/webhook receives customer.subscription.created
5. Upsert subscriptions row; set features JSONB for plan
6. PlanGate components re-render with new permissions

Metering:
  After each AI job → stripe.usage.create() to report tokens
  Stripe generates usage invoice at period end
```

### Feature Gating

```typescript
// Example: PlanGate component
const { features } = useSubscription();
if (!features.automation) return <UpgradeModal feature="Automation" plan="Pro" />;
```

Features object shape (from `subscriptions.features` JSONB):
```json
{
  "stores_limit": 3,
  "ai_credits": 500,
  "seo_analysis": true,
  "pricing_optimizer": true,
  "automation": false,
  "bulk_operations": true,
  "white_label": false,
  "api_access": false
}
```

---

## 11. State Management Strategy

### State Taxonomy

| State Type | Where It Lives | Why |
|------------|---------------|-----|
| Server state | React Query (via Orval hooks) | Caching, invalidation, background refetch |
| Client/UI state | Zustand (`ui-store.ts`) | Sidebar open, modal state, theme — not in URL |
| Session/context | Zustand (`session-store.ts`) | Current store selection |
| URL state | Wouter search params | Filters, pagination, sort — bookmarkable |
| Form state | React Hook Form | Isolated per form; not global |
| Stream state | `useAIStream()` custom hook | SSE lifecycle, token accumulation |

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 1 minute — most data can be slightly stale
      gcTime: 5 * 60_000,         // 5 minutes garbage collection
      retry: 2,
      refetchOnWindowFocus: false, // merchants don't want sudden refreshes
    },
  },
});
```

### Store Switcher Pattern

```typescript
// session-store.ts
interface SessionStore {
  activeStoreId: string | null;
  setActiveStore: (id: string) => void;
}
// Every React Query key includes storeId:
// ['products', { storeId }] — ensures cache isolation between stores
```

---

## 12. Security Strategy

### Defense in Depth

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS only; HSTS header |
| Authentication | JWT (Clerk); short-lived (15 min); refresh tokens via Clerk |
| Authorization | Row-level: every DB query scoped to `store_id` from `req.context` |
| Input validation | Zod schemas on every API input; reject unknown fields |
| Shopify tokens | Encrypted at rest (AES-256-GCM); key from environment secret |
| Webhook verification | HMAC-SHA256 for all Shopify webhooks; signature for Stripe |
| Rate limiting | Redis-backed: 100 req/min global, 10 req/min AI chat |
| SQL injection | Drizzle parameterized queries — never raw string interpolation |
| XSS | React escapes by default; CSP header blocks inline scripts |
| CSRF | Not applicable (API + JWT bearer — no cookies for auth) |
| Secrets | All secrets in environment variables; never in code |
| Audit trail | Every write to `logs` table with before/after state |

### Sensitive Data Handling

```
shopify_access_token:
  - Encrypted before INSERT using AES-256-GCM
  - Decrypted only in shopify.service.ts
  - Never returned in API responses
  - Key: SHOPIFY_TOKEN_ENCRYPTION_KEY (env secret)
```

### OWASP Top 10 Coverage

| Threat | Mitigation |
|--------|-----------|
| Broken Access Control | store_id scope + auth middleware on every route |
| Cryptographic Failures | AES-256 for tokens; bcrypt never used (Clerk handles passwords) |
| Injection | Drizzle prepared statements; Zod input validation |
| Security Misconfiguration | Environment secrets; no default credentials |
| Vulnerable Components | pnpm audit in CI; Dependabot alerts |
| Auth Failures | Clerk manages auth; short-lived JWTs |
| Logging Failures | Immutable `logs` table; Pino structured logs |

---

## 13. Deployment Strategy

### Environment Tiers

| Tier | Purpose | DB | AI Model |
|------|---------|-----|----------|
| Development | Local dev | Dev PostgreSQL | GPT-4o |
| Staging | QA + integration test | Isolated PostgreSQL | GPT-4o |
| Production | Live | Production PostgreSQL + read replicas | GPT-4o |

### Replit Deployment

- **Frontend**: Static build (`pnpm build`), served via Replit's CDN
- **Backend**: Node.js Express, deployed via Replit's `run` command
- **Database**: Replit-managed PostgreSQL with publish-time migration flow
- **Environment secrets**: Managed via Replit Secrets (never in code)

### Environment Variables Required

```bash
# Auth
CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY

# Database
DATABASE_URL

# Redis
REDIS_URL

# Shopify
SHOPIFY_API_KEY
SHOPIFY_API_SECRET
SHOPIFY_TOKEN_ENCRYPTION_KEY

# OpenAI
OPENAI_API_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_STARTER
STRIPE_PRICE_ID_GROWTH
STRIPE_PRICE_ID_PRO

# UploadThing
UPLOADTHING_SECRET
UPLOADTHING_APP_ID

# App
APP_URL
SESSION_SECRET
NODE_ENV
```

### Scalability Path

```
Phase 1 (now):       Single Node.js process; BullMQ workers in-process
Phase 2 (>1k stores): Separate worker processes; Redis Cluster
Phase 3 (>10k stores): Horizontal API scaling; read replicas; edge caching
```

### CI / Deployment Pipeline

```
PR → typecheck → lint → test → build
Merge → staging deploy → smoke test → production deploy
Production deploy triggers Replit publish-time DB migration
```

---

## Summary: Why These Decisions?

| Decision | Rationale |
|----------|-----------|
| OpenAPI-first | Single source of truth eliminates drift between server and client types |
| Drizzle over Prisma | Lighter, SQL-closer, better Zod integration, faster cold start |
| BullMQ for AI jobs | AI calls (5–30s) must never block HTTP request lifecycle |
| JSONB for features | Plan features evolve frequently — JSONB avoids schema migrations |
| SSE for AI streaming | Simpler than WebSockets for unidirectional streaming; works through proxies |
| Multi-tenant via store_id | Every query includes store_id; impossible to leak cross-tenant data |
| Immutable logs table | Compliance, debugging, undo — append-only guarantees |
| Zustand for client state | Tiny bundle; no boilerplate; works outside React tree |
| React Query for server state | Deduplication, background refresh, optimistic updates — all built-in |
| Clerk for auth | Shopify OAuth AND standard user auth in one provider; no auth code to maintain |
