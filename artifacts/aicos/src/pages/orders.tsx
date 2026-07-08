import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, RefreshCw, Loader2, Package,
  MapPin, User, CreditCard, Truck, ChevronRight, X
} from "lucide-react";
import { DashLayout, NoStoreState } from "@/components/dashboard/dash-layout";
import { useCurrentStore } from "@/lib/use-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FinancialStatus = "pending" | "authorized" | "partially_paid" | "paid" | "partially_refunded" | "refunded" | "voided";
type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "restocked";

interface Order {
  id: string;
  orderNumber: number | null;
  name: string | null;
  email: string | null;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  totalPrice: string | null;
  currency: string | null;
  lineItems: Array<{ id: string; title: string; quantity: number; price: string; variantTitle?: string }>;
  shippingAddress: { firstName?: string; lastName?: string; address1?: string; city?: string; country?: string; zip?: string } | null;
  shopifyCreatedAt: string | null;
  tags: string[];
}

const FINANCIAL_COLORS: Record<FinancialStatus, string> = {
  pending: "text-amber-400 bg-amber-400/10",
  authorized: "text-blue-400 bg-blue-400/10",
  partially_paid: "text-amber-400 bg-amber-400/10",
  paid: "text-emerald-400 bg-emerald-400/10",
  partially_refunded: "text-orange-400 bg-orange-400/10",
  refunded: "text-red-400 bg-red-400/10",
  voided: "text-zinc-400 bg-zinc-400/10",
};

const FULFILLMENT_COLORS: Record<FulfillmentStatus, string> = {
  unfulfilled: "text-amber-400 bg-amber-400/10",
  partial: "text-blue-400 bg-blue-400/10",
  fulfilled: "text-emerald-400 bg-emerald-400/10",
  restocked: "text-zinc-400 bg-zinc-400/10",
};

type FilterTab = "all" | "unfulfilled" | "paid" | "refunded";
const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All orders" },
  { id: "unfulfilled", label: "Unfulfilled" },
  { id: "paid", label: "Paid" },
  { id: "refunded", label: "Refunded" },
];

function fmt(price: string | null, currency = "USD") {
  if (!price) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(price));
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function OrderRow({ order, selected, onClick }: { order: Order; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-zinc-800/40 hover:bg-white/3 group",
        selected && "bg-white/5 border-l-2 border-l-white"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">{order.name ?? `#${order.orderNumber}`}</span>
          <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", FULFILLMENT_COLORS[order.fulfillmentStatus])}>
            {order.fulfillmentStatus}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{order.email ?? "No email"} · {fmtDate(order.shopifyCreatedAt)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-white">{fmt(order.totalPrice, order.currency ?? "USD")}</p>
        <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", FINANCIAL_COLORS[order.financialStatus])}>
          {order.financialStatus}
        </span>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
    </button>
  );
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800/60 shrink-0">
        <div>
          <p className="text-sm font-semibold text-white">{order.name ?? `#${order.orderNumber}`}</p>
          <p className="text-xs text-zinc-500">{fmtDate(order.shopifyCreatedAt)}</p>
        </div>
        <div className="flex-1" />
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", FINANCIAL_COLORS[order.financialStatus])}>
          {order.financialStatus}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", FULFILLMENT_COLORS[order.fulfillmentStatus])}>
          {order.fulfillmentStatus}
        </span>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 ml-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Line items */}
        <section>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Package className="h-3 w-3" /> Items
          </h3>
          <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
            {(order.lineItems ?? []).map((item, i) => (
              <div key={item.id ?? i} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-zinc-800/40")}>
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <Package className="h-3.5 w-3.5 text-zinc-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{item.title}</p>
                  {item.variantTitle && <p className="text-xs text-zinc-500">{item.variantTitle}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-300">{fmt(item.price)}</p>
                  <p className="text-xs text-zinc-600">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="rounded-xl border border-zinc-800/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40">
            <span className="text-xs text-zinc-500">Total</span>
            <span className="text-sm font-semibold text-white">{fmt(order.totalPrice, order.currency ?? "USD")}</span>
          </div>
        </section>

        {/* Customer */}
        {order.email && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <User className="h-3 w-3" /> Customer
            </h3>
            <div className="rounded-xl border border-zinc-800/60 px-4 py-3 space-y-1">
              <p className="text-xs text-zinc-300">{order.email}</p>
            </div>
          </section>
        )}

        {/* Shipping */}
        {order.shippingAddress && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Shipping address
            </h3>
            <div className="rounded-xl border border-zinc-800/60 px-4 py-3 space-y-0.5">
              {[
                `${order.shippingAddress.firstName ?? ""} ${order.shippingAddress.lastName ?? ""}`.trim(),
                order.shippingAddress.address1,
                `${order.shippingAddress.city ?? ""} ${order.shippingAddress.zip ?? ""}`.trim(),
                order.shippingAddress.country,
              ].filter(Boolean).map((line, i) => (
                <p key={i} className="text-xs text-zinc-300">{line}</p>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {order.tags?.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {order.tags.map(tag => (
                <span key={tag} className="text-xs bg-zinc-800 border border-zinc-700/60 text-zinc-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { storeId, loading: storeLoading } = useCurrentStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadOrders = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (tab === "unfulfilled") params.set("fulfillment_status", "unfulfilled");
      if (tab === "paid") params.set("financial_status", "paid");
      if (tab === "refunded") params.set("financial_status", "refunded");
      const r = await fetch(`/api/stores/${storeId}/orders?${params}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [storeId, tab]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter(o =>
    !search ||
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.orderNumber).includes(search)
  );

  const selected = orders.find(o => o.id === selectedId);

  return (
    <DashLayout
      title="Orders"
      icon={ShoppingCart}
      noScroll
      actions={
        <Button size="sm" variant="outline" onClick={loadOrders} disabled={loading} className="border-zinc-700 text-zinc-400 hover:text-white">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      }
    >
      {storeLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      ) : !storeId ? (
        <NoStoreState message="Connect your Shopify store to see and manage orders." />
      ) : (
        <div className="flex h-full">
          {/* Left: order list */}
          <div className={cn("flex flex-col border-r border-zinc-800/60 bg-zinc-950 shrink-0 transition-all", selected ? "w-80" : "flex-1")}>
            {/* Filter tabs */}
            <div className="flex border-b border-zinc-800/60 overflow-x-auto shrink-0">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSelectedId(null); }}
                  className={cn(
                    "px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2",
                    tab === t.id ? "text-white border-white" : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-zinc-800/40 shrink-0">
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search orders, emails…"
                  className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none"
                />
              </div>
            </div>

            {/* Count */}
            {!loading && (
              <div className="px-4 py-2 shrink-0">
                <span className="text-xs text-zinc-600">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 px-4 text-center">
                  <ShoppingCart className="h-8 w-8 text-zinc-700" />
                  <div>
                    <p className="text-sm text-zinc-400 font-medium">No orders found</p>
                    <p className="text-xs text-zinc-600 mt-1">Orders from your Shopify store will appear here</p>
                  </div>
                </div>
              )}
              {filtered.map(o => (
                <OrderRow
                  key={o.id}
                  order={o}
                  selected={selectedId === o.id}
                  onClick={() => setSelectedId(o.id === selectedId ? null : o.id)}
                />
              ))}
            </div>
          </div>

          {/* Right: detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col overflow-hidden bg-zinc-950 border-l border-zinc-800/60"
              >
                <OrderDetail order={selected} onClose={() => setSelectedId(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </DashLayout>
  );
}
