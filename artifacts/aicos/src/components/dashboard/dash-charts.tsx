import { motion } from "framer-motion";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const REVENUE_DATA = [
  { month: "Jan", revenue: 12400, orders: 89 },
  { month: "Feb", revenue: 18200, orders: 134 },
  { month: "Mar", revenue: 15600, orders: 112 },
  { month: "Apr", revenue: 23100, orders: 167 },
  { month: "May", revenue: 28400, orders: 198 },
  { month: "Jun", revenue: 31200, orders: 224 },
  { month: "Jul", revenue: 29800, orders: 211 },
  { month: "Aug", revenue: 35600, orders: 249 },
  { month: "Sep", revenue: 41200, orders: 287 },
  { month: "Oct", revenue: 38900, orders: 271 },
  { month: "Nov", revenue: 47230, orders: 318 },
  { month: "Dec", revenue: 52100, orders: 361 },
];

const VISITORS_DATA = [
  { day: "Mon", visitors: 1240, products: 34 },
  { day: "Tue", visitors: 1820, products: 41 },
  { day: "Wed", visitors: 1560, products: 38 },
  { day: "Thu", visitors: 2310, products: 52 },
  { day: "Fri", visitors: 2840, products: 61 },
  { day: "Sat", visitors: 3120, products: 73 },
  { day: "Sun", visitors: 2980, products: 68 },
];

const STORE_HEALTH_DATA = [
  { name: "Performance", value: 96, fill: "#22d3ee" },
  { name: "SEO", value: 88, fill: "#a78bfa" },
  { name: "Conversion", value: 91, fill: "#34d399" },
  { name: "Trust", value: 98, fill: "#60a5fa" },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#f4f4f5",
  fontSize: "12px",
};

type ChartTab = "revenue" | "orders" | "visitors" | "products";

const TABS: { key: ChartTab; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "orders", label: "Orders" },
  { key: "visitors", label: "Visitors" },
  { key: "products", label: "Products" },
];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function DashCharts() {
  const [activeTab, setActiveTab] = useState<ChartTab>("revenue");

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 xl:grid-cols-3 gap-4"
    >
      {/* Main chart */}
      <motion.div variants={item} className="xl:col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Performance Overview</h3>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">+24.3%</span> vs last period
            </p>
          </div>
          <div className="flex items-center gap-1 bg-zinc-800/60 rounded-lg p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150",
                  activeTab === t.key ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "revenue" ? (
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#60a5fa" }} />
              </AreaChart>
            ) : activeTab === "orders" ? (
              <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, "Orders"]} />
                <Bar dataKey="orders" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : activeTab === "visitors" ? (
              <AreaChart data={VISITORS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString(), "Visitors"]} />
                <Area type="monotone" dataKey="visitors" stroke="#34d399" strokeWidth={2} fill="url(#visGrad)" dot={false} activeDot={{ r: 4, fill: "#34d399" }} />
              </AreaChart>
            ) : (
              <LineChart data={VISITORS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, "Products Viewed"]} />
                <Line type="monotone" dataKey="products" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Store health radial */}
      <motion.div variants={item} className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Store Health</h3>
        <p className="text-xs text-zinc-500 mb-4">Score: <span className="text-white font-semibold">94/100</span></p>

        <div className="h-44 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="30%"
              outerRadius="90%"
              data={STORE_HEALTH_DATA}
              startAngle={90}
              endAngle={-270}
              barSize={10}
            >
              <RadialBar background={{ fill: "#27272a" }} dataKey="value" cornerRadius={5} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 mt-2">
          {STORE_HEALTH_DATA.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-zinc-400">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">{d.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
