import { groq, NOVA_MODEL } from "../lib/groq.js";
import { db } from "@workspace/db";
import { productsTable, type AiOptimization } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";

export type { AiOptimization };

const AI_PROMPT_SYSTEM = `You are an expert Shopify e-commerce copywriter and SEO strategist. Given a product, generate optimized content in JSON format. Be specific, persuasive, and conversion-focused. Return ONLY valid JSON with no markdown.`;

function buildProductPrompt(product: {
  title: string;
  bodyHtml: string | null;
  vendor: string | null;
  productType: string | null;
  tags: string[] | null;
  price: string | null;
  compareAtPrice: string | null;
}) {
  return `Generate AI optimization for this Shopify product:

Title: ${product.title}
Description: ${product.bodyHtml ? product.bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 800) : "None"}
Vendor: ${product.vendor ?? "Unknown"}
Type: ${product.productType ?? "General"}
Tags: ${(product.tags ?? []).join(", ") || "None"}
Current Price: ${product.price ? `$${product.price}` : "Unknown"}
Compare At Price: ${product.compareAtPrice ? `$${product.compareAtPrice}` : "None"}

Return this exact JSON structure (all fields required):
{
  "seoTitle": "60-char max SEO title with primary keyword near the start",
  "seoDescription": "155-char max meta description with CTA",
  "productDescription": "2–3 paragraph compelling product description with benefits and emotional hooks",
  "bulletPoints": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "metaDescription": "155-char search snippet with brand and main benefit",
  "altText": "Descriptive alt text for the main product image",
  "collectionSuggestions": ["Collection A", "Collection B", "Collection C"],
  "tagSuggestions": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "pricingSuggestion": {
    "suggestedPrice": "XX.XX",
    "reasoning": "1-2 sentence pricing rationale"
  },
  "discountSuggestion": {
    "percentage": 15,
    "occasion": "Flash sale occasion name",
    "reasoning": "Why this discount works"
  },
  "bundleSuggestions": [
    { "name": "Bundle name", "rationale": "Why bundle these together" },
    { "name": "Bundle name 2", "rationale": "Why this bundle converts" }
  ],
  "crossSellSuggestions": ["Product type A", "Product type B", "Product type C"],
  "upsellSuggestions": ["Premium version idea", "Add-on idea", "Upgrade idea"],
  "brandTone": "2-sentence description of the ideal brand voice and tone for this product",
  "generatedAt": "${new Date().toISOString()}"
}`;
}

export async function generateProductOptimization(productId: string): Promise<AiOptimization> {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) throw new Error(`Product ${productId} not found`);

  await db.update(productsTable)
    .set({ aiOptimizationStatus: "generating" })
    .where(eq(productsTable.id, productId));

  try {
    const response = await groq.chat.completions.create({
      model: NOVA_MODEL,
      messages: [
        { role: "system", content: AI_PROMPT_SYSTEM },
        { role: "user", content: buildProductPrompt(product) },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from AI");

    const optimization = JSON.parse(raw) as AiOptimization;
    optimization.generatedAt = new Date().toISOString();

    await db.update(productsTable).set({
      aiOptimization: optimization,
      aiOptimizationStatus: "done",
      updatedAt: new Date(),
    }).where(eq(productsTable.id, productId));

    logger.info({ productId }, "AI optimization generated");
    return optimization;
  } catch (err) {
    await db.update(productsTable)
      .set({ aiOptimizationStatus: "failed" })
      .where(eq(productsTable.id, productId));
    logger.error({ productId, err }, "AI optimization failed");
    throw err;
  }
}

export async function generateOptimizationsForStore(storeId: string, limit = 10): Promise<void> {
  const pending = await db.select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.storeId, storeId))
    .limit(limit);

  for (const { id } of pending) {
    try {
      await generateProductOptimization(id);
    } catch (err) {
      logger.warn({ id, err }, "Skipping product AI optimization due to error");
    }
  }
}
