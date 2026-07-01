import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { productsTable, variantsTable, storesTable, logsTable } from "@workspace/db";
import { eq, and, desc, isNull, sql, inArray } from "drizzle-orm";
import { shopifyRequestWithToken } from "../lib/shopify-api.js";
import { decrypt } from "../lib/encryption.js";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { generateProductOptimization } from "../services/product-ai.service.js";

const router: IRouter = Router();

async function requireStoreAccess(req: Request, res: Response): Promise<{ storeId: string; store: any } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const [store] = await db.select().from(storesTable).where(
    and(eq(storesTable.id, storeId), eq(storesTable.userId, auth.userId))
  );
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return null;
  }
  return { storeId, store };
}

// ── List Products ─────────────────────────────────────────────────────────────
router.get("/stores/:storeId/products", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId } = access;
  const limit = Math.min(Number(req.query.limit ?? 50), 250);
  const offset = Number(req.query.offset ?? 0);
  const status = req.query.status as string | undefined;

  const conditions = [eq(productsTable.storeId, storeId), isNull(productsTable.deletedAt)];
  if (status) conditions.push(eq(productsTable.status, status as any));

  const products = await db.select().from(productsTable)
    .where(and(...conditions))
    .orderBy(desc(productsTable.shopifyUpdatedAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
    .from(productsTable).where(and(...conditions));

  res.json({ products, total: count, limit, offset });
});

// ── Get Product ───────────────────────────────────────────────────────────────
router.get("/stores/:storeId/products/:productId", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const [product] = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId), isNull(productsTable.deletedAt))
  );

  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const variants = await db.select().from(variantsTable).where(
    and(eq(variantsTable.storeId, storeId), eq(variantsTable.productId, productId))
  );

  res.json({ ...product, variants });
});

// ── Update Product ────────────────────────────────────────────────────────────
const UpdateProductSchema = z.object({
  title: z.string().min(1).optional(),
  bodyHtml: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
}).strict();

router.patch("/stores/:storeId/products/:productId", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId, store } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const parsed = UpdateProductSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId))
  );
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const shopifyUpdate: Record<string, unknown> = {};
  if (parsed.data.title) shopifyUpdate.title = parsed.data.title;
  if (parsed.data.bodyHtml !== undefined) shopifyUpdate.body_html = parsed.data.bodyHtml;
  if (parsed.data.status) shopifyUpdate.status = parsed.data.status;
  if (parsed.data.tags) shopifyUpdate.tags = parsed.data.tags.join(", ");
  if (parsed.data.vendor) shopifyUpdate.vendor = parsed.data.vendor;
  if (parsed.data.productType) shopifyUpdate.product_type = parsed.data.productType;
  if (parsed.data.seoTitle !== undefined) shopifyUpdate.metafields_global_title_tag = parsed.data.seoTitle;
  if (parsed.data.seoDescription !== undefined) shopifyUpdate.metafields_global_description_tag = parsed.data.seoDescription;

  const accessToken = decrypt(store.accessTokenEncrypted);
  await shopifyRequestWithToken(store.shopifyDomain, store.accessTokenEncrypted,
    `products/${product.shopifyProductId}.json`, { method: "PUT", body: { product: shopifyUpdate } }
  );

  const [updated] = await db.update(productsTable).set({
    ...parsed.data,
    updatedAt: new Date(),
  }).where(eq(productsTable.id, productId)).returning();

  await db.insert(logsTable).values({
    storeId,
    action: "product.updated",
    entityType: "product",
    entityId: productId,
    before: { title: product.title, status: product.status },
    after: parsed.data,
  });

  res.json(updated);
});

// ── Delete Product ────────────────────────────────────────────────────────────
router.delete("/stores/:storeId/products/:productId", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId, store } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const [product] = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId))
  );
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  await shopifyRequestWithToken(store.shopifyDomain, store.accessTokenEncrypted,
    `products/${product.shopifyProductId}.json`, { method: "DELETE" }
  );

  await db.update(productsTable).set({ deletedAt: new Date() }).where(eq(productsTable.id, productId));

  await db.insert(logsTable).values({
    storeId,
    action: "product.deleted",
    entityType: "product",
    entityId: productId,
    before: { title: product.title },
  });

  res.sendStatus(204);
});

// ── Bulk Status Update ────────────────────────────────────────────────────────
const BulkUpdateSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(["active", "draft", "archived"]),
});

router.post("/stores/:storeId/products/bulk-update", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId, store } = access;

  const parsed = BulkUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const products = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), inArray(productsTable.id, parsed.data.productIds))
  );

  let updated = 0;
  const accessToken = decrypt(store.accessTokenEncrypted);

  for (const p of products) {
    try {
      await shopifyRequestWithToken(store.shopifyDomain, store.accessTokenEncrypted,
        `products/${p.shopifyProductId}.json`, { method: "PUT", body: { product: { status: parsed.data.status } } }
      );
      await db.update(productsTable).set({ status: parsed.data.status }).where(eq(productsTable.id, p.id));
      updated++;
    } catch (err) {
      req.log.warn({ productId: p.id, err }, "Bulk update failed for product");
    }
  }

  res.json({ updated, total: products.length });
});

