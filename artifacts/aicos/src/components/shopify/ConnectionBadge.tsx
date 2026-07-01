import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RefreshCw, AlertCircle } from "lucide-react";

type SyncStatus = "idle" | "syncing" | "error" | "partial";

interface ConnectionBadgeProps {
  connected: boolean;
  syncStatus?: SyncStatus;
  className?: string;
}

const statusConfig = {
  idle: { label: "Connected", icon: CheckCircle2, color: "text-green-400 bg-green-400/10 border-green-400/20" },
  syncing: { label: "Syncing…", icon: RefreshCw, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  error: { label: "Sync Error", icon: AlertCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  partial: { label: "Partial Sync", icon: AlertCircle, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
} as const;

export function ConnectionBadge({ connected, syncStatus = "idle", className }: ConnectionBadgeProps) {
  if (!connected) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border text-zinc-400 bg-zinc-400/10 border-zinc-400/20", className)}>
        <XCircle className="w-3.5 h-3.5" />
        Disconnected
      </span>
    );
  }

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", config.color, className)}>
      <Icon className={cn("w-3.5 h-3.5", syncStatus === "syncing" && "animate-spin")} />
      {config.label}
    </span>
  );
}
