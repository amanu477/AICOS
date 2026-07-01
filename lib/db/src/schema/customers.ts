import { pgTable, text, uuid, integer, boolean, numeric, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  shopifyCustomerId: text("shopify_customer_id").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  ordersCount: integer("orders_count").default(0),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).default("0"),
  state: text("state").default("enabled"),
  tags: text("tags").array().default([]),
  note: text("note"),
  verifiedEmail: boolean("verified_email").default(false),
  taxExempt: boolean("tax_exempt").default(false),
  acceptsMarketing: boolean("accepts_marketing").default(false),
  acceptsMarketingUpdatedAt: timestamp("accepts_marketing_updated_at", { withTimezone: true }),
  currency: text("currency"),
  addresses: jsonb("addresses").$type<CustomerAddress[]>().default([]),
  defaultAddress: jsonb("default_address").$type<CustomerAddress | null>(),
  shopifyCreatedAt: timestamp("shopify_created_at", { withTimezone: true }),
  shopifyUpdatedAt: timestamp("shopify_updated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("customers_store_id_idx").on(t.storeId),
  index("customers_shopify_id_idx").on(t.shopifyCustomerId),
  index("customers_email_idx").on(t.storeId, t.email),
]);

export type CustomerAddress = {
  id: string; firstName?: string; lastName?: string; company?: string;
  address1?: string; address2?: string; city?: string; province?: string;
  country?: string; zip?: string; phone?: string; countryCode?: string; default: boolean;
};

export const insertCustomerSchema = createInsertSchema(customersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
