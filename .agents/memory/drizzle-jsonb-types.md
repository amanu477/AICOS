---
name: Drizzle JSONB type mismatch
description: drizzle-zod generates broad Json type for jsonb columns; using InsertX annotations breaks when column has specific typed object.
---

## The Problem
When a Drizzle column is defined as `jsonb("x").$type<MyType>()`, the `createInsertSchema` from drizzle-zod generates `Json` (string|number|boolean|null|object|array) for that field in the inferred InsertX type. This `Json` union is incompatible with the actual Drizzle insert types which expect `MyType | null | undefined`.

## The Fix
Do NOT use explicit `const values: InsertX = {...}` type annotations when the object contains JSONB columns with specific typed objects (like CustomerAddress, OrderAddress). Instead, let TypeScript infer the type from the object literal directly.

**Bad:**
```ts
const values: InsertCustomer = { defaultAddress: c.default_address }; // Type error: Json not assignable to CustomerAddress
await db.insert(customersTable).values(values)
```

**Good:**
```ts
const values = { defaultAddress: c.default_address }; // Inferred correctly
await db.insert(customersTable).values(values)
```

**Why:** drizzle-zod@0.8.x broadens jsonb column types to Json for schema validation purposes, but the actual Drizzle table column type is narrower. The two diverge when both are used simultaneously.