// ── Publish / Unpublish ───────────────────────────────────────────────────────
router.post("/stores/:storeId/products/:productId/publish", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const { storeId, store } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const [product] = await db.select().from(productsTable).where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId)));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  await shopifyRequestWithToken(store.shopifyDomain, store.accessTokenEncrypted,
    `products/${product.shopifyProductId}.json`, { method: "PUT", body: { product: { status: "active", published_at: new Date().toISOString() } } }
  );
  const [updated] = await db.update(productsTable).set({ status: "active", publishedAt: new Date() }).where(eq(productsTable.id, productId)).returning();
  res.json(updated);
});

router.post("/stores/:storeId/products/:productId/unpublish", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const { storeId, store } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const [product] = await db.select().from(productsTable).where(and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId)));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  await shopifyRequestWithToken(store.shopifyDomain, store.accessTokenEncrypted,
    `products/${product.shopifyProductId}.json`, { method: "PUT", body: { product: { status: "draft", published_at: null } } }
  );
  const [updated] = await db.update(productsTable).set({ status: "draft", publishedAt: null }).where(eq(productsTable.id, productId)).returning();
  res.json(updated);
});

// ── AI Optimization Queue ─────────────────────────────────────────────────────
router.get("/stores/:storeId/products/ai-queue", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const { storeId } = access;
  const limit = Math.min(Number(req.query.limit ?? 50), 250);
  const offset = Number(req.query.offset ?? 0);
  const statusFilter = req.query.status as string | undefined;

  const conditions = [eq(productsTable.storeId, storeId), isNull(productsTable.deletedAt)];
  if (statusFilter) conditions.push(eq(productsTable.aiOptimizationStatus, statusFilter as any));

  const products = await db.select().from(productsTable)
    .where(and(...conditions))
    .orderBy(desc(productsTable.updatedAt))
    .limit(limit).offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
    .from(productsTable).where(and(...conditions));

  res.json({ products, total: count, limit, offset });
});

// ── Trigger AI Optimization ───────────────────────────────────────────────────
router.post("/stores/:storeId/products/:productId/ai-optimize", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const { storeId } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const [product] = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId), isNull(productsTable.deletedAt))
  );
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  res.json({ status: "generating", productId });

  generateProductOptimization(productId).catch(err => {
    logger.error({ productId, err }, "Background AI optimization failed");
  });
});

// ── Save Edited AI Optimization ───────────────────────────────────────────────
const SaveOptimizationSchema = z.object({
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  productDescription: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  metaDescription: z.string().optional(),
  altText: z.string().optional(),
  collectionSuggestions: z.array(z.string()).optional(),
  tagSuggestions: z.array(z.string()).optional(),
  pricingSuggestion: z.object({ suggestedPrice: z.string(), reasoning: z.string() }).optional(),
  discountSuggestion: z.object({ percentage: z.number(), occasion: z.string(), reasoning: z.string() }).optional(),
  bundleSuggestions: z.array(z.object({ name: z.string(), rationale: z.string() })).optional(),
  crossSellSuggestions: z.array(z.string()).optional(),
  upsellSuggestions: z.array(z.string()).optional(),
  brandTone: z.string().optional(),
});

router.patch("/stores/:storeId/products/:productId/ai-optimization", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const { storeId } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const parsed = SaveOptimizationSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId))
  );
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const updatedOptimization = { ...(product.aiOptimization ?? {}), ...parsed.data };
  const [updated] = await db.update(productsTable).set({
    aiOptimization: updatedOptimization as any,
    updatedAt: new Date(),
  }).where(eq(productsTable.id, productId)).returning();

  res.json(updated);
});

// ── Publish AI Optimization to Shopify ───────────────────────────────────────
router.post("/stores/:storeId/products/:productId/ai-publish", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const { storeId, store } = access;
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

  const [product] = await db.select().from(productsTable).where(
    and(eq(productsTable.storeId, storeId), eq(productsTable.id, productId), isNull(productsTable.deletedAt))
  );
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  if (!product.aiOptimization) { res.status(400).json({ error: "No AI optimization found. Generate one first." }); return; }

  const ai = product.aiOptimization;

  const shopifyUpdate: Record<string, unknown> = {
    body_html: ai.productDescription,
    tags: ai.tagSuggestions.join(", "),
    metafields_global_title_tag: ai.seoTitle,
    metafields_global_description_tag: ai.seoDescription,
  };

  await shopifyRequestWithToken(store.shopifyDomain, store.accessTokenEncrypted,
    `products/${product.shopifyProductId}.json`, { method: "PUT", body: { product: shopifyUpdate } }
  );

  const [updated] = await db.update(productsTable).set({
    bodyHtml: ai.productDescription,
    seoTitle: ai.seoTitle,
    seoDescription: ai.seoDescription,
    aiTags: ai.tagSuggestions,
    updatedAt: new Date(),
  }).where(eq(productsTable.id, productId)).returning();

  await db.insert(logsTable).values({
    storeId,
    action: "product.ai_published",
    entityType: "product",
    entityId: productId,
    after: { seoTitle: ai.seoTitle, tags: ai.tagSuggestions },
  });

  res.json(updated);
});

export default router;
