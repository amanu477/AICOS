import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { storesTable, syncJobsTable, webhookEventsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { generateNonce, verifyHmac } from "../lib/encryption.js";
import {
  buildInstallUrl, completeOAuth, registerWebhooks,
  handleUninstall, getStoreById, getStoresByUser, verifyWebhookHmac,
} from "../services/shopify.service.js";
import { startFullSync } from "../services/sync.service.js";
import { enqueueSyncJob } from "../queues/shopify.queue.js";
import { logger } from "../lib/logger.js";
import express from "express";

const router: IRouter = Router();

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? "";

function getAppUrl(req: Request): string {
  return process.env.APP_URL ?? `${req.protocol}://${req.get("host")}`;
}

function getCallbackUrl(req: Request): string {
  return `${getAppUrl(req)}/api/shopify/callback`;
}

// ── OAuth Install ─────────────────────────────────────────────────────────────
router.get("/install", async (req: Request, res: Response): Promise<void> => {
  const shop = String(req.query.shop ?? "");
  if (!shop || !shop.endsWith(".myshopify.com")) {
    res.status(400).json({ error: "Invalid shop parameter" });
    return;
  }

  const nonce = generateNonce();
  // Store nonce in signed cookie for CSRF protection
  res.cookie("shopify_nonce", nonce, { httpOnly: true, sameSite: "lax", maxAge: 600_000 });

  const installUrl = buildInstallUrl(shop, getCallbackUrl(req), nonce);
  req.log.info({ shop }, "Initiating Shopify OAuth");
  res.redirect(installUrl);
});

// ── OAuth Callback ────────────────────────────────────────────────────────────
router.get("/callback", async (req: Request, res: Response): Promise<void> => {
  const { shop, code, state, hmac } = req.query as Record<string, string>;

  if (!shop || !code || !hmac) {
    res.status(400).json({ error: "Missing required OAuth parameters" });
    return;
  }

  // Verify HMAC
  const params = { ...req.query };
  delete params.hmac;
  const message = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  if (!verifyHmac(message, SHOPIFY_API_SECRET, hmac)) {
    res.status(401).json({ error: "HMAC verification failed" });
    return;
  }

  try {
    const auth = getAuth(req);
    const userId = auth?.userId ?? "system";

    const storeId = await completeOAuth(shop, code, userId);

    // Register webhooks + trigger initial sync in background
    setImmediate(async () => {
      try {
        await registerWebhooks(storeId);
        const jobId = await startFullSync(storeId);
        await enqueueSyncJob({ storeId, jobId, type: "full_sync" });
      } catch (err) {
        logger.error({ err, storeId }, "Post-install setup failed");
      }
    });

    const appUrl = getAppUrl(req);
    res.redirect(`${appUrl}/?shopify_connected=true&store=${storeId}`);
  } catch (err) {
    req.log.error({ err, shop }, "OAuth callback failed");
    res.redirect(`${getAppUrl(req)}/?shopify_error=true`);
  }
});

// ── Webhook Handler ───────────────────────────────────────────────────────────
router.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["x-shopify-hmac-sha256"] as string;
    const topic = req.headers["x-shopify-topic"] as string;
    const shop = req.headers["x-shopify-shop-domain"] as string;
    const shopifyWebhookId = req.headers["x-shopify-webhook-id"] as string;

    if (!signature || !topic || !shop) {
      res.status(401).json({ error: "Missing webhook headers" });
      return;
    }

    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : String(req.body);

    if (!verifyWebhookHmac(rawBody, signature)) {
      req.log.warn({ shop, topic }, "Webhook HMAC verification failed");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    res.sendStatus(200);

    setImmediate(async () => {
      try {
        const payload = JSON.parse(rawBody);
        const [storeRow] = await db.select({ id: storesTable.id })
          .from(storesTable).where(eq(storesTable.shopifyDomain, shop));

        if (!storeRow) return;

        await db.insert(webhookEventsTable).values({
          storeId: storeRow.id,
          topic,
          shopifyWebhookId,
          payload,
          processed: false,
        });

        await processWebhookEvent(storeRow.id, topic, payload);

        await db.update(webhookEventsTable)
          .set({ processed: true, processedAt: new Date() })
          .where(and(eq(webhookEventsTable.storeId, storeRow.id), eq(webhookEventsTable.shopifyWebhookId, shopifyWebhookId)));

      } catch (err) {
        logger.error({ err, shop, topic }, "Webhook processing failed");
      }
    });
  }
);

async function processWebhookEvent(storeId: string, topic: string, payload: any): Promise<void> {
  const { syncProducts, syncCollections, syncCustomers, syncOrders } = await import("../services/sync.service.js");
  const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
  if (!store) return;

  const { decrypt } = await import("../lib/encryption.js");
  const accessToken = decrypt(store.accessTokenEncrypted);

  switch (topic) {
    case "products/create":
    case "products/update":
    case "products/delete":
      await syncProducts(storeId, store.shopifyDomain, accessToken);
      break;
    case "orders/create":
    case "orders/updated":
    case "orders/cancelled":
      await syncOrders(storeId, store.shopifyDomain, accessToken);
      break;
    case "customers/create":
    case "customers/update":
      await syncCustomers(storeId, store.shopifyDomain, accessToken);
      break;
    case "collections/create":
    case "collections/update":
      await syncCollections(storeId, store.shopifyDomain, accessToken);
      break;
    case "app/uninstalled":
      await handleUninstall(store.shopifyDomain);
      break;
  }
}

// ── Connection Status ─────────────────────────────────────────────────────────
router.get("/status/:storeId", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const store = await getStoreById(storeId);

  if (!store || store.userId !== auth.userId) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  const recentJobs = await db.select().from(syncJobsTable)
    .where(eq(syncJobsTable.storeId, storeId))
    .orderBy(desc(syncJobsTable.createdAt))
    .limit(5);

  res.json({
    storeId: store.id,
    name: store.name,
    domain: store.shopifyDomain,
    connected: !store.uninstalledAt,
    syncStatus: store.syncStatus,
    lastSyncedAt: store.lastSyncedAt,
    webhooksRegistered: store.webhooksRegistered,
    recentJobs: recentJobs.map(j => ({
      id: j.id,
      type: j.type,
      status: j.status,
      processedRecords: j.processedRecords,
      totalRecords: j.totalRecords,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      errorMessage: j.errorMessage,
    })),
  });
});

// ── Manual Sync Trigger ───────────────────────────────────────────────────────
router.post("/sync/:storeId", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const store = await getStoreById(storeId);

  if (!store || store.userId !== auth.userId) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  if (store.syncStatus === "syncing") {
    res.status(409).json({ error: "Sync already in progress" });
    return;
  }

  const jobId = await startFullSync(storeId);
  await enqueueSyncJob({ storeId, jobId, type: "full_sync" });

  req.log.info({ storeId, jobId }, "Manual sync triggered");
  res.status(202).json({ jobId, message: "Sync started" });
});

// ── List Stores ───────────────────────────────────────────────────────────────
router.get("/stores", async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const stores = await getStoresByUser(auth.userId);
  res.json(stores.map(s => ({
    id: s.id,
    name: s.name,
    domain: s.shopifyDomain,
    currency: s.currency,
    syncStatus: s.syncStatus,
    lastSyncedAt: s.lastSyncedAt,
    connected: !s.uninstalledAt,
    installedAt: s.installedAt,
  })));
});

export default router;
