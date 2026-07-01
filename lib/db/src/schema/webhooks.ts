import { pgTable, text, uuid, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const webhooksTable = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyWebhookId: text("shopify_webhook_id"),
  topic: text("topic").notNull(),
  address: text("address").notNull(),
  format: text("format").default("json"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("webhooks_store_id_idx").on(t.storeId),
]);

export const webhookEventsTable = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  topic: text("topic").notNull(),
  shopifyWebhookId: text("shopify_webhook_id"),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  processed: boolean("processed").default(false),
  error: text("error"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("webhook_events_store_topic_idx").on(t.storeId, t.topic),
  index("webhook_events_processed_idx").on(t.processed),
]);

export const insertWebhookSchema = createInsertSchema(webhooksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooksTable.$inferSelect;

export const insertWebhookEventSchema = createInsertSchema(webhookEventsTable).omit({ id: true, receivedAt: true });
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEventsTable.$inferSelect;
