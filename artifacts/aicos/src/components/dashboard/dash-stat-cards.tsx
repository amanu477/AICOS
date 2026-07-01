import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Truck, ShieldCheck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    label: "Winning Products Found",
    value: "23",
    change: "+12",
    changeLabel: "vs last week",
    trend: "up",
    icon: Package,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    accent: "from-emerald-500/5 to-transparent",
    border: "border-emerald-500/10",
  },
  {
    label: "Revenue Opportunities",
    value: "$47,230",
    change: "+8.2%",
    changeLabel: "potential uplift",
    trend: "up",
    icon: DollarSign,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    accent: "from-blue-500/5 to-transparent",
    border: "border-blue-500/10",
  },
  {
    label: "Trend Alerts",
    value: "7",
    change: "3 critical",
    changeLabel: "need action",
    trend: "warn",
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    accent: "from-amber-500/5 to-transparent",
    border: "border-amber-500/10",
  },
  {
    label: "Supplier Updates",
    value: "12",
    change: "4 new",
    changeLabel: "this week",
    trend: "up",
    icon: Truck,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    accent: "from-violet-500/5 to-transparent",
    border: "border-violet-500/10",
  },
  {
    label: "Store Health",
    value: "94/100",
    change: "+2 pts",
    changeLabel: "vs yesterday",
    trend: "up",
    icon: ShieldCheck,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    accent: "from-cyan-500/5 to-transparent",
    border: "border-cyan-500/10",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
};
const card = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

function AnimatedNumber({ value }: { value: string }) {
  return <span>{value}</span>;
}

export function DashStatCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
    >
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            variants={card}
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "relative rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 overflow-hidden cursor-default group",
              "hover:border-zinc-700/80 transition-colors duration-200"
            )}
          >
            {/* Gradient accent */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300", c.accent)} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", c.iconBg)}>
                  <Icon className={cn("h-4 w-4", c.iconColor)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  c.trend === "up" ? "text-emerald-400 bg-emerald-400/10" :
                  c.trend === "down" ? "text-red-400 bg-red-400/10" :
                  "text-amber-400 bg-amber-400/10"
                )}>
                  {c.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {c.trend === "down" && <TrendingDown className="h-3 w-3" />}
                  {c.trend === "warn" && <AlertTriangle className="h-3 w-3" />}
                  {c.change}
                </div>
              </div>

              <div className="text-2xl font-bold text-white tracking-tight mb-0.5">
                <AnimatedNumber value={c.value} />
              </div>
              <p className="text-xs font-medium text-zinc-400">{c.label}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{c.changeLabel}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
