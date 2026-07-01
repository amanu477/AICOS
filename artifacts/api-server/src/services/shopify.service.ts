import { db } from "@workspace/db";
import { storesTable, webhooksTable, logsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt, verifyHmac } from "../lib/encryption.js";
import {
  shopifyRequest,
  exchangeCodeForToken,
  buildOAuthUrl,
  SHOPIFY_SCOPES,
  WEBHOOK_TOPICS,
  ShopifyApiError,
} from "../lib/shopify-api.js";
import { logger } from "../lib/logger.js";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY ?? "";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? "";

export function buildInstallUrl(shop: string, redirectUri: string, nonce: string): string {
  return buildOAuthUrl(shop, SHOPIFY_API_KEY, redirectUri, SHOPIFY_SCOPES, nonce);
}

export async function completeOAuth(
  shop: string,
  code: string,
  userId: string,
): Promise<string> {
  const accessToken = await exchangeCodeForToken(shop, code, SHOPIFY_API_KEY, SHOPIFY_API_SECRET);

  const shopData = await shopifyRequest<{ shop: ShopifyShop }>({
    shop, accessToken, path: "shop.json",
  });

  const encryptedToken = encrypt(accessToken);

  const [store] = await db
    .insert(storesTable)
    .values({
      userId,
      shopifyDomain: shop,
      shopifyShopId: String(shopData.shop.id),
      accessTokenEncrypted: encryptedToken,
      name: shopData.shop.name,
      email: shopData.shop.email,
      currency: shopData.shop.currency,
      timezone: shopData.shop.timezone,
      planName: shopData.shop.plan_name,
      countryCode: shopData.shop.country_code,
      phone: shopData.shop.phone,
      installedAt: new Date(),
      syncStatus: "idle",
    })
    .onConflictDoUpdate({
      target: storesTable.shopifyDomain,
      set: {
        accessTokenEncrypted: encryptedToken,
        name: shopData.shop.name,
        email: shopData.shop.email,
        uninstalledAt: null,
        syncStatus: "idle",
        updatedAt: new Date(),
      },
    })
    .returning();

  logger.info({ storeId: store.id, shop }, "Store installed/reconnected");

  await db.insert(logsTable).values({
    storeId: store.id,
    userId,
    action: "store.installed",
    entityType: "store",
    entityId: store.id,
    after: { shop, name: store.name },
  });

  return store.id;
}

export async function registerWebhooks(storeId: string): Promise<void> {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
  if (!store) throw new Error(`Store ${storeId} not found`);

  const accessToken = decrypt(store.accessTokenEncrypted);
  const appUrl = process.env.APP_URL ?? "";
  const webhookBase = `${appUrl}/api/shopify/webhooks`;

  for (const topic of WEBHOOK_TOPICS) {
    try {
      const result = await shopifyRequest<{ webhook: { id: number } }>({
        shop: store.shopifyDomain,
        accessToken,
        path: "webhooks.json",
        method: "POST",
        body: { webhook: { topic, address: webhookBase, format: "json" } },
      });

      await db.insert(webhooksTable).values({
        storeId,
        shopifyWebhookId: String(result.webhook.id),
        topic,
        address: webhookBase,
        active: true,
      }).onConflictDoNothing();

      logger.info({ storeId, topic }, "Webhook registered");
    } catch (err) {
      logger.warn({ storeId, topic, err }, "Failed to register webhook — may already exist");
    }
  }

  await db.update(storesTable).set({ webhooksRegistered: true }).where(eq(storesTable.id, storeId));
}

export async function handleUninstall(shop: string): Promise<void> {
  await db
    .update(storesTable)
    .set({ uninstalledAt: new Date(), syncStatus: "idle", updatedAt: new Date() })
    .where(eq(storesTable.shopifyDomain, shop));
  logger.info({ shop }, "Store uninstalled");
}

export async function getStoreByDomain(shop: string) {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.shopifyDomain, shop));
  return store ?? null;
}

export async function getStoreById(id: string) {
  const [store] = await db.select().from(storesTable).where(eq(storesTable.id, id));
  return store ?? null;
}

export async function getStoresByUser(userId: string) {
  return db.select().from(storesTable).where(
    and(eq(storesTable.userId, userId))
  );
}

export function verifyWebhookHmac(rawBody: string, signature: string): boolean {
  return verifyHmac(rawBody, SHOPIFY_API_SECRET, signature);
}

interface ShopifyShop {
  id: number;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  plan_name: string;
  country_code: string;
  phone: string | null;
}
