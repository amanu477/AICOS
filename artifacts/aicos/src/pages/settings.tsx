import { useState } from "react";
import { Settings, Store, RefreshCw, Sparkles, Bell, Shield, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { DashLayout } from "@/components/dashboard/dash-layout";
import { useCurrentStore } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "store" | "sync" | "ai" | "notifications";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "store",         label: "Store",         icon: Store },
  { id: "sync",          label: "Sync",          icon: RefreshCw },
  { id: "ai",            label: "AI",            icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", enabled ? "bg-emerald-500" : "bg-zinc-700")}
    >
      <motion.span
        animate={{ x: enabled ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-zinc-800/40 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-800/60 bg-zinc-900/60">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex items-center justify-end pt-4">
      <Button
        size="sm"
        onClick={onSave}
        className={cn("transition-all", saved ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-white text-black hover:bg-zinc-100")}
      >
        {saved ? <><Check className="h-3.5 w-3.5 mr-1.5" />Saved</> : "Save changes"}
      </Button>
    </div>
  );
}

export function SettingsPage() {
  const { store, storeId, loading: storeLoading } = useCurrentStore();
  const [tab, setTab] = useState<Tab>("store");

  // Sync settings
  const [syncSettings, setSyncSettings] = useState({
    autoSyncProducts: true,
    autoSyncOrders: true,
    autoSyncCustomers: false,
    syncInterval: "6",
  });

  // AI settings
  const [aiSettings, setAiSettings] = useState({
    autoOptimizeNew: true,
    autoPublish: false,
    model: "llama-3.3-70b-versatile",
    includePricing: true,
    includeSeo: true,
    includeCollections: true,
  });

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    newOrder: true,
    lowStock: true,
    refund: false,
    syncComplete: true,
    aiComplete: false,
    weeklyReport: true,
  });

  const [saved, setSaved] = useState(false);
  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashLayout title="Settings" icon={Settings}>
      <div className="max-w-2xl">
        {/* Tab bar */}
        <div className="flex gap-0.5 mb-6 border border-zinc-800/60 rounded-xl p-1 bg-zinc-900/40">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all",
                tab === id ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Store tab */}
        {tab === "store" && (
          <div className="space-y-4">
            {storeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
              </div>
            ) : !storeId ? (
              <Section title="No store connected">
                <div className="py-6 text-center">
                  <p className="text-sm text-zinc-400 mb-3">Connect your Shopify store to see settings</p>
                  <a href="/connect-shopify" className="text-xs bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-100 transition-colors">
                    Connect Shopify
                  </a>
                </div>
              </Section>
            ) : (
              <>
                <Section title="Store information">
                  <SettingRow label="Store name">
                    <p className="text-sm text-zinc-300">{store?.name}</p>
                  </SettingRow>
                  <SettingRow label="Shopify domain">
                    <p className="text-sm text-zinc-300 font-mono">{store?.shopifyDomain}</p>
                  </SettingRow>
                  <SettingRow label="Currency">
                    <p className="text-sm text-zinc-300">{store?.currency}</p>
                  </SettingRow>
                  <SettingRow label="Sync status">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      store?.syncStatus === "syncing" ? "bg-blue-400/10 text-blue-400" : "bg-emerald-400/10 text-emerald-400"
                    )}>
                      {store?.syncStatus}
                    </span>
                  </SettingRow>
                </Section>

                <Section title="Danger zone">
                  <SettingRow label="Disconnect store" description="Remove your Shopify store connection. Your sync data will be preserved.">
                    <Button size="sm" variant="outline" className="border-red-800/60 text-red-400 hover:bg-red-400/10 hover:border-red-600/60">
                      Disconnect
                    </Button>
                  </SettingRow>
                </Section>
              </>
            )}
          </div>
        )}

        {/* Sync tab */}
        {tab === "sync" && (
          <div className="space-y-4">
            <Section title="Automatic sync">
              <SettingRow label="Auto-sync products" description="Automatically pull product updates from Shopify on a schedule.">
                <Toggle enabled={syncSettings.autoSyncProducts} onChange={v => setSyncSettings(s => ({ ...s, autoSyncProducts: v }))} />
              </SettingRow>
              <SettingRow label="Auto-sync orders" description="Automatically import new and updated orders from Shopify.">
                <Toggle enabled={syncSettings.autoSyncOrders} onChange={v => setSyncSettings(s => ({ ...s, autoSyncOrders: v }))} />
              </SettingRow>
              <SettingRow label="Auto-sync customers" description="Keep customer profiles in sync with Shopify data.">
                <Toggle enabled={syncSettings.autoSyncCustomers} onChange={v => setSyncSettings(s => ({ ...s, autoSyncCustomers: v }))} />
              </SettingRow>
            </Section>

            <Section title="Sync frequency">
              <SettingRow label="Product sync interval" description="How often to check for product updates.">
                <select
                  value={syncSettings.syncInterval}
                  onChange={e => setSyncSettings(s => ({ ...s, syncInterval: e.target.value }))}
                  className="bg-zinc-900 border border-zinc-700/60 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                >
                  <option value="1">Every hour</option>
                  <option value="3">Every 3 hours</option>
                  <option value="6">Every 6 hours</option>
                  <option value="12">Every 12 hours</option>
                  <option value="24">Once a day</option>
                </select>
              </SettingRow>
            </Section>
            <SaveBar onSave={saveSettings} saved={saved} />
          </div>
        )}

        {/* AI tab */}
        {tab === "ai" && (
          <div className="space-y-4">
            <Section title="AI automation">
              <SettingRow label="Auto-optimize new products" description="Generate AI SEO and pricing suggestions for newly synced products.">
                <Toggle enabled={aiSettings.autoOptimizeNew} onChange={v => setAiSettings(s => ({ ...s, autoOptimizeNew: v }))} />
              </SettingRow>
              <SettingRow label="Auto-publish optimizations" description="Automatically push approved AI optimizations to Shopify.">
                <Toggle enabled={aiSettings.autoPublish} onChange={v => setAiSettings(s => ({ ...s, autoPublish: v }))} />
              </SettingRow>
            </Section>

            <Section title="Optimization scope">
              <SettingRow label="Include SEO optimization" description="Generate SEO titles, descriptions, and meta tags.">
                <Toggle enabled={aiSettings.includeSeo} onChange={v => setAiSettings(s => ({ ...s, includeSeo: v }))} />
              </SettingRow>
              <SettingRow label="Include pricing suggestions" description="AI-powered pricing recommendations based on market data.">
                <Toggle enabled={aiSettings.includePricing} onChange={v => setAiSettings(s => ({ ...s, includePricing: v }))} />
              </SettingRow>
              <SettingRow label="Include collection suggestions" description="Suggest relevant collections for each product.">
                <Toggle enabled={aiSettings.includeCollections} onChange={v => setAiSettings(s => ({ ...s, includeCollections: v }))} />
              </SettingRow>
            </Section>

            <Section title="Model">
              <SettingRow label="AI model" description="The model used for all AI-powered features.">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  <span className="text-xs text-zinc-300 font-mono">{aiSettings.model}</span>
                </div>
              </SettingRow>
            </Section>
            <SaveBar onSave={saveSettings} saved={saved} />
          </div>
        )}

        {/* Notifications tab */}
        {tab === "notifications" && (
          <div className="space-y-4">
            <Section title="Order notifications">
              <SettingRow label="New order" description="Notify when a new order is placed.">
                <Toggle enabled={notifSettings.newOrder} onChange={v => setNotifSettings(s => ({ ...s, newOrder: v }))} />
              </SettingRow>
              <SettingRow label="Refund issued" description="Notify when a refund is processed.">
                <Toggle enabled={notifSettings.refund} onChange={v => setNotifSettings(s => ({ ...s, refund: v }))} />
              </SettingRow>
            </Section>

            <Section title="Store notifications">
              <SettingRow label="Low stock alert" description="Notify when a product falls below 5 units.">
                <Toggle enabled={notifSettings.lowStock} onChange={v => setNotifSettings(s => ({ ...s, lowStock: v }))} />
              </SettingRow>
              <SettingRow label="Sync complete" description="Notify when a sync job finishes.">
                <Toggle enabled={notifSettings.syncComplete} onChange={v => setNotifSettings(s => ({ ...s, syncComplete: v }))} />
              </SettingRow>
              <SettingRow label="AI optimization complete" description="Notify when AI finishes optimizing a batch of products.">
                <Toggle enabled={notifSettings.aiComplete} onChange={v => setNotifSettings(s => ({ ...s, aiComplete: v }))} />
              </SettingRow>
            </Section>

            <Section title="Reports">
              <SettingRow label="Weekly store summary" description="Receive a weekly digest of your store performance.">
                <Toggle enabled={notifSettings.weeklyReport} onChange={v => setNotifSettings(s => ({ ...s, weeklyReport: v }))} />
              </SettingRow>
            </Section>
            <SaveBar onSave={saveSettings} saved={saved} />
          </div>
        )}
      </div>
    </DashLayout>
  );
}
