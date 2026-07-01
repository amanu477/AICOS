import { pgTable, text, uuid, integer, numeric, boolean, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderFinancialStatusEnum = pgEnum("order_financial_status", [
  "pending", "authorized", "partially_paid", "paid", "partially_refunded", "refunded", "voided"
]);
export const orderFulfillmentStatusEnum = pgEnum("order_fulfillment_status", [
  "unfulfilled", "partial", "fulfilled", "restocked"
]);

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyOrderId: text("shopify_order_id").notNull(),
  orderNumber: integer("order_number"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  shopifyCustomerId: text("shopify_customer_id"),
  financialStatus: orderFinancialStatusEnum("financial_status").default("pending"),
  fulfillmentStatus: orderFulfillmentStatusEnum("fulfillment_status").default("unfulfilled"),
  currency: text("currency"),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }),
  subtotalPrice: numeric("subtotal_price", { precision: 12, scale: 2 }),
  totalTax: numeric("total_tax", { precision: 10, scale: 2 }),
  totalDiscounts: numeric("total_discounts", { precision: 10, scale: 2 }),
  totalShipping: numeric("total_shipping", { precision: 10, scale: 2 }),
  lineItems: jsonb("line_items").$type<OrderLineItem[]>().default([]),
  shippingAddress: jsonb("shipping_address").$type<OrderAddress | null>(),
  billingAddress: jsonb("billing_address").$type<OrderAddress | null>(),
  discountCodes: jsonb("discount_codes").$type<DiscountCode[]>().default([]),
  tags: text("tags").array().default([]),
  note: text("note"),
  test: boolean("test").default(false),
  confirmed: boolean("confirmed").default(true),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  shopifyUpdatedAt: timestamp("shopify_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("orders_store_id_idx").on(t.storeId),
  index("orders_shopify_id_idx").on(t.shopifyOrderId),
  index("orders_financial_status_idx").on(t.storeId, t.financialStatus),
  index("orders_processed_at_idx").on(t.storeId, t.processedAt),
]);

export type OrderLineItem = {
  id: string; variantId?: string; productId?: string; title: string; variantTitle?: string;
  sku?: string; quantity: number; price: string; totalDiscount: string;
  fulfillmentStatus?: string; requiresShipping: boolean; taxable: boolean;
};
export type OrderAddress = {
  firstName?: string; lastName?: string; company?: string; address1?: string;
  address2?: string; city?: string; province?: string; country?: string;
  zip?: string; phone?: string; countryCode?: string;
};
export type DiscountCode = { code: string; amount: string; type: string };

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
