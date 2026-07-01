import { motion } from "framer-motion";
import { Sparkles, ChevronRight, TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const RECOMMENDATIONS = [
  {
    icon: TrendingUp,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
    title: "Expand into Home & Wellness",
    body: "Based on your audience, 3 trending product categories have 40%+ margins. Your competitors haven't caught on yet.",
    cta: "Explore products",
    confidence: 94,
  },
  {
    icon: DollarSign,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    title: "Raise prices on top 8 sellers",
    body: "Demand is inelastic on your bestsellers. AI pricing model estimates $3,200 extra revenue with 0 conversion drop.",
    cta: "Review pricing",
    confidence: 87,
  },
  {
    icon: Package,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10",
    title: "Bundle Earbuds + Case",
    body: "Customers who buy wireless earbuds buy a case 62% of the time. Create a bundle to increase AOV by $12.",
    cta: "Create bundle",
    confidence: 91,
  },
  {
    icon: Users,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    title: "Retarget cart abandoners",
    body: "156 customers left items in carts in the last 48h. An automated sequence could recover ~$4,800.",
    cta: "Set up flow",
    confidence: 89,
  },
];

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function DashAiRecommendations() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-zinc-800/60">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
        <span className="ml-auto text-xs text-zinc-500">Updated 2m ago</span>
      </div>

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.9 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4"
      >
        {RECOMMENDATIONS.map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-800/60 bg-zinc-800/30 hover:border-zinc-700/80 hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", r.iconBg)}>
                  <Icon className={cn("h-4 w-4", r.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-100 leading-snug">{r.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-zinc-700">
                      <div className="h-1 rounded-full bg-violet-400" style={{ width: `${r.confidence}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500">{r.confidence}% confidence</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{r.body}</p>
              <button className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors mt-auto">
                {r.cta} <ChevronRight className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
