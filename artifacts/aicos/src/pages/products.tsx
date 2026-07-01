import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Package, Search, RefreshCw, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Loader2, X, Save,
  ExternalLink, Tag, DollarSign, ShoppingBag, ArrowUpRight,
  Layers, Globe, Image, FileText, TrendingUp, Percent, Gift,
  Shuffle, ArrowUp, Wand2, Eye, Send
} from "lucide-react";
import { DashSidebar } from "@/components/dashboard/dash-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE = "/api";

interface AiOptimization {
  seoTitle: string;
  seoDescription: string;
  productDescription: string;
  bulletPoints: string[];
  metaDescription: string;
  altText: string;
  collectionSuggestions: string[];
  tagSuggestions: string[];
  pricingSuggestion: { suggestedPrice: string; reasoning: string };
  discountSuggestion: { percentage: number; occasion: string; reasoning: string };
  bundleSuggestions: { name: string; rationale: string }[];
  crossSellSuggestions: string[];
  upsellSuggestions: string[];
  brandTone: string;
  generatedAt: string;
}

interface Product {
  id: string;
  title: string;
  price: string | null;
  images: { src: string; alt: string | null }[];
  status: string;
  aiOptimizationStatus: "pending" | "generating" | "done" | "failed";
  aiOptimization: AiOptimization | null;
  vendor: string | null;
  productType: string | null;
  tags: string[];
}

type Tab = "seo" | "content" | "collections" | "pricing" | "commerce" | "brand";

const STATUS_CONFIG = {
  pending:   { label: "Pending",    color: "text-zinc-400",   bg: "bg-zinc-400/10",   Icon: Clock },
  generating:{ label: "Generating", color: "text-amber-400",  bg: "bg-amber-400/10",  Icon: Loader2 },
  done:      { label: "Ready",      color: "text-emerald-400",bg: "bg-emerald-400/10",Icon: CheckCircle2 },
  failed:    { label: "Failed",     color: "text-red-400",    bg: "bg-red-400/10",    Icon: AlertCircle },
};

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "seo",        label: "SEO",         icon: Globe },
  { id: "content",    label: "Content",     icon: FileText },
  { id: "collections",label: "Collections", icon: Layers },
  { id: "pricing",    label: "Pricing",     icon: DollarSign },
  { id: "commerce",   label: "Commerce",    icon: ShoppingBag },
  { id: "brand",      label: "Brand",       icon: Sparkles },
];

function useProductsApi(storeId: string | null) {
  const headers = { "Content-Type": "application/json" };

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    if (!storeId) return [];
    const res = await fetch(`${API_BASE}/stores/${storeId}/products/ai-queue?limit=100`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products ?? [];
  }, [storeId]);

  const triggerOptimize = useCallback(async (productId: string) => {
    if (!storeId) return;
    await fetch(`${API_BASE}/stores/${storeId}/products/${productId}/ai-optimize`, {
      method: "POST", credentials: "include", headers,
    });
  }, [storeId]);

  const saveOptimization = useCallback(async (productId: string, optimization: Partial<AiOptimization>) => {
    if (!storeId) return;
    const res = await fetch(`${API_BASE}/stores/${storeId}/products/${productId}/ai-optimization`, {
      method: "PATCH", credentials: "include", headers,
      body: JSON.stringify(optimization),
    });
    if (!res.ok) throw new Error("Failed to save");
    return res.json();
  }, [storeId]);

  const publishOptimization = useCallback(async (productId: string) => {
    if (!storeId) return;
    const res = await fetch(`${API_BASE}/stores/${storeId}/products/${productId}/ai-publish`, {
      method: "POST", credentials: "include", headers,
    });
    if (!res.ok) throw new Error("Failed to publish");
    return res.json();
  }, [storeId]);

  return { fetchProducts, triggerOptimize, saveOptimization, publishOptimization };
}

