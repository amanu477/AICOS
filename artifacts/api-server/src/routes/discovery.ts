import { Router } from "express";
import { getAuth } from "@clerk/express";
import { groq } from "../lib/groq";
import { logger } from "../lib/logger";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = auth.userId;
  next();
}

router.use(requireAuth);

router.post("/search", async (req: any, res) => {
  const {
    country, niche, category, supplier, shippingTimeMax,
    profitMarginMin, productRatingMin, trendScoreMin,
    priceMin, priceMax, count = 10,
  } = req.body;

  const filterSummary = [
    country && `Country: ${country}`,
    niche && `Niche: ${niche}`,
    category && `Category: ${category}`,
    supplier && `Supplier platform: ${supplier}`,
    shippingTimeMax && `Max shipping time: ${shippingTimeMax} days`,
    profitMarginMin && `Min profit margin: ${profitMarginMin}%`,
    productRatingMin && `Min product rating: ${productRatingMin}★`,
    trendScoreMin && `Min trend score: ${trendScoreMin}`,
    (priceMin || priceMax) && `Selling price: $${priceMin ?? 0}–$${priceMax ?? 999}`,
  ].filter(Boolean).join(", ") || "No specific filters (show diverse top opportunities)";

  const systemPrompt = `You are an AI product discovery engine for Shopify dropshipping merchants. 
You analyze market data, supplier databases, and trend signals to surface winning products.
You always respond with valid JSON only — no markdown fences, no explanation text, just the raw JSON object.`;

  const userPrompt = `Generate exactly ${count} realistic dropshipping product opportunities matching these filters: ${filterSummary}.

Each product must have realistic, internally consistent data (cost, margin, and revenue should be mathematically consistent).
Vary the recommendation badges across products. Make the products genuinely interesting and specific (not generic).

Return ONLY this JSON structure (no markdown, no extra text):
{
  "products": [
    {
      "id": "unique-id-1",
      "name": "Specific Product Name",
      "category": "Category",
      "niche": "Niche",
      "supplier": "Supplier company name",
      "supplierPlatform": "AliExpress|CJDropshipping|Zendrop|SaleHoo|Spocket",
      "country": "Country of origin",
      "costPrice": 0.00,
      "sellingPrice": 0.00,
      "profitMargin": 0,
      "estimatedMonthlyRevenue": 0,
      "shippingDays": 0,
      "productRating": 0.0,
      "reviewCount": 0,
      "ordersPerMonth": 0,
      "aiScore": 0,
      "riskScore": 0,
      "recommendationBadge": "Hot Trend|Best Seller|Hidden Gem|Rising Star|High Risk",
      "scores": {
        "demand": 0,
        "competition": 0,
        "profit": 0,
        "shipping": 0,
        "supplierTrust": 0,
        "customerRatings": 0,
        "trendGrowth": 0
      },
      "trendScore": 0,
      "tags": ["tag1", "tag2", "tag3"],
      "description": "2-sentence product description explaining why this is a good opportunity"
    }
  ]
}

Rules:
- aiScore: 0-100 (weighted average of all scores)
- riskScore: 0-100 (higher = riskier; inverse of overall quality)
- all scores in scores object: 0-100
- competition score: LOWER competition = HIGHER score (100 = no competition, 0 = saturated)
- profitMargin: integer percentage (e.g. 65 means 65%)
- estimatedMonthlyRevenue: realistic USD value based on orders and selling price
- shippingDays: integer
- productRating: 1-5 with one decimal place
- trendScore: 0-100`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let parsed: any;
    try {
      // Strip markdown fences and any leading/trailing non-JSON text
      let cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      // Find the first { and last } to extract JSON even if there's prose around it
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      parsed = JSON.parse(cleaned);
    } catch {
      logger.error({ raw: raw.slice(0, 500) }, "Discovery: failed to parse Groq JSON response");
      return res.status(500).json({ error: "AI returned malformed data, please retry" });
    }

    // Normalize and validate each product to prevent frontend crashes
    const rawProducts: any[] = Array.isArray(parsed?.products) ? parsed.products : [];
    const products = rawProducts
      .filter((p: any) => p && typeof p === "object")
      .map((p: any, idx: number) => ({
        id: String(p.id ?? `product-${idx}`),
        name: String(p.name ?? "Unnamed Product"),
        category: String(p.category ?? "General"),
        niche: String(p.niche ?? "General"),
        supplier: String(p.supplier ?? "Unknown Supplier"),
        supplierPlatform: String(p.supplierPlatform ?? "AliExpress"),
        country: String(p.country ?? "China"),
        costPrice: clamp(Number(p.costPrice) || 0, 0, 10000),
        sellingPrice: clamp(Number(p.sellingPrice) || 0, 0, 10000),
        profitMargin: clamp(Number(p.profitMargin) || 0, 0, 100),
        estimatedMonthlyRevenue: clamp(Number(p.estimatedMonthlyRevenue) || 0, 0, 10_000_000),
        shippingDays: clamp(Math.round(Number(p.shippingDays) || 7), 1, 90),
        productRating: clamp(Number(p.productRating) || 4.0, 1, 5),
        reviewCount: clamp(Math.round(Number(p.reviewCount) || 0), 0, 1_000_000),
        ordersPerMonth: clamp(Math.round(Number(p.ordersPerMonth) || 0), 0, 100_000),
        aiScore: clamp(Math.round(Number(p.aiScore) || 50), 0, 100),
        riskScore: clamp(Math.round(Number(p.riskScore) || 50), 0, 100),
        recommendationBadge: ["Hot Trend", "Best Seller", "Hidden Gem", "Rising Star", "High Risk"].includes(p.recommendationBadge)
          ? p.recommendationBadge
          : "Rising Star",
        scores: {
          demand: clamp(Math.round(Number(p.scores?.demand) || 50), 0, 100),
          competition: clamp(Math.round(Number(p.scores?.competition) || 50), 0, 100),
          profit: clamp(Math.round(Number(p.scores?.profit) || 50), 0, 100),
          shipping: clamp(Math.round(Number(p.scores?.shipping) || 50), 0, 100),
          supplierTrust: clamp(Math.round(Number(p.scores?.supplierTrust) || 50), 0, 100),
          customerRatings: clamp(Math.round(Number(p.scores?.customerRatings) || 50), 0, 100),
          trendGrowth: clamp(Math.round(Number(p.scores?.trendGrowth) || 50), 0, 100),
        },
        trendScore: clamp(Math.round(Number(p.trendScore) || 50), 0, 100),
        tags: Array.isArray(p.tags) ? p.tags.slice(0, 5).map(String) : [],
        description: String(p.description ?? ""),
      }));

    res.json({ products });
  } catch (err) {
    logger.error({ err }, "Discovery search error");
    res.status(500).json({ error: "Discovery search failed" });
  }
});

export default router;
