import { motion } from "framer-motion";
import { Package, TrendingUp, AlertTriangle, CheckCircle2, Download, Zap, Star, ShoppingCart, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const ACTIVITIES = [
  { icon: Package, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "New winning product found", sub: "Wireless Earbuds Pro — $89 margin", time: "2m ago", dot: "bg-emerald-400" },
  { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10", label: "Trend alert triggered", sub: "\"Minimalist wallet\" up 340% this week", time: "15m ago", dot: "bg-blue-400" },
  { icon: CheckCircle2, color: "text-violet-400", bg: "bg-violet-400/10", label: "Auto-pricing updated", sub: "14 products repriced based on competition", time: "1h ago", dot: "bg-violet-400" },
  { icon: Download, color: "text-cyan-400", bg: "bg-cyan-400/10", label: "Product import completed", sub: "32 products imported from AliExpress", time: "2h ago", dot: "bg-cyan-400" },
  { icon: Star, color: "text-amber-400", bg: "bg-amber-400/10", label: "Top seller identified", sub: "Posture Corrector — 98 sold in 24h", time: "3h ago", dot: "bg-amber-400" },
  { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", label: "Stock alert", sub: "USB-C Hub running low (8 units left)", time: "4h ago", dot: "bg-red-400" },
  { icon: ShoppingCart, color: "text-indigo-400", bg: "bg-indigo-400/10", label: "Order spike detected", sub: "+47% orders vs same time yesterday", time: "5h ago", dot: "bg-indigo-400" },
  { icon: RefreshCw, color: "text-zinc-400", bg: "bg-zinc-400/10", label: "Supplier sync completed", sub: "3 suppliers updated, 2 price changes", time: "6h ago", dot: "bg-zinc-500" },
  { icon: Zap, color: "text-pink-400", bg: "bg-pink-400/10", label: "Automation ran", sub: "Cross-sell email sent to 1,240 customers", time: "8h ago", dot: "bg-pink-400" },
];

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function DashActivity() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 flex flex-col h-full">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800/60">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Your AI's work log</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      <ScrollArea className="flex-1 px-5 py-3" style={{ maxHeight: 340 }}>
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } } }}
          initial="hidden"
          animate="show"
          className="space-y-0"
        >
          {ACTIVITIES.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={i} variants={item} className="flex items-start gap-3 py-2.5 relative">
                {i < ACTIVITIES.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-zinc-800/60" />
                )}
                <div className={cn("p-1.5 rounded-lg shrink-0 relative z-10 mt-0.5", a.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", a.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 leading-snug">{a.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{a.sub}</p>
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap shrink-0 mt-0.5">{a.time}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </ScrollArea>
    </div>
  );
}
