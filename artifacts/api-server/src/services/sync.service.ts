import { db } from "@workspace/db";
import {
  storesTable, syncJobsTable, productsTable, variantsTable,
  collectionsTable, customersTable, ordersTable,
  inventoryItemsTable, inventoryLevelsTable, logsTable,
  type InsertProduct, type InsertVariant, type InsertCollection,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { shopifyRequestWithToken } from "../lib/shopify-api.js";
import { logger } from "../lib/logger.js";
import { decrypt } from "../lib/encryption.js";
import { generateProductOptimization } from "./product-ai.service.js";

const PAGE_SIZE = 250;

export async function startFullSync(storeId: string): Promise<string> {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
  if (!store) throw new Error(`Store ${storeId} not found`);

  await db.update(storesTable).set({ syncStatus: "syncing" }).where(eq(storesTable.id, storeId));

  const [job] = await db.insert(syncJobsTable).values({
    storeId,
    type: "full_sync",
    status: "queued",
  }).returning();

  logger.info({ storeId, jobId: job.id }, "Full sync job created");
  return job.id;
}

export async function runFullSync(storeId: string, jobId: string): Promise<void> {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
  if (!store) throw new Error(`Store ${storeId} not found`);

  await db.update(syncJobsTable).set({ status: "running", startedAt: new Date() }).where(eq(syncJobsTable.id, jobId));

  const accessToken = decrypt(store.accessTokenEncrypted);
  const shop = store.shopifyDomain;
  let errorCount = 0;

  try {
    await syncProducts(storeId, shop, accessToken, jobId);
    await syncCollections(storeId, shop, accessToken, jobId);
    await syncCustomers(storeId, shop, accessToken, jobId);
    await syncOrders(storeId, shop, accessToken, jobId);

    await db.update(syncJobsTable).set({
      status: "done", completedAt: new Date(),
    }).where(eq(syncJobsTable.id, jobId));

    await db.update(storesTable).set({
      syncStatus: "idle", lastSyncedAt: new Date(),
    }).where(eq(storesTable.id, storeId));

    logger.info({ storeId, jobId }, "Full sync completed");
  } catch (err) {
    errorCount++;
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ storeId, jobId, err: message }, "Full sync failed");

    await db.update(syncJobsTable).set({
      status: "failed", completedAt: new Date(), errorMessage: message, errorCount,
    }).where(eq(syncJobsTable.id, jobId));

    await db.update(storesTable).set({ syncStatus: "error" }).where(eq(storesTable.id, storeId));
    throw err;
  }
}

export async function syncProducts(storeId: string, shop: string, accessToken: string, jobId?: string): Promise<number> {
  let cursor: string | undefined;
  let total = 0;

  do {
    const params: Record<string, string | number | boolean> = { limit: PAGE_SIZE, fields: "id,title,body_html,vendor,product_type,handle,status,published_at,tags,images,options,variants,created_at,updated_at,template_suffix" };
    if (cursor) params.page_info = cursor;

    const response = await shopifyRequestWithToken<{ products: ShopifyProduct[] }>(
      shop, accessToken, "products.json", { query: params }
    );

    for (const p of response.products) {
      await upsertProduct(storeId, p);

      for (const v of p.variants) {
        await upsertVariant(storeId, String(p.id), v);
      }

      total += 1;
    }

    if (jobId) {
      await db.update(syncJobsTable).set({ processedRecords: total }).where(eq(syncJobsTable.id, jobId));
    }

    cursor = response.products.length === PAGE_SIZE ? String(response.products.at(-1)?.id) : undefined;
  } while (cursor);

  logger.info({ storeId, total }, "Products synced");
  return total;
}

