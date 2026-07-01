import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Package, Users, ShoppingCart, LayoutGrid, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionBadge } from "./ConnectionBadge";
import { cn } from "@/lib/utils";

interface SyncJob {
  id: string;
  type: string;
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  processedRecords: number;
  totalRecords: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
}

interface StoreStatus {
  storeId: string;
  name: string;
  domain: string;
  connected: boolean;
  syncStatus: "idle" | "syncing" | "error" | "partial";
  lastSyncedAt: string | null;
  webhooksRegistered: boolean;
  recentJobs: SyncJob[];
}

interface SyncStatusProps {
  storeId: string;
  autoRefresh?: boolean;
}

const jobTypeIcons: Record<string, React.ElementType> = {
  full_sync: RefreshCw,
  products: Package,
  customers: Users,
  orders: ShoppingCart,
  collections: LayoutGrid,
};

const jobStatusConfig = {
  queued: { label: "Queued", color: "text-zinc-400", bg: "bg-zinc-400/10" },
  running: { label: "Running", color: "text-blue-400", bg: "bg-blue-400/10" },
  done: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10" },
  failed: { label: "Failed", color: "text-red-400", bg: "bg-red-400/10" },
  cancelled: { label: "Cancelled", color: "text-zinc-500", bg: "bg-zinc-500/10" },
};

function formatRelative(date: string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function SyncStatus({ storeId, autoRefresh = true }: SyncStatusProps) {
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/shopify/status/${storeId}`);
      if (!res.ok) throw new Error(`Failed to fetch status: ${res.status}`);
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load store status");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStatus();
    if (!autoRefresh) return;
    const interval = setInterval(fetchStatus, 10_000);
    return () => clearInterval(interval);
  }, [fetchStatus, autoRefresh]);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/shopify/sync/${storeId}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Sync failed to start");
      }
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync trigger failed");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Error loading store status</span>
        </div>
        <p className="text-xs text-zinc-500">{error}</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={fetchStatus}>Retry</Button>
      </div>
    );
  }

  if (!status) return null;

  const activeJob = status.recentJobs.find(j => j.status === "running" || j.status === "queued");
  const progress = activeJob && activeJob.totalRecords > 0
    ? Math.round((activeJob.processedRecords / activeJob.totalRecords) * 100)
    : null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-white truncate">{status.name}</h3>
            <ConnectionBadge connected={status.connected} syncStatus={status.syncStatus} />
          </div>
          <p className="text-xs text-zinc-500 truncate">{status.domain}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>Last synced {formatRelative(status.lastSyncedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={triggerSync}
            disabled={syncing || status.syncStatus === "syncing"}
            className="gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", (syncing || status.syncStatus === "syncing") && "animate-spin")} />
            Sync Now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Active job progress */}
      <AnimatePresence>
        {activeJob && (
          <motion.div
            key="progress"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-400">
                    {formatJobType(activeJob.type)} in progress
                  </span>
                  <span className="text-xs text-zinc-400">
                    {activeJob.processedRecords.toLocaleString()} records
                    {activeJob.totalRecords > 0 && ` / ${activeJob.totalRecords.toLocaleString()}`}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: progress != null ? `${progress}%` : "60%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={progress == null ? { backgroundImage: "linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" } : {}}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job history */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="history"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-800"
          >
            <div className="p-5">
              <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">Recent sync jobs</p>
              {status.recentJobs.length === 0 ? (
                <p className="text-xs text-zinc-600">No sync jobs yet</p>
              ) : (
                <div className="space-y-2">
                  {status.recentJobs.map(job => {
                    const Icon = jobTypeIcons[job.type] ?? RefreshCw;
                    const cfg = jobStatusConfig[job.status];
                    return (
                      <div key={job.id} className={cn("flex items-center gap-3 p-2.5 rounded-lg", cfg.bg)}>
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", cfg.color, job.status === "running" && "animate-spin")} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-xs font-medium", cfg.color)}>{formatJobType(job.type)}</span>
                            <span className="text-xs text-zinc-500">{formatRelative(job.completedAt ?? job.startedAt)}</span>
                          </div>
                          {job.processedRecords > 0 && (
                            <p className="text-xs text-zinc-500 mt-0.5">{job.processedRecords.toLocaleString()} records processed</p>
                          )}
                          {job.errorMessage && (
                            <p className="text-xs text-red-400 mt-0.5 truncate">{job.errorMessage}</p>
                          )}
                        </div>
                        {job.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          : job.status === "failed" ? <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {!status.webhooksRegistered && (
                <div className="mt-3 flex items-start gap-2 p-2.5 bg-yellow-400/10 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400">Webhooks not registered — real-time updates disabled</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
