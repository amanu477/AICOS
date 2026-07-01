import { pgTable, text, uuid, integer, numeric, boolean, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export interface AiOptimization {
  seoTitle: string;
  seoDescription: string;
  productDescription: string;
  bulletPoints: string[];
  metaDescription: string;
  altText: string;
  collectionSuggestions: string[];
  tagSuggestions: string[];
  pricingSuggestion: { suggestedPrice: string; reasoning: string };
  discountSuggestion: { percentage: number; occasion: string; reasoning: string };
  bundleSuggestions: { name: string; rationale: string }[];
  crossSellSuggestions: string[];
  upsellSuggestions: string[];
  brandTone: string;
  generatedAt: string;
}

export const productStatusEnum = pgEnum("product_status", ["active", "archived", "draft"]);

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyProductId: text("shopify_product_id").notNull(),
  title: text("title").notNull(),
  bodyHtml: text("body_html"),
  vendor: text("vendor"),
  productType: text("product_type"),
  handle: text("handle"),
  status: productStatusEnum("status").notNull().default("active"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  tags: text("tags").array().default([]),
  aiTags: text("ai_tags").array().default([]),
  templateSuffix: text("template_suffix"),
  images: jsonb("images").$type<ShopifyImage[]>().default([]),
  options: jsonb("options").$type<ShopifyOption[]>().default([]),
  price: numeric("price", { precision: 10, scale: 2 }),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  costPerItem: numeric("cost_per_item", { precision: 10, scale: 2 }),
  aiPriceSuggestion: numeric("ai_price_suggestion", { precision: 10, scale: 2 }),
  totalInventory: integer("total_inventory").default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoScore: integer("seo_score"),
  descriptionAi: text("description_ai"),
  aiOptimization: jsonb("ai_optimization").$type<AiOptimization | null>().default(null),
  aiOptimizationStatus: text("ai_optimization_status").$type<"pending" | "generating" | "done" | "failed">().default("pending"),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  shopifyUpdatedAt: timestamp("shopify_updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("products_store_id_idx").on(t.storeId),
  index("products_shopify_id_idx").on(t.shopifyProductId),
  index("products_status_idx").on(t.storeId, t.status),
]);

export type ShopifyImage = { id: string; src: string; alt: string | null; position: number; width?: number; height?: number };
export type ShopifyOption = { id: string; name: string; position: number; values: string[] };

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
