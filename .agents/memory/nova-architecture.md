---
name: Nova AI Architecture
description: Architecture decisions for Nova — the AI Commerce Manager feature in AICOS.
---

# Nova AI Architecture

## LLM Provider
- **Groq** via `groq-sdk` (not OpenAI). Model: `llama-3.3-70b-versatile`.
- Groq is OpenAI-compatible. Use `groq-sdk` directly (not the OpenAI SDK with baseURL override).
- Secret: `GROQ_API_KEY` (already set in Replit Secrets).
- Client: `artifacts/api-server/src/lib/groq.ts`

**Why:** User explicitly chose Groq over OpenAI for free tier / speed. Do not switch to OpenAI without re-confirming.

## DB Schema
- `lib/db/src/schema/nova.ts` — three tables:
  - `nova_conversations` (id, userId, title, type enum, timestamps)
  - `nova_messages` (id, conversationId FK, role, content, metadata, createdAt)
  - `nova_memory` (id, userId UNIQUE, niche, suppliers[], countries[], brandVoice, pricingStrategy, profitGoalMonthly, storeContext)
- Exported from `lib/db/src/schema/index.ts`
- Schema was pushed to DB via `pnpm --filter @workspace/db run push`

## API Routes
- Mounted at `/api/nova/*` via `artifacts/api-server/src/routes/nova.ts`
- All routes require Clerk auth (userId extracted via `getAuth(req)`)
- Streaming uses SSE (`text/event-stream`), sends `data: JSON\n\n` chunks with `{content}`, `{done}`, `{error}`, or `{conversationId}` fields
- `/nova/generate-briefing` creates a new conversation + streams the report in one call

## Frontend
- Route: `/nova` in `artifacts/aicos/src/App.tsx`
- Page: `artifacts/aicos/src/pages/nova.tsx`
- Components: `artifacts/aicos/src/components/nova/` (chat, sidebar, memory-panel, markdown)
- API client: `artifacts/aicos/src/lib/nova-api.ts` (fetch + async generator SSE parsing)
- `react-markdown` installed in `@workspace/aicos` for rendering Nova's responses

## How to apply
- Adding new Nova features: add routes to `artifacts/api-server/src/routes/nova.ts`, add UI to `artifacts/aicos/src/components/nova/`
- System prompt is in `artifacts/api-server/src/lib/nova-system-prompt.ts` — edit to change Nova's personality or capabilities
- Backend uses esbuild (not tsc) for builds — TS7030/TS7006 warnings don't block; the build still compiles fine
