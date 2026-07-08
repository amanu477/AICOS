import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { ordersTable, storesTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

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

// List orders
router.get("/stores/:storeId/orders", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId } = access;
  const rawLimit = Number(req.query.limit);
  const rawOffset = Number(req.query.offset);
  const limit = Math.min(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50, 250);
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
  const financialStatus = req.query.financial_status as string | undefined;
  const fulfillmentStatus = req.query.fulfillment_status as string | undefined;

  const conditions: any[] = [eq(ordersTable.storeId, storeId)];
  if (financialStatus) conditions.push(eq(ordersTable.financialStatus, financialStatus as any));
  if (fulfillmentStatus) conditions.push(eq(ordersTable.fulfillmentStatus, fulfillmentStatus as any));

  const orders = await db.select().from(ordersTable)
    .where(and(...conditions))
    .orderBy(desc(ordersTable.shopifyCreatedAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(and(...conditions));

  res.json({ orders, total: count, limit, offset });
});

// Get single order
router.get("/stores/:storeId/orders/:orderId", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;

  const { storeId } = access;
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const [order] = await db.select().from(ordersTable).where(
    and(eq(ordersTable.storeId, storeId), eq(ordersTable.id, orderId))
  );

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(order);
});

export default router;
