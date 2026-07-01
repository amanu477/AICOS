import { motion } from "framer-motion";
import { Bell, AlertTriangle, Info, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type Notif = {
  id: number;
  type: "warning" | "info" | "success" | "error";
  title: string;
  body: string;
  time: string;
};

const INITIAL_NOTIFS: Notif[] = [
  { id: 1, type: "warning", title: "Competitor price drop", body: "AliExpress lowered prices on 5 of your products by 12%.", time: "Just now" },
  { id: 2, type: "success", title: "New order milestone", body: "Congratulations! You hit 300 orders this month.", time: "1h ago" },
  { id: 3, type: "info", title: "Trend opportunity", body: "Portable blenders are trending — 3 suppliers available.", time: "2h ago" },
  { id: 4, type: "error", title: "Fulfillment delay", body: "Supplier shipping delayed 3–5 days. 8 orders affected.", time: "3h ago" },
  { id: 5, type: "info", title: "New supplier match", body: "4 new suppliers match your Beauty niche criteria.", time: "5h ago" },
  { id: 6, type: "success", title: "Product approved", body: "\"Posture Corrector Belt\" passed quality checks.", time: "7h ago" },
];

const typeConfig = {
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  error:   { icon: AlertTriangle, color: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-400/20"   },
  info:    { icon: Info,          color: "text-blue-400",  bg: "bg-blue-400/10",  border: "border-blue-400/20"  },
  success: { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

const item = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function DashNotifications() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  const dismiss = (id: number) => setNotifs((p) => p.filter((n) => n.id !== id));

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{notifs.length}</span>
        </div>
        <button
          onClick={() => setNotifs([])}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear all
        </button>
      </div>

      <ScrollArea className="flex-1 px-4 py-3" style={{ maxHeight: 300 }}>
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.7 } } }}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">All caught up!</p>
            </div>
          ) : (
            notifs.map((n) => {
              const cfg = typeConfig[n.type];
              const Icon = cfg.icon;
              return (
                <motion.div key={n.id} variants={item} layout exit={{ opacity: 0, x: 16 }}
                  className={cn("flex items-start gap-3 p-3 rounded-lg border", cfg.bg, cfg.border)}>
                  <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-100">{n.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-xs text-zinc-600 mt-1">{n.time}</p>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </ScrollArea>
    </div>
  );
}
