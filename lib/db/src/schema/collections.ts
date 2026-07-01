import { pgTable, text, uuid, boolean, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionTypeEnum = pgEnum("collection_type", ["manual", "smart"]);

export const collectionsTable = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyCollectionId: text("shopify_collection_id").notNull(),
  title: text("title").notNull(),
  handle: text("handle"),
  bodyHtml: text("body_html"),
  type: collectionTypeEnum("type").notNull().default("manual"),
  imageSrc: text("image_src"),
  imageAlt: text("image_alt"),
  published: boolean("published").notNull().default(true),
  sortOrder: text("sort_order").default("best-selling"),
  disjunctive: boolean("disjunctive").default(false),
  rules: jsonb("rules").$type<SmartCollectionRule[]>().default([]),
  productCount: text("product_count"),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  shopifyUpdatedAt: timestamp("shopify_updated_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("collections_store_id_idx").on(t.storeId),
  index("collections_shopify_id_idx").on(t.shopifyCollectionId),
]);

export type SmartCollectionRule = { column: string; relation: string; condition: string };

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;
