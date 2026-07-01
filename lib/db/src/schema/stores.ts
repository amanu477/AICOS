import { pgTable, text, uuid, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const syncStatusEnum = pgEnum("sync_status", ["idle", "syncing", "error", "partial"]);

export const storesTable = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  shopifyDomain: text("shopify_domain").notNull().unique(),
  shopifyShopId: text("shopify_shop_id"),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("UTC"),
  planName: text("plan_name"),
  countryCode: text("country_code"),
  province: text("province"),
  address1: text("address1"),
  phone: text("phone"),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  installedAt: timestamp("installed_at", { withTimezone: true }).notNull().defaultNow(),
  uninstalledAt: timestamp("uninstalled_at", { withTimezone: true }),
  syncStatus: syncStatusEnum("sync_status").notNull().default("idle"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  webhooksRegistered: boolean("webhooks_registered").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStoreSchema = createInsertSchema(storesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof storesTable.$inferSelect;
