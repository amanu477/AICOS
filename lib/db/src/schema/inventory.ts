import { pgTable, text, uuid, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyInventoryItemId: text("shopify_inventory_item_id").notNull(),
  shopifyVariantId: text("shopify_variant_id"),
  sku: text("sku"),
  tracked: boolean("tracked").default(true),
  requiresShipping: boolean("requires_shipping").default(true),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  shopifyUpdatedAt: timestamp("shopify_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("inventory_items_store_idx").on(t.storeId),
  index("inventory_items_shopify_idx").on(t.shopifyInventoryItemId),
]);

export const inventoryLevelsTable = pgTable("inventory_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyInventoryItemId: text("shopify_inventory_item_id").notNull(),
  shopifyLocationId: text("shopify_location_id").notNull(),
  locationName: text("location_name"),
  available: integer("available").default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("inventory_levels_store_idx").on(t.storeId),
  index("inventory_levels_item_idx").on(t.shopifyInventoryItemId),
]);

export const insertInventoryItemSchema = createInsertSchema(inventoryItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;

export const insertInventoryLevelSchema = createInsertSchema(inventoryLevelsTable).omit({ id: true, updatedAt: true });
export type InsertInventoryLevel = z.infer<typeof insertInventoryLevelSchema>;
export type InventoryLevel = typeof inventoryLevelsTable.$inferSelect;
