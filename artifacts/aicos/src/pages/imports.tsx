import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Play, AlertCircle } from "lucide-react";
import { DashLayout, NoStoreState } from "@/components/dashboard/dash-layout";
import { useCurrentStore } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SyncStatus = "queued" | "running" | "done" | "failed" | "cancelled";
type SyncType = "full_sync" | "products" | "collections" | "customers" | "orders" | "inventory" | "variants";

interface SyncJob {
  id: string;
  type: SyncType;
  status: SyncStatus;
  totalRecords: number;
  processedRecords: number;
  errorMessage: string | null;
  errorCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<SyncStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  queued:    { icon: Clock,         color: "text-zinc-400",   bg: "bg-zinc-400/10",   label: "Queued" },
  running:   { icon: Loader2,       color: "text-blue-400",   bg: "bg-blue-400/10",   label: "Running" },
  done:      { icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-400/10",label: "Done" },
  failed:    { icon: XCircle,       color: "text-red-400",    bg: "bg-red-400/10",    label: "Failed" },
  cancelled: { icon: AlertCircle,   color: "text-zinc-400",   bg: "bg-zinc-400/10",   label: "Cancelled" },
};

const TYPE_LABELS: Record<SyncType, string> = {
  full_sync:   "Full sync",
  products:    "Products",
  collections: "Collections",
  customers:   "Customers",
  orders:      "Orders",
  inventory:   "Inventory",
  variants:    "Variants",
};

function fmtDuration(start: string | null, end: string | null) {
  if (!start) return null;
  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : Date.now();
  const secs = Math.round((to - from) / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.round(secs / 60)}m ${secs % 60}s`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-500 tabular-nums w-10 text-right">{pct}%</span>
    </div>
  );
}

export function ImportsPage() {
  const { storeId, store, loading: storeLoading } = useCurrentStore();
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/stores/${storeId}/sync-jobs?limit=30`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      setJobs(data.jobs ?? []);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  // Poll if any job is running
  useEffect(() => {
    const hasRunning = jobs.some(j => j.status === "queued" || j.status === "running");
    if (!hasRunning) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [jobs, load]);

  const triggerSync = async (type: SyncType) => {
    if (!storeId) return;
    setTriggering(true);
    try {
      await fetch(`/api/shopify/sync/${storeId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      await load();
    } finally {
      setTriggering(false);
    }
  };

  const running = jobs.filter(j => j.status === "running" || j.status === "queued");
  const done = jobs.filter(j => j.status === "done" || j.status === "failed" || j.status === "cancelled");

  return (
    <DashLayout
      title="Imports"
      icon={Download}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => triggerSync("products")}
            disabled={triggering || !storeId}
            className="border-zinc-700 text-zinc-400 hover:text-white text-xs"
          >
            {triggering ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
            Sync products
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={loading} className="border-zinc-700 text-zinc-400 hover:text-white">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      }
    >
      {storeLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      ) : !storeId ? (
        <NoStoreState message="Connect your Shopify store to sync and import products, orders, and customers." />
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Store info */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full shrink-0", store?.syncStatus === "syncing" ? "bg-blue-400 animate-pulse" : "bg-emerald-400")} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{store?.shopifyDomain}</p>
              <p className="text-xs text-zinc-500">
                {store?.syncStatus === "syncing" ? "Syncing…" : store?.lastSyncedAt ? `Last synced ${fmtDate(store.lastSyncedAt)}` : "Never synced"}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {(["products", "orders", "customers"] as SyncType[]).map(t => (
                <button
                  key={t}
                  onClick={() => triggerSync(t)}
                  disabled={triggering}
                  className="text-xs border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-500 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Active jobs */}
          {running.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">In progress</h2>
              <div className="space-y-2">
                {running.map(job => {
                  const cfg = STATUS_CONFIG[job.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={job.id} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4 shrink-0", cfg.color, job.status === "running" && "animate-spin")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{TYPE_LABELS[job.type]}</p>
                          <p className="text-xs text-zinc-500">{job.processedRecords} / {job.totalRecords || "?"} records</p>
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>{cfg.label}</span>
                      </div>
                      {(job.totalRecords ?? 0) > 0 && (
                        <ProgressBar value={job.processedRecords ?? 0} max={job.totalRecords ?? 0} />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* History */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">History</h2>
            {loading && jobs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
              </div>
            ) : done.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center rounded-xl border border-zinc-800/60">
                <Download className="h-7 w-7 text-zinc-700" />
                <p className="text-sm text-zinc-400 font-medium">No sync history</p>
                <p className="text-xs text-zinc-600">Trigger a sync above to import data from Shopify</p>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
                {done.map((job, i) => {
                  const cfg = STATUS_CONFIG[job.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={job.id} className={cn("flex items-center gap-3 px-4 py-3.5", i > 0 && "border-t border-zinc-800/40")}>
                      <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-200">{TYPE_LABELS[job.type]}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {job.processedRecords} records · {fmtDate(job.createdAt)}
                          {job.startedAt && ` · ${fmtDuration(job.startedAt, job.completedAt)}`}
                        </p>
                        {job.errorMessage && (
                          <p className="text-xs text-red-400 mt-0.5 truncate">{job.errorMessage}</p>
                        )}
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full shrink-0", cfg.bg, cfg.color)}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </DashLayout>
  );
}
