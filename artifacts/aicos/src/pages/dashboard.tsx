import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Menu, X } from "lucide-react";
import { DashSidebar } from "@/components/dashboard/dash-sidebar";
import { DashGreeting } from "@/components/dashboard/dash-greeting";
import { DashStatCards } from "@/components/dashboard/dash-stat-cards";
import { DashCharts } from "@/components/dashboard/dash-charts";
import { DashActivity } from "@/components/dashboard/dash-activity";
import { DashNotifications } from "@/components/dashboard/dash-notifications";
import { DashTasks } from "@/components/dashboard/dash-tasks";
import { DashAiRecommendations } from "@/components/dashboard/dash-ai-recommendations";
import { DashRecentImports } from "@/components/dashboard/dash-recent-imports";
import { TooltipProvider } from "@/components/ui/tooltip";

export function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar — desktop always visible, mobile as drawer */}
        <div className={`
          fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto flex-shrink-0 transition-transform duration-200
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <DashSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center gap-3 h-14 px-4 sm:px-6 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-1.5 hover:border-zinc-700/60 transition-colors focus-within:border-zinc-600/80 focus-within:ring-1 focus-within:ring-zinc-600/40">
              <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Search products, orders, suppliers…"
                className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none min-w-0"
              />
              <kbd className="hidden sm:inline text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded font-mono shrink-0">⌘K</kbd>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 space-y-6 pb-12">
              {/* Greeting + while you were away */}
              <DashGreeting />

              {/* Stat cards */}
              <DashStatCards />

              {/* Charts */}
              <DashCharts />

              {/* Activity + Notifications + Tasks — 3 col */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <DashActivity />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4">
                  <DashNotifications />
                </div>
                <div className="lg:col-span-1">
                  <DashTasks />
                </div>
              </div>

              {/* AI Recommendations */}
              <DashAiRecommendations />

              {/* Recent Imports */}
              <DashRecentImports />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