export async function syncCollections(storeId: string, shop: string, accessToken: string, jobId?: string): Promise<number> {
  let total = 0;

  const [customCols, smartCols] = await Promise.all([
    shopifyRequestWithToken<{ custom_collections: ShopifyCollection[] }>(shop, accessToken, "custom_collections.json", { query: { limit: PAGE_SIZE } }),
    shopifyRequestWithToken<{ smart_collections: ShopifyCollection[] }>(shop, accessToken, "smart_collections.json", { query: { limit: PAGE_SIZE } }),
  ]);

  for (const c of [...customCols.custom_collections, ...smartCols.smart_collections]) {
    await upsertCollection(storeId, c);
    total++;
  }

  logger.info({ storeId, total }, "Collections synced");
  return total;
}

export async function syncCustomers(storeId: string, shop: string, accessToken: string, jobId?: string): Promise<number> {
  let total = 0;
  let sinceId: string | undefined;

  do {
    const params: Record<string, string | number | boolean> = { limit: PAGE_SIZE };
    if (sinceId) params.since_id = sinceId;

    const response = await shopifyRequestWithToken<{ customers: ShopifyCustomer[] }>(
      shop, accessToken, "customers.json", { query: params }
    );

    for (const c of response.customers) {
      await upsertCustomer(storeId, c);
      total++;
      sinceId = String(c.id);
    }

    if (response.customers.length < PAGE_SIZE) break;
  } while (true);

  logger.info({ storeId, total }, "Customers synced");
  return total;
}

export async function syncOrders(storeId: string, shop: string, accessToken: string, jobId?: string): Promise<number> {
  let total = 0;
  let sinceId: string | undefined;

  do {
    const params: Record<string, string | number | boolean> = { limit: PAGE_SIZE, status: "any" };
    if (sinceId) params.since_id = sinceId;

    const response = await shopifyRequestWithToken<{ orders: ShopifyOrder[] }>(
      shop, accessToken, "orders.json", { query: params }
    );

    for (const o of response.orders) {
      await upsertOrder(storeId, o);
      total++;
      sinceId = String(o.id);
    }

    if (response.orders.length < PAGE_SIZE) break;
  } while (true);

  logger.info({ storeId, total }, "Orders synced");
  return total;
}

async function upsertProduct(storeId: string, p: ShopifyProduct): Promise<void> {
  const priceFromVariants = p.variants?.[0]?.price;
  const compareAtFromVariants = p.variants?.[0]?.compare_at_price;

  const values: InsertProduct = {
    storeId,
    shopifyProductId: String(p.id),
    title: p.title,
    bodyHtml: p.body_html,
    vendor: p.vendor,
    productType: p.product_type,
    handle: p.handle,
    status: (p.status as "active" | "archived" | "draft") ?? "active",
    publishedAt: p.published_at ? new Date(p.published_at) : null,
    tags: p.tags ? p.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    images: p.images?.map(img => ({ id: String(img.id), src: img.src, alt: img.alt ?? null, position: img.position, width: img.width, height: img.height })) ?? [],
    options: p.options?.map(opt => ({ id: String(opt.id), name: opt.name, position: opt.position, values: opt.values })) ?? [],
    price: priceFromVariants ?? null,
    compareAtPrice: compareAtFromVariants ?? null,
    seoTitle: p.metafields_global_title_tag ?? null,
    seoDescription: p.metafields_global_description_tag ?? null,
    shopifyCreatedAt: p.created_at ? new Date(p.created_at) : null,
    shopifyUpdatedAt: p.updated_at ? new Date(p.updated_at) : null,
  };

  const [upserted] = await db.insert(productsTable).values(values).onConflictDoUpdate({
    target: [productsTable.storeId, productsTable.shopifyProductId],
    set: { ...values, updatedAt: new Date() },
  }).returning({ id: productsTable.id, aiOptimizationStatus: productsTable.aiOptimizationStatus });

  if (upserted && upserted.aiOptimizationStatus === "pending") {
    generateProductOptimization(upserted.id).catch(err => {
      logger.warn({ productId: upserted.id, err }, "AI optimization skipped during sync");
    });
  }
}

