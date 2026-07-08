import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, ShoppingCart, Users, Package, Loader2, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { DashLayout, NoStoreState } from "@/components/dashboard/dash-layout";
import { useCurrentStore } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Days = 7 | 30 | 90;

interface Summary {
  period: { days: number; since: string };
  revenue: { totalRevenue: string; orderCount: number; avgOrderValue: string };
  products: { count: number };
  customers: { count: number };
  dailyRevenue: { date: string; revenue: string; orders: number }[];
  fulfillmentBreakdown: { status: string; count: number }[];
}

const FULFILLMENT_COLORS: Record<string, string> = {
  fulfilled: "#34d399",
  unfulfilled: "#f59e0b",
  partial: "#60a5fa",
  restocked: "#a1a1aa",
};

function StatCard({ label, value, sub, icon: Icon, color = "text-white" }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-zinc-800/60 flex items-center justify-center">
          <Icon className={cn("h-3.5 w-3.5", color)} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function fmt(v: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(v));
}

export function AnalyticsPage() {
  const { storeId, loading: storeLoading } = useCurrentStore();
  const [days, setDays] = useState<Days>(30);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/stores/${storeId}/analytics/summary?days=${days}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      setData(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [storeId, days]);

  const chartData = (data?.dailyRevenue ?? []).map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Number(d.revenue),
    orders: d.orders,
  }));

  const pieData = (data?.fulfillmentBreakdown ?? []).map(d => ({
    name: d.status,
    value: d.count,
    color: FULFILLMENT_COLORS[d.status ?? ""] ?? "#a1a1aa",
  }));

  return (
    <DashLayout
      title="Analytics"
      icon={BarChart3}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-800/60 overflow-hidden">
            {([7, 30, 90] as Days[]).map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  days === d ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {d}d
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={load} disabled={loading} className="border-zinc-700 text-zinc-400 hover:text-white">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      }
    >
      {storeLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      ) : !storeId ? (
        <NoStoreState message="Connect your Shopify store to see revenue, orders, and performance analytics." />
      ) : loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={fmt(data?.revenue.totalRevenue ?? 0)}
              sub={`Last ${days} days`}
              icon={TrendingUp}
              color="text-emerald-400"
            />
            <StatCard
              label="Orders"
              value={String(data?.revenue.orderCount ?? 0)}
              sub={`Last ${days} days`}
              icon={ShoppingCart}
              color="text-blue-400"
            />
            <StatCard
              label="Avg Order Value"
              value={fmt(data?.revenue.avgOrderValue ?? 0)}
              sub="Per order"
              icon={BarChart3}
              color="text-violet-400"
            />
            <StatCard
              label="Customers"
              value={String(data?.customers.count ?? 0)}
              sub="Total"
              icon={Users}
              color="text-amber-400"
            />
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Revenue trend</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Daily revenue over the last {days} days</p>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">No revenue data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} width={55} />
                  <RechartTooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#e4e4e7" }}
                    formatter={(v: number) => [fmt(v), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Orders chart */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Orders per day</h2>
              <p className="text-xs text-zinc-500 mb-5">Daily order volume</p>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-zinc-600 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} width={30} />
                    <RechartTooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [v, "Orders"]}
                    />
                    <Area type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} fill="url(#ordersGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Fulfillment donut */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
              <h2 className="text-sm font-semibold text-white mb-1">Fulfillment status</h2>
              <p className="text-xs text-zinc-500 mb-5">Orders by fulfillment state</p>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-zinc-600 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => <span style={{ fontSize: 11, color: "#a1a1aa" }}>{value}</span>}
                    />
                    <RechartTooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Products count */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Package className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{data?.products.count ?? 0} products</p>
              <p className="text-xs text-zinc-500">Total products in your Shopify store</p>
            </div>
          </div>
        </div>
      )}
    </DashLayout>
  );
}
