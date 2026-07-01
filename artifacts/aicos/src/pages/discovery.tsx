import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Sparkles, TrendingUp, Star,
  Package, Truck, DollarSign, Shield, ChevronDown,
  Download, Zap, Globe, ShoppingBag, AlertTriangle, Gem,
  Flame, Award, ArrowUpRight, BarChart3, Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashSidebar } from "@/components/dashboard/dash-sidebar";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductScores {
  demand: number;
  competition: number;
  profit: number;
  shipping: number;
  supplierTrust: number;
  customerRatings: number;
  trendGrowth: number;
}

interface DiscoveredProduct {
  id: string;
  name: string;
  category: string;
  niche: string;
  supplier: string;
  supplierPlatform: string;
  country: string;
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  estimatedMonthlyRevenue: number;
  shippingDays: number;
  productRating: number;
  reviewCount: number;
  ordersPerMonth: number;
  aiScore: number;
  riskScore: number;
  recommendationBadge: string;
  scores: ProductScores;
  trendScore: number;
  tags: string[];
  description: string;
}

interface SearchFilters {
  country: string;
  niche: string;
  category: string;
  supplier: string;
  shippingTimeMax: number;
  profitMarginMin: number;
  productRatingMin: number;
  trendScoreMin: number;
  priceMin: number;
  priceMax: number;
}

const DEFAULT_FILTERS: SearchFilters = {
  country: "",
  niche: "",
  category: "",
  supplier: "",
  shippingTimeMax: 30,
  profitMarginMin: 0,
  productRatingMin: 0,
  trendScoreMin: 0,
  priceMin: 0,
  priceMax: 500,
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Spain", "Italy", "Brazil", "Mexico",
];

const NICHES = [
  "Electronics", "Fashion & Apparel", "Beauty & Skincare", "Home & Garden",
  "Sports & Fitness", "Pet Supplies", "Baby & Kids", "Health & Wellness",
  "Outdoor & Camping", "Gaming", "Jewelry & Accessories", "Kitchen & Cooking",
];

const CATEGORIES = [
  "Gadgets", "Clothing", "Supplements", "Furniture", "Tools", "Toys",
  "Bags & Luggage", "Shoes", "Watches", "Phone Accessories", "Lighting",
];

const SUPPLIERS = [
  "AliExpress", "CJDropshipping", "Zendrop", "SaleHoo", "Spocket", "DSers",
];

const SCORE_LABELS: { key: keyof ProductScores; label: string; icon: React.FC<any> }[] = [
  { key: "demand", label: "Demand", icon: TrendingUp },
  { key: "competition", label: "Competition", icon: Shield },
  { key: "profit", label: "Profit", icon: DollarSign },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "supplierTrust", label: "Supplier", icon: Award },
  { key: "customerRatings", label: "Ratings", icon: Star },
  { key: "trendGrowth", label: "Trend", icon: Zap },
];

// ─── Badge Config ─────────────────────────────────────────────────────────────