async function upsertVariant(storeId: string, shopifyProductId: string, v: ShopifyVariant): Promise<void> {
  const [product] = await db.select({ id: productsTable.id }).from(productsTable)
    .where(and(eq(productsTable.storeId, storeId), eq(productsTable.shopifyProductId, shopifyProductId)));

  if (!product) return;

  const values: InsertVariant = {
    storeId,
    productId: product.id,
    shopifyVariantId: String(v.id),
    shopifyProductId,
    title: v.title,
    sku: v.sku,
    barcode: v.barcode,
    price: v.price,
    compareAtPrice: v.compare_at_price,
    inventoryQuantity: v.inventory_quantity ?? 0,
    inventoryPolicy: v.inventory_policy ?? "deny",
    inventoryManagement: v.inventory_management,
    inventoryItemId: v.inventory_item_id ? String(v.inventory_item_id) : null,
    requiresShipping: v.requires_shipping ?? true,
    taxable: v.taxable ?? true,
    grams: v.grams,
    weight: v.weight ? String(v.weight) : null,
    weightUnit: v.weight_unit,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    imageSrc: v.image_id ? String(v.image_id) : null,
    position: v.position ?? 1,
    shopifyCreatedAt: v.created_at ? new Date(v.created_at) : null,
    shopifyUpdatedAt: v.updated_at ? new Date(v.updated_at) : null,
  };

  await db.insert(variantsTable).values(values).onConflictDoUpdate({
    target: [variantsTable.storeId, variantsTable.shopifyVariantId],
    set: { ...values, updatedAt: new Date() },
  });
}

async function upsertCollection(storeId: string, c: ShopifyCollection): Promise<void> {
  const isCustom = "sort_order" in c && !("rules" in c);
  const values: InsertCollection = {
    storeId,
    shopifyCollectionId: String(c.id),
    title: c.title,
    handle: c.handle,
    bodyHtml: c.body_html,
    type: "rules" in c && c.rules?.length ? "smart" : "manual",
    imageSrc: c.image?.src ?? null,
    imageAlt: c.image?.alt ?? null,
    published: c.published ?? true,
    sortOrder: c.sort_order ?? "best-selling",
    rules: ("rules" in c ? c.rules : []) ?? [],
    shopifyCreatedAt: c.created_at ? new Date(c.created_at) : null,
    shopifyUpdatedAt: c.updated_at ? new Date(c.updated_at) : null,
    publishedAt: c.published_at ? new Date(c.published_at) : null,
  };

  await db.insert(collectionsTable).values(values).onConflictDoUpdate({
    target: [collectionsTable.storeId, collectionsTable.shopifyCollectionId],
    set: { ...values, updatedAt: new Date() },
  });
}

async function upsertCustomer(storeId: string, c: ShopifyCustomer): Promise<void> {
  const values = {
    storeId,
    shopifyCustomerId: String(c.id),
    email: c.email,
    firstName: c.first_name,
    lastName: c.last_name,
    phone: c.phone,
    ordersCount: c.orders_count ?? 0,
    totalSpent: c.total_spent ?? "0",
    state: c.state ?? "enabled",
    tags: c.tags ? c.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    note: c.note,
    verifiedEmail: c.verified_email ?? false,
    taxExempt: c.tax_exempt ?? false,
    acceptsMarketing: c.accepts_marketing ?? false,
    currency: c.currency,
    addresses: c.addresses ?? [],
    defaultAddress: c.default_address ?? null,
    shopifyCreatedAt: c.created_at ? new Date(c.created_at) : null,
    shopifyUpdatedAt: c.updated_at ? new Date(c.updated_at) : null,
  };

  await db.insert(customersTable).values(values).onConflictDoUpdate({
    target: [customersTable.storeId, customersTable.shopifyCustomerId],
    set: { ...values, updatedAt: new Date() },
  });
}

