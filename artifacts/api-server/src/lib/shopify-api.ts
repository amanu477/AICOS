import { decrypt } from "./encryption.js";
import { logger } from "./logger.js";

export interface ShopifyRequestOptions {
  shop: string;
  accessToken: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean>;
  apiVersion?: string;
}

const API_VERSION = "2024-10";

export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: unknown,
  ) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

export async function shopifyRequest<T = unknown>({
  shop,
  accessToken,
  path,
  method = "GET",
  body,
  query,
  apiVersion = API_VERSION,
}: ShopifyRequestOptions): Promise<T> {
  const url = new URL(`https://${shop}/admin/api/${apiVersion}/${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.warn({ shop, path, status: response.status, error: errorBody }, "Shopify API error");
    throw new ShopifyApiError(`Shopify API error: ${response.status} ${response.statusText}`, response.status, errorBody);
  }

  return response.json() as Promise<T>;
}

export async function shopifyRequestWithToken<T = unknown>(
  shop: string,
  encryptedToken: string,
  path: string,
  options: Partial<ShopifyRequestOptions> = {},
): Promise<T> {
  const accessToken = decrypt(encryptedToken);
  return shopifyRequest<T>({ shop, accessToken, path, ...options });
}

export interface PaginatedResponse<T> {
  data: T[];
  nextLink?: string;
}

export function extractNextLink(linkHeader: string | null): string | undefined {
  if (!linkHeader) return undefined;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match?.[1];
}

export function buildOAuthUrl(shop: string, apiKey: string, redirectUri: string, scopes: string[], nonce: string): string {
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", apiKey);
  url.searchParams.set("scope", scopes.join(","));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", nonce);
  return url.toString();
}

export async function exchangeCodeForToken(
  shop: string,
  code: string,
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, code }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ShopifyApiError(`Token exchange failed: ${error}`, response.status);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

export const SHOPIFY_SCOPES = [
  "read_products", "write_products",
  "read_customers", "write_customers",
  "read_orders", "write_orders",
  "read_inventory", "write_inventory",
  "read_collections", "write_collections",
  "read_analytics",
  "read_themes",
];

export const WEBHOOK_TOPICS = [
  "products/create",
  "products/update",
  "products/delete",
  "orders/create",
  "orders/updated",
  "orders/cancelled",
  "customers/create",
  "customers/update",
  "inventory_levels/update",
  "collections/create",
  "collections/update",
  "app/uninstalled",
  "shop/update",
];
