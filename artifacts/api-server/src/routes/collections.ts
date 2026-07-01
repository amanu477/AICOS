import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { collectionsTable, storesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

async function requireStoreAccess(req: Request, res: Response): Promise<{ storeId: string; store: any } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const [store] = await db.select().from(storesTable).where(and(eq(storesTable.id, storeId), eq(storesTable.userId, auth.userId)));
  if (!store) { res.status(404).json({ error: "Store not found" }); return null; }
  return { storeId, store };
}

router.get("/stores/:storeId/collections", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const collections = await db.select().from(collectionsTable)
    .where(eq(collectionsTable.storeId, access.storeId))
    .orderBy(desc(collectionsTable.shopifyUpdatedAt));
  res.json(collections);
});

router.get("/stores/:storeId/collections/:collectionId", async (req: Request, res: Response): Promise<void> => {
  const access = await requireStoreAccess(req, res);
  if (!access) return;
  const collectionId = Array.isArray(req.params.collectionId) ? req.params.collectionId[0] : req.params.collectionId;
  const [col] = await db.select().from(collectionsTable).where(and(eq(collectionsTable.storeId, access.storeId), eq(collectionsTable.id, collectionId)));
  if (!col) { res.status(404).json({ error: "Collection not found" }); return; }
  res.json(col);
});

export default router;