async function upsertOrder(storeId: string, o: ShopifyOrder): Promise<void> {
  const values = {
    storeId,
    shopifyOrderId: String(o.id),
    orderNumber: o.order_number,
    name: o.name,
    email: o.email,
    phone: o.phone,
    shopifyCustomerId: o.customer?.id ? String(o.customer.id) : null,
    financialStatus: (o.financial_status as any) ?? "pending",
    fulfillmentStatus: (o.fulfillment_status as any) ?? "unfulfilled",
    currency: o.currency,
    totalPrice: o.total_price,
    subtotalPrice: o.subtotal_price,
    totalTax: o.total_tax,
    totalDiscounts: o.total_discounts,
    lineItems: o.line_items?.map(li => ({
      id: String(li.id), variantId: li.variant_id ? String(li.variant_id) : undefined,
      productId: li.product_id ? String(li.product_id) : undefined, title: li.title,
      variantTitle: li.variant_title, sku: li.sku, quantity: li.quantity,
      price: li.price, totalDiscount: li.total_discount,
      fulfillmentStatus: li.fulfillment_status, requiresShipping: li.requires_shipping,
      taxable: li.taxable,
    })) ?? [],
    shippingAddress: o.shipping_address ?? null,
    billingAddress: o.billing_address ?? null,
    discountCodes: o.discount_codes ?? [],
    tags: o.tags ? o.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    note: o.note,
    test: o.test ?? false,
    confirmed: o.confirmed ?? true,
    cancelledAt: o.cancelled_at ? new Date(o.cancelled_at) : null,
    closedAt: o.closed_at ? new Date(o.closed_at) : null,
    processedAt: o.processed_at ? new Date(o.processed_at) : null,
    shopifyCreatedAt: o.created_at ? new Date(o.created_at) : null,
    shopifyUpdatedAt: o.updated_at ? new Date(o.updated_at) : null,
  };

  await db.insert(ordersTable).values(values).onConflictDoUpdate({
    target: [ordersTable.storeId, ordersTable.shopifyOrderId],
    set: { ...values, updatedAt: new Date() },
  });
}

// Shopify API types
interface ShopifyProduct {
  id: number; title: string; body_html: string; vendor: string; product_type: string;
  handle: string; status: string; published_at: string; tags: string;
  images: { id: number; src: string; alt: string | null; position: number; width?: number; height?: number }[];
  options: { id: number; name: string; position: number; values: string[] }[];
  variants: ShopifyVariant[];
  metafields_global_title_tag?: string;
  metafields_global_description_tag?: string;
  created_at: string; updated_at: string; template_suffix?: string;
}
interface ShopifyVariant {
  id: number; title: string; sku: string | null; barcode: string | null;
  price: string; compare_at_price: string | null; inventory_quantity: number | null;
  inventory_policy: string; inventory_management: string | null;
  inventory_item_id: number | null; fulfillment_service: string;
  requires_shipping: boolean; taxable: boolean; tax_code: string | null;
  grams: number; weight: number; weight_unit: string;
  option1: string | null; option2: string | null; option3: string | null;
  image_id: number | null; position: number; created_at: string; updated_at: string;
}
interface ShopifyCollection {
  id: number; title: string; handle: string; body_html: string;
  image?: { src: string; alt?: string }; published: boolean;
  sort_order: string; disjunctive?: boolean;
  rules?: { column: string; relation: string; condition: string }[];
  created_at: string; updated_at: string; published_at: string;
}
interface ShopifyCustomer {
  id: number; email: string; first_name: string; last_name: string; phone: string | null;
  orders_count: number; total_spent: string; state: string; tags: string; note: string | null;
  verified_email: boolean; tax_exempt: boolean; accepts_marketing: boolean;
  currency: string; addresses: any[]; default_address: any; created_at: string; updated_at: string;
}
interface ShopifyOrder {
  id: number; order_number: number; name: string; email: string; phone: string | null;
  customer?: { id: number }; financial_status: string; fulfillment_status: string;
  currency: string; total_price: string; subtotal_price: string; total_tax: string;
  total_discounts: string; line_items: any[]; shipping_address?: any; billing_address?: any;
  discount_codes: any[]; tags: string; note: string | null; test: boolean; confirmed: boolean;
  cancelled_at: string | null; closed_at: string | null; processed_at: string | null;
  created_at: string; updated_at: string;
}