function TagList({ items, onEdit }: { items: string[]; onEdit: (items: string[]) => void }) {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700/60">
            {t}
            <button onClick={() => onEdit(items.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-red-400 ml-0.5">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onEdit([...items, input.trim()]); setInput(""); } }}
          placeholder="Add item, press Enter"
          className="flex-1 text-xs bg-zinc-900 border border-zinc-700/60 rounded-md px-2.5 py-1.5 text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-500"
        />
      </div>
    </div>
  );
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-zinc-600 text-xs mt-2 shrink-0">•</span>
          <textarea
            value={b}
            onChange={e => { const n = [...bullets]; n[i] = e.target.value; onChange(n); }}
            rows={2}
            className="flex-1 text-xs bg-zinc-900 border border-zinc-700/60 rounded-md px-2.5 py-1.5 text-zinc-300 outline-none focus:border-zinc-500 resize-none"
          />
          <button onClick={() => onChange(bullets.filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400 mt-2">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...bullets, ""])}
        className="text-xs text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-700/60 rounded-md px-3 py-1.5 w-full transition-colors"
      >
        + Add bullet point
      </button>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        {hint && <span className="text-xs text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function OptimizationEditor({
  product,
  onSave,
  onPublish,
  onRegenerate,
  saving,
  publishing,
}: {
  product: Product;
  onSave: (data: Partial<AiOptimization>) => Promise<void>;
  onPublish: () => Promise<void>;
  onRegenerate: () => void;
  saving: boolean;
  publishing: boolean;
}) {
  const ai = product.aiOptimization;
  const [draft, setDraft] = useState<Partial<AiOptimization>>(ai ?? {});
  const [activeTab, setActiveTab] = useState<Tab>("seo");

  const set = <K extends keyof AiOptimization>(key: K, val: AiOptimization[K]) =>
    setDraft(d => ({ ...d, [key]: val }));

  if (!ai) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-300">No AI content yet</p>
          <p className="text-xs text-zinc-600 mt-1">Generate AI optimization to see suggestions here</p>
        </div>
        <Button onClick={onRegenerate} size="sm" className="bg-violet-600 hover:bg-violet-500 text-white">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Generate Now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-0.5 px-4 pt-3 border-b border-zinc-800/60 shrink-0 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap",
              activeTab === id
                ? "text-white bg-zinc-800 border-b-2 border-violet-500"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "seo" && (
          <>
            <Field label="SEO Title" hint="(60 chars max)">
              <input
                value={draft.seoTitle ?? ""}
                onChange={e => set("seoTitle", e.target.value)}
                maxLength={60}
                className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
              <p className="text-xs text-zinc-600">{(draft.seoTitle ?? "").length}/60 characters</p>
            </Field>
            <Field label="SEO Description" hint="(155 chars max)">
              <textarea
                value={draft.seoDescription ?? ""}
                onChange={e => set("seoDescription", e.target.value)}
                maxLength={155}
                rows={3}
                className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500 resize-none"
              />
              <p className="text-xs text-zinc-600">{(draft.seoDescription ?? "").length}/155 characters</p>
            </Field>
            <Field label="Meta Description" hint="(155 chars max)">
              <textarea
                value={draft.metaDescription ?? ""}
                onChange={e => set("metaDescription", e.target.value)}
                maxLength={155}
                rows={3}
                className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500 resize-none"
              />
            </Field>
            <Field label="Image Alt Text">
              <input
                value={draft.altText ?? ""}
                onChange={e => set("altText", e.target.value)}
                className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
              />
            </Field>
          </>
        )}

        {activeTab === "content" && (
          <>
            <Field label="Product Description">
              <textarea
                value={draft.productDescription ?? ""}
                onChange={e => set("productDescription", e.target.value)}
                rows={8}
                className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500 resize-none"
              />
            </Field>
            <Field label="Bullet Points">
              <BulletEditor
                bullets={draft.bulletPoints ?? []}
                onChange={b => set("bulletPoints", b)}
              />
            </Field>
          </>
        )}

        {activeTab === "collections" && (
          <>
            <Field label="Suggested Collections">
              <TagList
                items={draft.collectionSuggestions ?? []}
                onEdit={v => set("collectionSuggestions", v)}
              />
            </Field>
            <Field label="Suggested Tags">
              <TagList
                items={draft.tagSuggestions ?? []}
                onEdit={v => set("tagSuggestions", v)}
              />
            </Field>
          </>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Pricing Suggestion</span>
              </div>
              <Field label="Suggested Price">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">$</span>
                  <input
                    value={draft.pricingSuggestion?.suggestedPrice ?? ""}
                    onChange={e => set("pricingSuggestion", { ...draft.pricingSuggestion!, suggestedPrice: e.target.value })}
                    className="flex-1 text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                  />
                </div>
              </Field>
              <Field label="Reasoning">
                <p className="text-xs text-zinc-400 bg-zinc-800/50 rounded-md px-3 py-2">{draft.pricingSuggestion?.reasoning}</p>
              </Field>
            </div>

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Discount Suggestion</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount %">
                  <input
                    type="number"
                    value={draft.discountSuggestion?.percentage ?? 0}
                    onChange={e => set("discountSuggestion", { ...draft.discountSuggestion!, percentage: Number(e.target.value) })}
                    className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                  />
                </Field>
                <Field label="Occasion">
                  <input
                    value={draft.discountSuggestion?.occasion ?? ""}
                    onChange={e => set("discountSuggestion", { ...draft.discountSuggestion!, occasion: e.target.value })}
                    className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                  />
                </Field>
              </div>
              <Field label="Reasoning">
                <p className="text-xs text-zinc-400 bg-zinc-800/50 rounded-md px-3 py-2">{draft.discountSuggestion?.reasoning}</p>
              </Field>
            </div>
          </div>
        )}

        {activeTab === "commerce" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Bundle Suggestions</span>
              </div>
              <div className="space-y-3">
                {(draft.bundleSuggestions ?? []).map((b, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-3 space-y-1.5">
                    <input
                      value={b.name}
                      onChange={e => { const n = [...(draft.bundleSuggestions ?? [])]; n[i] = { ...n[i], name: e.target.value }; set("bundleSuggestions", n); }}
                      className="w-full text-xs font-medium bg-transparent text-zinc-200 outline-none border-b border-zinc-700/60 pb-1"
                    />
                    <p className="text-xs text-zinc-500">{b.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shuffle className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Cross-Sell Suggestions</span>
              </div>
              <TagList
                items={draft.crossSellSuggestions ?? []}
                onEdit={v => set("crossSellSuggestions", v)}
              />
            </div>

            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Upsell Suggestions</span>
              </div>
              <TagList
                items={draft.upsellSuggestions ?? []}
                onEdit={v => set("upsellSuggestions", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "brand" && (
          <Field label="Brand Tone">
            <textarea
              value={draft.brandTone ?? ""}
              onChange={e => set("brandTone", e.target.value)}
              rows={5}
              className="w-full text-sm bg-zinc-900 border border-zinc-700/60 rounded-md px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500 resize-none"
            />
            <p className="text-xs text-zinc-600">Define how this product should sound in all marketing copy</p>
          </Field>
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-zinc-800/60 p-4 flex items-center gap-3 shrink-0 bg-zinc-950/80">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Regenerate
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSave(draft)}
          disabled={saving}
          className="border-zinc-700 text-zinc-300 hover:text-white"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Save Draft
        </Button>
        <Button
          size="sm"
          onClick={onPublish}
          disabled={publishing}
          className="bg-violet-600 hover:bg-violet-500 text-white"
        >
          {publishing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
          Publish to Shopify
        </Button>
      </div>
    </div>
  );
}

function ProductCard({ product, selected, onClick }: { product: Product; selected: boolean; onClick: () => void }) {
  const cfg = STATUS_CONFIG[product.aiOptimizationStatus];
  const Icon = cfg.Icon;
  const img = product.images?.[0]?.src;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-zinc-800/40 hover:bg-white/3",
        selected && "bg-violet-500/8 border-l-2 border-l-violet-500"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
        {img ? (
          <img src={img} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-4 w-4 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-200 truncate">{product.title}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{product.price ? `$${product.price}` : "—"} · {product.vendor ?? "Unknown vendor"}</p>
      </div>
      <div className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0", cfg.bg, cfg.color)}>
        <Icon className={cn("h-3 w-3", product.aiOptimizationStatus === "generating" && "animate-spin")} />
        <span>{cfg.label}</span>
      </div>
    </button>
  );
}

export function ProductsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const storeId = null as string | null;
  const api = useProductsApi(storeId);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchProducts();
      setProducts(data);
    } catch {
      showToast("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const selected = products.find(p => p.id === selectedId);

  const handleOptimize = async (productId: string) => {
    await api.triggerOptimize(productId);
    setProducts(ps => ps.map(p => p.id === productId ? { ...p, aiOptimizationStatus: "generating" } : p));
    showToast("AI generation started…");
    setTimeout(loadProducts, 4000);
  };

  const handleSave = async (data: Partial<AiOptimization>) => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.saveOptimization(selectedId, data);
      setProducts(ps => ps.map(p => p.id === selectedId ? { ...p, aiOptimization: { ...p.aiOptimization!, ...data } } : p));
      showToast("Draft saved");
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedId) return;
    setPublishing(true);
    try {
      await api.publishOptimization(selectedId);
      showToast("Published to Shopify ✓");
    } catch {
      showToast("Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.aiOptimizationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: products.length,
    pending: products.filter(p => p.aiOptimizationStatus === "pending").length,
    generating: products.filter(p => p.aiOptimizationStatus === "generating").length,
    done: products.filter(p => p.aiOptimizationStatus === "done").length,
    failed: products.filter(p => p.aiOptimizationStatus === "failed").length,
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        <div className="fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto flex-shrink-0">
          <DashSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="flex items-center gap-3 h-14 px-4 sm:px-6 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h1 className="text-sm font-semibold text-white">AI Product Optimization</h1>
            </div>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              onClick={loadProducts}
              disabled={loading}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </Button>
          </header>

          {/* Body — 3-panel layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Product list */}
            <div className="w-72 flex flex-col border-r border-zinc-800/60 bg-zinc-950 shrink-0">
              {/* Search */}
              <div className="p-3 border-b border-zinc-800/40">
                <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-2.5 py-1.5">
                  <Search className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div className="flex gap-1 p-2 border-b border-zinc-800/40 overflow-x-auto">
                {(["all", "done", "generating", "pending", "failed"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md whitespace-nowrap transition-colors shrink-0",
                      statusFilter === s
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {s === "all" ? "All" : STATUS_CONFIG[s].label} ({counts[s]})
                  </button>
                ))}
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                  </div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 px-4 text-center">
                    <Package className="h-8 w-8 text-zinc-700" />
                    <div>
                      <p className="text-sm text-zinc-400 font-medium">No products found</p>
                      <p className="text-xs text-zinc-600 mt-1">Import products from Shopify to start AI optimization</p>
                    </div>
                    <Button size="sm" onClick={loadProducts} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white text-xs">
                      Refresh
                    </Button>
                  </div>
                )}
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    selected={selectedId === p.id}
                    onClick={() => setSelectedId(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right: Editor panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
              {selected ? (
                <>
                  {/* Product header */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800/60 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                      {selected.images?.[0]?.src ? (
                        <img src={selected.images[0].src} alt={selected.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-3.5 w-3.5 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{selected.title}</p>
                      <p className="text-xs text-zinc-500">{selected.vendor} {selected.price && `· $${selected.price}`}</p>
                    </div>
                    {selected.aiOptimizationStatus === "pending" || selected.aiOptimizationStatus === "failed" ? (
                      <Button
                        size="sm"
                        onClick={() => handleOptimize(selected.id)}
                        className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
                      >
                        <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                        Generate AI
                      </Button>
                    ) : selected.aiOptimizationStatus === "generating" ? (
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generating…
                      </div>
                    ) : null}
                  </div>

                  <OptimizationEditor
                    product={selected}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    onRegenerate={() => handleOptimize(selected.id)}
                    saving={saving}
                    publishing={publishing}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Product Optimization</p>
                    <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
                      Select a product to review and edit AI-generated SEO, descriptions, tags, pricing, bundles, cross-sells, upsells, and brand tone.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["SEO", "Descriptions", "Tags", "Pricing", "Bundles", "Cross-sell", "Upsell", "Brand Tone"].map(f => (
                      <span key={f} className="text-xs bg-zinc-900 border border-zinc-800/60 text-zinc-400 px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-sm px-4 py-2.5 rounded-xl shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
