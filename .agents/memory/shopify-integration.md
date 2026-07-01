---
name: Shopify Integration Architecture
description: How Phase 4 Shopify integration is structured — OAuth flow, token storage, sync, webhooks, background jobs.
---

## OAuth Flow
- `GET /api/shopify/install?shop=xxx.myshopify.com` — sets nonce cookie, redirects to Shopify
- `GET /api/shopify/callback` — verifies HMAC, exchanges code for token, upserts store, fires registerWebhooks + full sync in background
- Access tokens encrypted with AES-256-GCM (lib/encryption.ts) before storing in DB

## Required Env Vars
- `SHOPIFY_API_KEY` — Shopify Partner app API key
- `SHOPIFY_API_SECRET` — Shopify Partner app secret
- `SHOPIFY_TOKEN_ENCRYPTION_KEY` — 64 hex chars (32 bytes); generate with `crypto.randomBytes(32).toString('hex')`
- `APP_URL` — public URL of the app (for OAuth redirect URI and webhook base URL)
- `REDIS_URL` (optional) — if absent, BullMQ sync runs inline synchronously; graceful fallback warns in log

## Services
- `artifacts/api-server/src/services/shopify.service.ts` — OAuth, token exchange, webhook registration, store CRUD
- `artifacts/api-server/src/services/sync.service.ts` — full sync orchestration, per-entity sync fns (products, variants, collections, customers, orders)
- `artifacts/api-server/src/queues/shopify.queue.ts` — BullMQ queue + worker, graceful no-Redis fallback

## API Routes (all under /api)
- `/shopify/install` `/shopify/callback` `/shopify/webhooks` `/shopify/status/:storeId` `/shopify/sync/:storeId` `/shopify/stores`
- `/stores/:storeId/products` (list, get, patch, delete, bulk-update, publish, unpublish)
- `/stores/:storeId/collections` (list, get)

## Webhook Topics Registered
products/create|update|delete, orders/create|updated|cancelled, customers/create|update, inventory_levels/update, collections/create|update, app/uninstalled, shop/update

## Frontend Components
- `artifacts/aicos/src/components/shopify/SyncStatus.tsx` — auto-polling sync progress card
- `artifacts/aicos/src/components/shopify/ConnectionBadge.tsx` — connected/syncing/error pill
- `artifacts/aicos/src/pages/connect-shopify.tsx` — real OAuth redirect, handles ?shopify_connected and ?shopify_error query params

**Why:** AES-256-GCM chosen for authenticated encryption (tamper-evident). Sync runs inline when Redis absent so dev works without infrastructure.
