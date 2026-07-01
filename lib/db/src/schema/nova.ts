import { pgTable, text, uuid, timestamp, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const novaConversationTypeEnum = pgEnum("nova_conversation_type", [
  "chat",
  "daily_briefing",
  "weekly_report",
  "monthly_report",
]);

export const novaConversationsTable = pgTable("nova_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("New conversation"),
  type: novaConversationTypeEnum("type").notNull().default("chat"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const novaMessagesTable = pgTable("nova_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => novaConversationsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant" | "system"
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const novaMemoryTable = pgTable("nova_memory", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  preferredNiche: text("preferred_niche"),
  preferredSuppliers: jsonb("preferred_suppliers").$type<string[]>().default([]),
  preferredCountries: jsonb("preferred_countries").$type<string[]>().default([]),
  brandVoice: text("brand_voice"),
  pricingStrategy: text("pricing_strategy"),
  profitGoalMonthly: integer("profit_goal_monthly"),
  storeContext: text("store_context"),
  extraContext: jsonb("extra_context").$type<Record<string, unknown>>().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNovaConversationSchema = createInsertSchema(novaConversationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNovaMessageSchema = createInsertSchema(novaMessagesTable).omit({ id: true, createdAt: true });
export const insertNovaMemorySchema = createInsertSchema(novaMemoryTable).omit({ id: true, updatedAt: true });

export type NovaConversation = typeof novaConversationsTable.$inferSelect;
export type NovaMessage = typeof novaMessagesTable.$inferSelect;
export type NovaMemory = typeof novaMemoryTable.$inferSelect;
export type InsertNovaConversation = z.infer<typeof insertNovaConversationSchema>;
export type InsertNovaMessage = z.infer<typeof insertNovaMessageSchema>;
export type InsertNovaMemory = z.infer<typeof insertNovaMemorySchema>;
