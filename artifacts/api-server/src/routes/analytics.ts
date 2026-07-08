import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, customersTable, storesTable, syncJobsTable } from "@workspace/db";
import { eq, and, desc, sql, gte } from "drizzle-orm";

const router: IRouter = Router();

async function requireStoreAccess(req: Request, res: Response): Promise<{ storeId: string; store: any } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const [store] = await db.select().from(storesTable).where(
    and(eq(storesTable.id, storeId), eq(storesTable.userId, auth.userId))
  );
  if (!store) { res.status(404).json({ error: "Store not found" }); return null; }
  return { storeId, store };
}

// List current user's stores
router.get("/stores", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const stores = await db.select({
    id: storesTable.id,
    name: storesTable.name,
    shopifyDomain: storesTable.shopifyDomain,
    currency: storesTable.currency,
    syncStatus: storesTable.syncStatus,
    lastSyncedAt: storesTable.lastSyncedAt,
  }).from(storesTable).where(eq(storesTable.userId, auth.userId));
  res.json({ stores });
});

// Analytics summary
router.get("/stores/:storeId/analytics/summary", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId } = access;
  const rawDays = Number(req.query.days);
  const days = Math.min(Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 30, 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [revenue] = await db.select({
    totalRevenue: sql<string>`coalesce(sum(total_price::numeric), 0)::text`,
    orderCount: sql<number>`count(*)::int`,
    avgOrderValue: sql<string>`coalesce(avg(total_price::numeric), 0)::text`,
  }).from(ordersTable).where(and(eq(ordersTable.storeId, storeId), gte(ordersTable.shopifyCreatedAt, since)));

  const [products] = await db.select({ count: sql<number>`count(*)::int` })
    .from(productsTable).where(eq(productsTable.storeId, storeId));

  const [customers] = await db.select({ count: sql<number>`count(*)::int` })
    .from(customersTable).where(eq(customersTable.storeId, storeId));

  const dailyRevenue = await db.select({
    date: sql<string>`date_trunc('day', shopify_created_at)::date::text`,
    revenue: sql<string>`coalesce(sum(total_price::numeric), 0)::text`,
    orders: sql<number>`count(*)::int`,
  }).from(ordersTable).where(
    and(eq(ordersTable.storeId, storeId), gte(ordersTable.shopifyCreatedAt, since))
  ).groupBy(sql`date_trunc('day', shopify_created_at)`)
   .orderBy(sql`date_trunc('day', shopify_created_at)`);

  const fulfillmentBreakdown = await db.select({
    status: ordersTable.fulfillmentStatus,
    count: sql<number>`count(*)::int`,
  }).from(ordersTable).where(
    and(eq(ordersTable.storeId, storeId), gte(ordersTable.shopifyCreatedAt, since))
  ).groupBy(ordersTable.fulfillmentStatus);

  res.json({ period: { days, since }, revenue, products, customers, dailyRevenue, fulfillmentBreakdown });
});

// Sync jobs list
router.get("/stores/:storeId/sync-jobs", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId } = access;
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const jobs = await db.select().from(syncJobsTable)
    .where(eq(syncJobsTable.storeId, storeId))
    .orderBy(desc(syncJobsTable.createdAt))
    .limit(limit);

  res.json({ jobs });
});

export default router;