function getBadgeConfig(badge: string) {
  switch (badge) {
    case "Hot Trend":
      return { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", glow: "shadow-orange-500/10" };
    case "Best Seller":
      return { icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", glow: "shadow-emerald-500/10" };
    case "Hidden Gem":
      return { icon: Gem, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", glow: "shadow-violet-500/10" };
    case "Rising Star":
      return { icon: Sparkles, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", glow: "shadow-sky-500/10" };
    case "High Risk":
      return { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", glow: "shadow-red-500/10" };
    default:
      return { icon: Package, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20", glow: "" };
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function getScoreBarColor(score: number) {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

function getRiskColor(risk: number) {
  if (risk <= 25) return "bg-emerald-400";
  if (risk <= 50) return "bg-amber-400";
  return "bg-red-400";
}

// ─── AI Score Ring ────────────────────────────────────────────────────────────

function AIScoreRing({ score }: { score: number }) {
  const radius = 28;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className={cn("absolute text-sm font-bold tabular-nums", getScoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const NICHE_COLORS: Record<string, string> = {
  "Electronics": "from-blue-500/20 to-cyan-500/10",
  "Fashion & Apparel": "from-pink-500/20 to-rose-500/10",
  "Beauty & Skincare": "from-fuchsia-500/20 to-purple-500/10",
  "Home & Garden": "from-emerald-500/20 to-green-500/10",
  "Sports & Fitness": "from-orange-500/20 to-amber-500/10",
  "Pet Supplies": "from-amber-500/20 to-yellow-500/10",
  "Baby & Kids": "from-sky-500/20 to-blue-500/10",
  "Health & Wellness": "from-teal-500/20 to-emerald-500/10",
  "Gaming": "from-violet-500/20 to-purple-500/10",
};

// Defensive normalizer — prevents crashes from malformed AI output
function normalizeProduct(p: any): DiscoveredProduct {
  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
  const num = (v: any, fallback = 0) => { const n = Number(v); return isNaN(n) ? fallback : n; };
  const scores = p.scores ?? {};
  return {
    id: String(p.id ?? Math.random()),
    name: String(p.name ?? "Unknown Product"),
    category: String(p.category ?? "General"),
    niche: String(p.niche ?? "General"),
    supplier: String(p.supplier ?? "Unknown"),
    supplierPlatform: String(p.supplierPlatform ?? "AliExpress"),
    country: String(p.country ?? "China"),
    costPrice: clamp(num(p.costPrice), 0, 10000),
    sellingPrice: clamp(num(p.sellingPrice, 9.99), 0, 10000),
    profitMargin: clamp(num(p.profitMargin, 50), 0, 100),
    estimatedMonthlyRevenue: clamp(num(p.estimatedMonthlyRevenue), 0, 10_000_000),
    shippingDays: clamp(Math.round(num(p.shippingDays, 7)), 1, 90),
    productRating: clamp(num(p.productRating, 4.0), 1, 5),
    reviewCount: clamp(Math.round(num(p.reviewCount)), 0, 1_000_000),
    ordersPerMonth: clamp(Math.round(num(p.ordersPerMonth)), 0, 100_000),
    aiScore: clamp(Math.round(num(p.aiScore, 50)), 0, 100),
    riskScore: clamp(Math.round(num(p.riskScore, 50)), 0, 100),
    recommendationBadge: ["Hot Trend", "Best Seller", "Hidden Gem", "Rising Star", "High Risk"].includes(p.recommendationBadge)
      ? p.recommendationBadge : "Rising Star",
    scores: {
      demand: clamp(Math.round(num(scores.demand, 50)), 0, 100),
      competition: clamp(Math.round(num(scores.competition, 50)), 0, 100),
      profit: clamp(Math.round(num(scores.profit, 50)), 0, 100),
      shipping: clamp(Math.round(num(scores.shipping, 50)), 0, 100),
      supplierTrust: clamp(Math.round(num(scores.supplierTrust, 50)), 0, 100),
      customerRatings: clamp(Math.round(num(scores.customerRatings, 50)), 0, 100),
      trendGrowth: clamp(Math.round(num(scores.trendGrowth, 50)), 0, 100),
    },
    trendScore: clamp(Math.round(num(p.trendScore, 50)), 0, 100),
    tags: Array.isArray(p.tags) ? p.tags.slice(0, 5).map(String) : [],
    description: String(p.description ?? ""),
  };
}

function ProductCard({ product: rawProduct, index, onImport }: {
  product: DiscoveredProduct;
  index: number;
  onImport: (p: DiscoveredProduct) => void;
}) {
  const product = normalizeProduct(rawProduct);
  const [expanded, setExpanded] = useState(false);
  const badge = getBadgeConfig(product.recommendationBadge);
  const BadgeIcon = badge.icon;
  const gradientClass = NICHE_COLORS[product.niche] ?? "from-zinc-800/60 to-zinc-900/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "group relative rounded-2xl border border-zinc-800/60 bg-zinc-950 overflow-hidden",
        "hover:border-zinc-700/70 transition-all duration-300",
        "hover:shadow-xl hover:shadow-black/30"
      )}
    >
      {/* Gradient header */}
      <div className={cn("h-24 bg-gradient-to-br relative overflow-hidden", gradientClass)}>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <ShoppingBag className="w-20 h-20 text-white" />
        </div>
        {/* Recommendation badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
            badge.bg, badge.color
          )}>
            <BadgeIcon className="h-3 w-3" />
            {product.recommendationBadge}
          </span>
        </div>
        {/* AI Score */}
        <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-sm rounded-xl p-1">
          <AIScoreRing score={product.aiScore} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title + tags */}
        <div className="mb-2">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-1.5">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-3 gap-2 my-3">
          <MetricCell
            label="Sell Price"
            value={`$${product.sellingPrice.toFixed(2)}`}
            sub={`Cost $${product.costPrice.toFixed(2)}`}
          />
          <MetricCell
            label="Margin"
            value={`${product.profitMargin}%`}
            highlight={product.profitMargin >= 60}
          />
          <MetricCell
            label="Est. Revenue"
            value={`$${(product.estimatedMonthlyRevenue / 1000).toFixed(1)}k`}
            sub="/ month"
          />
        </div>

        {/* Supplier + shipping row */}
        <div className="flex items-center gap-3 py-2.5 border-t border-zinc-800/60 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-zinc-300 font-medium">{product.supplierPlatform}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Truck className="h-3.5 w-3.5 text-zinc-600" />
            <span>{product.shippingDays}d shipping</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-zinc-300">{product.productRating}</span>
            <span className="text-zinc-600">({(product.reviewCount / 1000).toFixed(1)}k)</span>
          </div>
        </div>

        {/* Risk score */}
        <div className="mt-2 mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">Risk Score</span>
            <span className={cn(
              "font-semibold",
              product.riskScore <= 25 ? "text-emerald-400" : product.riskScore <= 50 ? "text-amber-400" : "text-red-400"
            )}>
              {product.riskScore}/100
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${product.riskScore}%` }}
              transition={{ duration: 0.6, delay: index * 0.05 + 0.3 }}
              className={cn("h-full rounded-full", getRiskColor(product.riskScore))}
            />
          </div>
        </div>

        {/* Expand / collapse scores */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
        >
          <span className="font-medium">AI Score Breakdown</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-1.5 mt-2 pt-2 border-t border-zinc-800/60">
                {SCORE_LABELS.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-zinc-600 shrink-0" />
                    <span className="text-xs text-zinc-500 w-20 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${product.scores[key]}%` }}
                        transition={{ duration: 0.5 }}
                        className={cn("h-full rounded-full", getScoreBarColor(product.scores[key]))}
                      />
                    </div>
                    <span className={cn("text-xs font-semibold tabular-nums w-7 text-right", getScoreColor(product.scores[key]))}>
                      {product.scores[key]}
                    </span>
                  </div>
                ))}
                {product.description && (
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed border-t border-zinc-800/60 pt-2">
                    {product.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import button */}
        <Button
          size="sm"
          onClick={() => onImport(product)}
          className="w-full mt-3 bg-white/8 hover:bg-white/12 border border-zinc-700/60 text-white text-xs font-semibold h-8 gap-1.5 transition-all group-hover:border-zinc-600"
        >
          <Download className="h-3.5 w-3.5" />
          Import Product
          <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>
    </motion.div>
  );
}

function MetricCell({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-2 text-center">
      <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
      <p className={cn("text-sm font-bold leading-none", highlight ? "text-emerald-400" : "text-white")}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950 overflow-hidden animate-pulse">
      <div className="h-24 bg-zinc-800/40" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-800/60 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-800/40 rounded-lg w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-800/40 rounded-lg" />)}
        </div>
        <div className="h-2 bg-zinc-800/40 rounded-full" />
        <div className="h-8 bg-zinc-800/30 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onSearch, loading }: {
  filters: SearchFilters;
  onChange: (k: keyof SearchFilters, v: any) => void;
  onSearch: () => void;
  loading: boolean;
}) {
  const set = (k: keyof SearchFilters) => (v: any) => onChange(k, v);
  const hasFilters = Object.entries(filters).some(([k, v]) => {
    const def = DEFAULT_FILTERS[k as keyof SearchFilters];
    return v !== def;
  });

  return (
    <div className="w-64 shrink-0 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-200">Filters</span>
        </div>
      </div>

      {/* Filter sections */}
      <div className="space-y-4">
        <FilterSection label="Country" icon={Globe}>
          <SelectFilter
            value={filters.country}
            onChange={set("country")}
            placeholder="Any country"
            options={COUNTRIES}
          />
        </FilterSection>

        <FilterSection label="Niche" icon={Sparkles}>
          <SelectFilter
            value={filters.niche}
            onChange={set("niche")}
            placeholder="Any niche"
            options={NICHES}
          />
        </FilterSection>

        <FilterSection label="Category" icon={Package}>
          <SelectFilter
            value={filters.category}
            onChange={set("category")}
            placeholder="Any category"
            options={CATEGORIES}
          />
        </FilterSection>

        <FilterSection label="Supplier Platform" icon={ShoppingBag}>
          <SelectFilter
            value={filters.supplier}
            onChange={set("supplier")}
            placeholder="Any supplier"
            options={SUPPLIERS}
          />
        </FilterSection>

        <FilterSection label={`Max Shipping: ${filters.shippingTimeMax}d`} icon={Truck}>
          <Slider
            value={[filters.shippingTimeMax]}
            onValueChange={([v]) => onChange("shippingTimeMax", v)}
            min={1} max={30} step={1}
            className="mt-1"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>1 day</span><span>30 days</span>
          </div>
        </FilterSection>

        <FilterSection label={`Min Profit Margin: ${filters.profitMarginMin}%`} icon={DollarSign}>
          <Slider
            value={[filters.profitMarginMin]}
            onValueChange={([v]) => onChange("profitMarginMin", v)}
            min={0} max={90} step={5}
            className="mt-1"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>0%</span><span>90%</span>
          </div>
        </FilterSection>

        <FilterSection label={`Min Rating: ${filters.productRatingMin > 0 ? filters.productRatingMin + "★" : "Any"}`} icon={Star}>
          <div className="flex gap-1.5 mt-1">
            {[0, 3, 3.5, 4, 4.5].map(v => (
              <button
                key={v}
                onClick={() => onChange("productRatingMin", v)}
                className={cn(
                  "flex-1 py-1 rounded-lg text-xs font-medium border transition-all",
                  filters.productRatingMin === v
                    ? "bg-white/10 border-zinc-600 text-white"
                    : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                {v === 0 ? "Any" : `${v}★`}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label={`Min Trend Score: ${filters.trendScoreMin}`} icon={TrendingUp}>
          <Slider
            value={[filters.trendScoreMin]}
            onValueChange={([v]) => onChange("trendScoreMin", v)}
            min={0} max={90} step={10}
            className="mt-1"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>0</span><span>90+</span>
          </div>
        </FilterSection>

        <FilterSection label={`Price: $${filters.priceMin}–$${filters.priceMax}`} icon={DollarSign}>
          <Slider
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={([a, b]) => { onChange("priceMin", a); onChange("priceMax", b); }}
            min={0} max={500} step={10}
            className="mt-1"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>$0</span><span>$500</span>
          </div>
        </FilterSection>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
        <Button
          onClick={onSearch}
          disabled={loading}
          className="w-full bg-white text-black hover:bg-zinc-100 font-semibold h-9 text-sm gap-2"
        >
          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          {loading ? "Discovering..." : "Discover Products"}
        </Button>
      </div>
    </div>
  );
}

function FilterSection({ label, icon: Icon, children }: {
  label: string; icon: React.FC<any>; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">{label}</span>
      </div>
      {children}
    </div>
  );
}

function SelectFilter({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string; options: string[];
}) {
  return (
    <Select value={value || "__any__"} onValueChange={v => onChange(v === "__any__" ? "" : v)}>
      <SelectTrigger className="h-8 bg-zinc-900/60 border-zinc-800 text-xs text-zinc-300 focus:ring-0 focus:border-zinc-700">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-700 text-xs">
        <SelectItem value="__any__" className="text-zinc-400">{placeholder}</SelectItem>
        {options.map(opt => (
          <SelectItem key={opt} value={opt} className="text-zinc-200">{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Sort Bar ─────────────────────────────────────────────────────────────────

type SortKey = "aiScore" | "profitMargin" | "estimatedMonthlyRevenue" | "trendScore" | "riskScore";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "aiScore", label: "AI Score" },
  { key: "profitMargin", label: "Profit %" },
  { key: "estimatedMonthlyRevenue", label: "Revenue" },
  { key: "trendScore", label: "Trend" },
  { key: "riskScore", label: "Lowest Risk" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DiscoveryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<DiscoveredProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("aiScore");
  const [filterOpen, setFilterOpen] = useState(true);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const handleChange = useCallback((k: keyof SearchFilters, v: any) => {
    setFilters(prev => ({ ...prev, [k]: v }));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch("/api/discovery/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...filters, count: 12 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Discovery failed");
      }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleImport = useCallback((product: DiscoveredProduct) => {
    setImportedIds(prev => new Set([...prev, product.id]));
  }, []);

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "riskScore") return a.riskScore - b.riskScore;
    return (b[sortBy] as number) - (a[sortBy] as number);
  });

  const badgeCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.recommendationBadge] = (acc[p.recommendationBadge] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        <DashSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
    {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
              <Search className="h-4 w-4 text-violet-400" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Product Discovery</h1>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-zinc-500 ml-10.5">
            Discover winning products ranked by demand, profit, and market opportunity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="h-8 gap-1.5 text-zinc-400 hover:text-zinc-200 text-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filterOpen ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </div>

      {/* Stats bar — shown after search */}
      <AnimatePresence>
        {products.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-800/60 px-6 overflow-hidden"
          >
            <div className="flex items-center gap-6 py-2.5">
              <span className="text-xs text-zinc-500">
                <span className="text-white font-semibold">{products.length}</span> products found
              </span>
              <div className="flex items-center gap-2">
                {Object.entries(badgeCounts).map(([badge, count]) => {
                  const cfg = getBadgeConfig(badge);
                  const Icon = cfg.icon;
                  return (
                    <span key={badge} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", cfg.bg, cfg.color)}>
                      <Icon className="h-2.5 w-2.5" />
                      {count} {badge}
                    </span>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-zinc-500">Sort by</span>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg font-medium transition-all",
                      sortBy === opt.key
                        ? "bg-white/10 text-white border border-zinc-700"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter Panel */}
        <AnimatePresence initial={false}>
          {filterOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden shrink-0"
            >
              <div className="w-64 h-full overflow-y-auto border-r border-zinc-800/60 p-5">
                <FilterPanel
                  filters={filters}
                  onChange={handleChange}
                  onSearch={handleSearch}
                  loading={loading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Results grid */}
          {!loading && sorted.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {sorted.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onImport={handleImport}
                />
              ))}
            </div>
          )}

          {/* Empty — not searched yet */}
          {!loading && !searched && (
            <EmptyState />
          )}

          {/* Empty — searched but no results */}
          {!loading && searched && sorted.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package className="h-10 w-10 text-zinc-700 mb-3" />
              <p className="text-zinc-400 font-medium">No products found</p>
              <p className="text-zinc-600 text-sm mt-1">Try broadening your filters</p>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Glow orb */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
          <Search className="h-10 w-10 text-violet-400" />
        </div>
        <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
        Discover Winning Products
      </h2>
      <p className="text-zinc-500 max-w-md mb-8 text-sm leading-relaxed">
        Set your filters and let the AI engine surface the best dropshipping opportunities —
        ranked by demand, profit margin, supplier trust, and trend growth.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {[
          { icon: BarChart3, label: "AI-ranked by 7 signals" },
          { icon: TrendingUp, label: "Real-time trend scoring" },
          { icon: Shield, label: "Competition analysis" },
          { icon: DollarSign, label: "Revenue estimates" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
            <Icon className="h-3 w-3 text-violet-400" />
            {label}
          </span>
        ))}
      </div>

      <p className="text-xs text-zinc-600">
        Configure filters on the left and click <span className="text-zinc-400 font-medium">Discover Products</span>
      </p>
    </div>
  );
}
