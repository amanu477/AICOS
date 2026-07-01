import { motion } from "framer-motion";
import { Activity, BarChart, ShoppingCart, DollarSign, Package } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            A window into the mind of your AI
          </h2>
          <p className="text-lg text-muted-foreground">
            While AICOS runs autonomously, you have complete visibility into every decision it makes, why it made it, and the resulting revenue impact.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-zinc-950 shadow-2xl overflow-hidden"
        >
          {/* Mockup Header */}
          <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="mx-auto bg-zinc-800/50 px-3 py-1 rounded text-xs text-zinc-400 font-mono flex items-center gap-2">
              <Activity className="w-3 h-3" />
              aicos.app/dashboard
            </div>
          </div>

          {/* Mockup Body */}
          <div className="flex h-[500px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-zinc-800 p-4 hidden md:block bg-zinc-950 text-zinc-400">
              <div className="font-bold text-zinc-100 mb-8 px-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">AI</div>
                AICOS
              </div>
              <div className="space-y-1">
                {['Overview', 'Actions Log', 'Pricing Rules', 'Inventory', 'Competitors'].map((item, i) => (
                  <div key={i} className={`px-3 py-2 rounded-md text-sm ${i === 0 ? 'bg-zinc-800 text-zinc-100' : 'hover:bg-zinc-800/50 hover:text-zinc-200'}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-hidden bg-zinc-950">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-zinc-100">Live Activity</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-green-500">AI is active</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Actions Taken (24h)", value: "1,248", icon: Activity, color: "text-blue-400" },
                  { label: "Revenue Lift", value: "+$4,290", icon: DollarSign, color: "text-green-400" },
                  { label: "Prices Adjusted", value: "342", icon: BarChart, color: "text-purple-400" },
                  { label: "Stockouts Prevented", value: "12", icon: Package, color: "text-orange-400" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2 text-zinc-400">
                      <span className="text-xs">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-semibold text-zinc-100">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Action Log & Chart Area */}
              <div className="grid md:grid-cols-3 gap-6 h-[250px]">
                <div className="md:col-span-2 rounded-lg bg-zinc-900 border border-zinc-800 p-4 flex flex-col">
                  <div className="text-sm font-medium text-zinc-300 mb-4">Revenue Impact vs Baseline</div>
                  <div className="flex-1 relative flex items-end gap-2 pt-4">
                    {/* Mock Chart Bars */}
                    {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex items-end gap-1 h-full">
                        <div className="w-full bg-zinc-800 rounded-t-sm" style={{ height: `${h * 0.7}%` }}></div>
                        <div className="w-full bg-primary/80 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 overflow-hidden flex flex-col">
                  <div className="text-sm font-medium text-zinc-300 mb-4">Recent AI Actions</div>
                  <div className="flex-1 space-y-3 overflow-hidden text-xs">
                    {[
                      { time: "2m ago", text: "Increased 'Summer Dress' by $2.00 (competitor sold out)" },
                      { time: "15m ago", text: "Updated meta tags for 'Beach Hat'" },
                      { time: "1h ago", text: "Drafted PO for supplier 'Acme Goods'" },
                      { time: "2h ago", text: "Matched flash sale on 'Sunglasses'" },
                    ].map((action, i) => (
                      <div key={i} className="flex flex-col gap-1 pb-3 border-b border-zinc-800/50 last:border-0">
                        <span className="text-zinc-500">{action.time}</span>
                        <span className="text-zinc-300">{action.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Overlay gradient for dark mode blend */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  );
}