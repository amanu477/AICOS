import { motion } from "framer-motion";
import { Download, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const IMPORTS = [
  { id: 1, name: "Summer Collection 2025", source: "AliExpress", count: 32, status: "completed", time: "2h ago", margin: "$24–$67" },
  { id: 2, name: "Electronics Bundle A", source: "CJ Dropshipping", count: 18, status: "completed", time: "5h ago", margin: "$12–$89" },
  { id: 3, name: "Home Decor Batch", source: "Spocket", count: 45, status: "processing", time: "Running", margin: "Calculating…" },
  { id: 4, name: "Beauty & Wellness Pack", source: "DSers", count: 11, status: "failed", time: "8h ago", margin: "—" },
  { id: 5, name: "Sports Accessories", source: "AliExpress", count: 27, status: "completed", time: "1d ago", margin: "$18–$44" },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Completed", bg: "bg-emerald-400/10 text-emerald-400" },
  processing: { icon: Clock, color: "text-amber-400", label: "Processing", bg: "bg-amber-400/10 text-amber-400" },
  failed:    { icon: XCircle, color: "text-red-400", label: "Failed", bg: "bg-red-400/10 text-red-400" },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function DashRecentImports() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Recent Imports</h3>
        </div>
        <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
          View all <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 1.0 } } }}
        initial="hidden"
        animate="show"
        className="divide-y divide-zinc-800/60"
      >
        {IMPORTS.map((imp) => {
          const cfg = statusConfig[imp.status as keyof typeof statusConfig];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={imp.id}
              variants={item}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors group cursor-pointer"
            >
              <div className={cn("p-1.5 rounded-lg shrink-0", imp.status === "processing" ? "bg-amber-400/10" : imp.status === "failed" ? "bg-red-400/10" : "bg-cyan-400/10")}>
                <Icon className={cn("h-3.5 w-3.5", cfg.color, imp.status === "processing" && "animate-spin")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">{imp.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{imp.source} · {imp.count} products</p>
              </div>
              <div className="text-right shrink-0">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cfg.bg)}>{cfg.label}</span>
                <p className="text-xs text-zinc-600 mt-1">{imp.time}</p>
              </div>
              <div className="hidden sm:block text-right shrink-0 min-w-[80px]">
                <p className="text-xs font-medium text-zinc-300">{imp.margin}</p>
                <p className="text-xs text-zinc-600">margin</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
