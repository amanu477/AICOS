import { useState, useEffect } from "react";
import { Truck, Search, Package, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { DashLayout, NoStoreState } from "@/components/dashboard/dash-layout";
import { useCurrentStore } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VendorStat {
  vendor: string;
  productCount: number;
  activeCount: number;
}

export function SuppliersPage() {
  const { storeId, loading: storeLoading } = useCurrentStore();
  const [vendors, setVendors] = useState<VendorStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      // Fetch products and group by vendor
      const r = await fetch(`/api/stores/${storeId}/products?limit=250`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      const products: any[] = data.products ?? [];

      const map: Record<string, { total: number; active: number }> = {};
      for (const p of products) {
        const v = p.vendor ?? "Unknown";
        if (!map[v]) map[v] = { total: 0, active: 0 };
        map[v].total++;
        if (p.status === "active") map[v].active++;
      }
      setVendors(
        Object.entries(map)
          .map(([vendor, s]) => ({ vendor, productCount: s.total, activeCount: s.active }))
          .sort((a, b) => b.productCount - a.productCount)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [storeId]);

  const filtered = vendors.filter(v =>
    !search || v.vendor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashLayout
      title="Suppliers"
      icon={Truck}
      actions={
        <Button size="sm" variant="outline" onClick={load} disabled={loading} className="border-zinc-700 text-zinc-400 hover:text-white">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      }
    >
      {storeLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      ) : !storeId ? (
        <NoStoreState message="Connect your Shopify store to see your product vendors and suppliers." />
      ) : (
        <div className="max-w-4xl space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500 mb-1">Total vendors</p>
              <p className="text-2xl font-bold text-white">{vendors.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500 mb-1">Total products</p>
              <p className="text-2xl font-bold text-white">{vendors.reduce((s, v) => s + v.productCount, 0)}</p>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-xs text-zinc-500 mb-1">Active products</p>
              <p className="text-2xl font-bold text-white">{vendors.reduce((s, v) => s + v.activeCount, 0)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2 max-w-xs">
            <Search className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vendors…"
              className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none"
            />
          </div>

          {/* Vendor table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Truck className="h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-400 font-medium">No vendors found</p>
              <p className="text-xs text-zinc-600">Sync your Shopify products to see supplier data</p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-900/60">
                <span className="col-span-6 text-xs font-medium text-zinc-500 uppercase tracking-wide">Vendor</span>
                <span className="col-span-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Products</span>
                <span className="col-span-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Active</span>
              </div>
              {filtered.map((v, i) => (
                <div
                  key={v.vendor}
                  className={cn("grid grid-cols-12 items-center px-4 py-3.5 hover:bg-white/3 transition-colors", i > 0 && "border-t border-zinc-800/40")}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      <Truck className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                    <span className="text-sm font-medium text-white truncate">{v.vendor}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-zinc-600" />
                      <span className="text-sm text-zinc-300">{v.productCount}</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      v.activeCount > 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-zinc-400/10 text-zinc-400"
                    )}>
                      {v.activeCount} active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coming soon section */}
          <div className="rounded-xl border border-dashed border-zinc-700/60 p-6 text-center space-y-2">
            <p className="text-sm font-medium text-zinc-400">Dedicated supplier management coming soon</p>
            <p className="text-xs text-zinc-600">Track lead times, minimum order quantities, contact info, and performance metrics for each supplier.</p>
          </div>
        </div>
      )}
    </DashLayout>
  );
}
