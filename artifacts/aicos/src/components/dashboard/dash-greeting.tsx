import { motion } from "framer-motion";
import { useOptionalUser } from "@/lib/clerk-optional";
import { Sparkles, TrendingUp, AlertTriangle, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { icon: Package, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "23 new winning products identified" },
  { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", label: "$47,230 in revenue opportunities" },
  { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", label: "3 trend alerts need your attention" },
  { icon: Zap, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", label: "12 automation tasks completed" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function DashGreeting() {
  const { user } = useOptionalUser();
  const firstName = user?.firstName ?? "there";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Greeting */}
      <motion.div variants={item} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">Here's what your AI employee has been up to.</p>
        </div>
        <motion.div
          variants={item}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          AI actively working
        </motion.div>
      </motion.div>

      {/* While you were away */}
      <motion.div variants={item}>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2.5">While you were away…</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          {HIGHLIGHTS.map(({ icon: Icon, color, bg, label }, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ scale: 1.02, y: -1 }}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm font-medium cursor-default",
                bg
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", color)} />
              <span className="text-zinc-200 leading-snug">{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
