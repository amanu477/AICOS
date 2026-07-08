import { useState, useEffect } from "react";
import { Zap, Sparkles, RefreshCw, Bell, Play, Pause, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { DashLayout } from "@/components/dashboard/dash-layout";
import { cn } from "@/lib/utils";

interface AutomationRule {
  id: string;
  category: "ai" | "sync" | "alerts";
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  triggerLabel: string;
  defaultEnabled: boolean;
}

const RULES: AutomationRule[] = [
  // AI Automations
  {
    id: "auto-optimize-new",
    category: "ai",
    title: "Auto-optimize new products",
    description: "Automatically generate AI SEO titles, descriptions, and pricing suggestions when new products are synced from Shopify.",
    icon: Sparkles,
    iconColor: "text-violet-400",
    triggerLabel: "On new product sync",
    defaultEnabled: true,
  },
  {
    id: "ai-pricing-watch",
    category: "ai",
    title: "AI pricing watchdog",
    description: "Monitor product performance and suggest price adjustments when conversion rates drop below threshold.",
    icon: Sparkles,
    iconColor: "text-violet-400",
    triggerLabel: "Weekly analysis",
    defaultEnabled: false,
  },
  {
    id: "ai-tag-cleanup",
    category: "ai",
    title: "Smart tag cleanup",
    description: "Identify and merge duplicate or low-value product tags using AI analysis across your catalog.",
    icon: Sparkles,
    iconColor: "text-violet-400",
    triggerLabel: "Monthly",
    defaultEnabled: false,
  },
  {
    id: "ai-collection-sort",
    category: "ai",
    title: "AI collection sorting",
    description: "Automatically reorder products within collections based on revenue, conversion rate, and inventory levels.",
    icon: Sparkles,
    iconColor: "text-violet-400",
    triggerLabel: "Daily at midnight",
    defaultEnabled: true,
  },

  // Sync Automations
  {
    id: "sync-products-6h",
    category: "sync",
    title: "Sync products every 6 hours",
    description: "Pull updated product data, inventory levels, and pricing from Shopify on a regular cadence.",
    icon: RefreshCw,
    iconColor: "text-blue-400",
    triggerLabel: "Every 6 hours",
    defaultEnabled: true,
  },
  {
    id: "sync-orders-1h",
    category: "sync",
    title: "Sync orders hourly",
    description: "Keep your order dashboard up-to-date by pulling new and updated orders from Shopify every hour.",
    icon: RefreshCw,
    iconColor: "text-blue-400",
    triggerLabel: "Every hour",
    defaultEnabled: true,
  },
  {
    id: "sync-customers-daily",
    category: "sync",
    title: "Sync customers daily",
    description: "Update customer profiles, order counts, and total spend figures from Shopify each night.",
    icon: RefreshCw,
    iconColor: "text-blue-400",
    triggerLabel: "Daily at 2 AM",
    defaultEnabled: false,
  },

  // Alert Automations
  {
    id: "alert-low-stock",
    category: "alerts",
    title: "Low stock alert",
    description: "Get notified when any product variant drops below 5 units of inventory.",
    icon: Bell,
    iconColor: "text-amber-400",
    triggerLabel: "On inventory change",
    defaultEnabled: true,
  },
  {
    id: "alert-large-order",
    category: "alerts",
    title: "Large order notification",
    description: "Instant notification when an order over $500 is placed in your store.",
    icon: Bell,
    iconColor: "text-amber-400",
    triggerLabel: "On new order",
    defaultEnabled: true,
  },
  {
    id: "alert-refund",
    category: "alerts",
    title: "Refund alert",
    description: "Get notified when a refund is issued so you can follow up with the customer quickly.",
    icon: Bell,
    iconColor: "text-amber-400",
    triggerLabel: "On refund",
    defaultEnabled: false,
  },
  {
    id: "alert-sync-failure",
    category: "alerts",
    title: "Sync failure alert",
    description: "Notify if any sync job fails or encounters errors so you can re-trigger manually.",
    icon: Bell,
    iconColor: "text-amber-400",
    triggerLabel: "On sync error",
    defaultEnabled: true,
  },
  {
    id: "alert-ai-done",
    category: "alerts",
    title: "AI optimization complete",
    description: "Get notified when a batch of AI product optimizations finishes and is ready to review.",
    icon: Bell,
    iconColor: "text-amber-400",
    triggerLabel: "On AI job complete",
    defaultEnabled: false,
  },
];

const CATEGORIES = [
  { id: "ai" as const, label: "AI Automations", icon: Sparkles, color: "text-violet-400", bg: "bg-violet-400/10" },
  { id: "sync" as const, label: "Sync & Inventory", icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "alerts" as const, label: "Alerts & Notifications", icon: Bell, color: "text-amber-400", bg: "bg-amber-400/10" },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none",
        enabled ? "bg-emerald-500" : "bg-zinc-700"
      )}
    >
      <motion.span
        animate={{ x: enabled ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function RuleCard({ rule, enabled, onToggle }: { rule: AutomationRule; enabled: boolean; onToggle: () => void }) {
  const Icon = rule.icon;
  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      enabled ? "border-zinc-700/60 bg-zinc-900/40" : "border-zinc-800/40 bg-zinc-950/60 opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          rule.category === "ai" ? "bg-violet-400/10" :
          rule.category === "sync" ? "bg-blue-400/10" : "bg-amber-400/10"
        )}>
          <Icon className={cn("h-4 w-4", rule.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">{rule.title}</p>
            <Toggle enabled={enabled} onToggle={onToggle} />
          </div>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{rule.description}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <Clock className="h-3 w-3 text-zinc-600" />
            <span className="text-xs text-zinc-600">{rule.triggerLabel}</span>
            {enabled && (
              <>
                <span className="text-zinc-700 mx-0.5">·</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">Active</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AutomationPage() {
  const [states, setStates] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("aicos-automations");
      if (saved) return JSON.parse(saved);
    } catch {}
    return Object.fromEntries(RULES.map(r => [r.id, r.defaultEnabled]));
  });

  useEffect(() => {
    localStorage.setItem("aicos-automations", JSON.stringify(states));
  }, [states]);

  const toggle = (id: string) => setStates(s => ({ ...s, [id]: !s[id] }));
  const activeCount = Object.values(states).filter(Boolean).length;

  return (
    <DashLayout
      title="Automations"
      icon={Zap}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{activeCount} active</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">{activeCount} running</span>
        </div>
      }
    >
      <div className="max-w-3xl space-y-8">
        {CATEGORIES.map(cat => {
          const catRules = RULES.filter(r => r.category === cat.id);
          const CatIcon = cat.icon;
          const enabledCount = catRules.filter(r => states[r.id]).length;
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", cat.bg)}>
                  <CatIcon className={cn("h-3.5 w-3.5", cat.color)} />
                </div>
                <h2 className="text-sm font-semibold text-white">{cat.label}</h2>
                <span className="text-xs text-zinc-500 ml-1">{enabledCount}/{catRules.length} active</span>
              </div>
              <div className="space-y-2.5">
                {catRules.map(rule => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    enabled={states[rule.id] ?? false}
                    onToggle={() => toggle(rule.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </DashLayout>
  );
}
