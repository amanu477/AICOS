import { pgTable, text, uuid, integer, numeric, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const variantsTable = pgTable("variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  productId: uuid("product_id").notNull(),
  shopifyVariantId: text("shopify_variant_id").notNull(),
  shopifyProductId: text("shopify_product_id").notNull(),
  title: text("title").notNull(),
  sku: text("sku"),
  barcode: text("barcode"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  inventoryQuantity: integer("inventory_quantity").default(0),
  inventoryPolicy: text("inventory_policy").default("deny"),
  inventoryManagement: text("inventory_management"),
  inventoryItemId: text("inventory_item_id"),
  fulfillmentService: text("fulfillment_service").default("manual"),
  requiresShipping: boolean("requires_shipping").default(true),
  taxable: boolean("taxable").default(true),
  taxCode: text("tax_code"),
  grams: integer("grams"),
  weight: numeric("weight", { precision: 8, scale: 2 }),
  weightUnit: text("weight_unit").default("kg"),
  option1: text("option1"),
  option2: text("option2"),
  option3: text("option3"),
  imageId: text("image_id"),
  imageSrc: text("image_src"),
  position: integer("position").default(1),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  shopifyUpdatedAt: timestamp("shopify_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("variants_store_id_idx").on(t.storeId),
  index("variants_product_id_idx").on(t.productId),
  index("variants_shopify_id_idx").on(t.shopifyVariantId),
]);

export const insertVariantSchema = createInsertSchema(variantsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type Variant = typeof variantsTable.$inferSelect;
