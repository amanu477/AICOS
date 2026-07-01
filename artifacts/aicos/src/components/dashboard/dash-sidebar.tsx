import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Zap,
  Truck, Download, Settings, Hexagon, ChevronLeft, ChevronRight,
  Bell, Search, Moon, Sun, LogOut, User, ChevronsUpDown,
  Store, Sparkles
} from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", badge: null },
  { icon: Sparkles, label: "Nova AI", path: "/nova", badge: null, highlight: true },
  { icon: Package, label: "Products", path: "/dashboard/products", badge: "23" },
  { icon: ShoppingCart, label: "Orders", path: "/dashboard/orders", badge: null },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics", badge: null },
  { icon: Zap, label: "Automation", path: "/dashboard/automation", badge: "7" },
  { icon: Truck, label: "Suppliers", path: "/dashboard/suppliers", badge: null },
  { icon: Download, label: "Imports", path: "/dashboard/imports", badge: "4" },
];

const BOTTOM_ITEMS = [
  { icon: Bell, label: "Notifications", path: "/dashboard/notifications", badge: "12" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", badge: null },
];

interface DashSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function DashSidebar({ collapsed, setCollapsed }: DashSidebarProps) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    return location.startsWith(path);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-zinc-950 border-r border-zinc-800/60 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-zinc-800/60 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Hexagon className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-sm text-white tracking-wide whitespace-nowrap overflow-hidden"
              >
                AICOS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Store badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 py-2 mx-3 mt-3 mb-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center gap-2"
          >
            <Store className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-zinc-400 truncate">my-store.myshopify.com</span>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge, highlight }) => {
          const active = isActive(path);
          const item = (
            <Link
              key={path}
              href={path}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group",
                active
                  ? highlight ? "bg-violet-500/20 text-violet-200" : "bg-white/10 text-white"
                  : highlight
                    ? "text-violet-400 hover:text-violet-200 hover:bg-violet-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className={cn(
                    "absolute inset-0 rounded-lg border",
                    highlight
                      ? "bg-violet-500/15 border-violet-500/30"
                      : "bg-white/8 border-white/10"
                  )}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className={cn(
                "h-4 w-4 shrink-0 relative z-10",
                active
                  ? highlight ? "text-violet-300" : "text-white"
                  : highlight ? "text-violet-400 group-hover:text-violet-200" : "text-zinc-400 group-hover:text-zinc-200"
              )} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 truncate relative z-10"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge && !collapsed && (
                <span className="relative z-10 text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300 leading-none">
                  {badge}
                </span>
              )}
              {highlight && !active && !collapsed && (
                <span className="relative z-10 text-xs font-medium px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 leading-none border border-violet-500/20">
                  AI
                </span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={path} delayDuration={0}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-800 border-zinc-700 text-white text-xs">
                  {label} {badge && `(${badge})`}
                </TooltipContent>
              </Tooltip>
            );
          }
          return item;
        })}

        <div className="pt-2 mt-2 border-t border-zinc-800/60">
          {BOTTOM_ITEMS.map(({ icon: Icon, label, path, badge }) => {
            const item = (
              <Link
                key={path}
                href={path}
                className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all duration-150 relative"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 truncate">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {badge && !collapsed && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 leading-none">{badge}</span>
                )}
              </Link>
            );
            if (collapsed) {
              return (
                <Tooltip key={path} delayDuration={0}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-zinc-800 border-zinc-700 text-white text-xs">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return item;
          })}
        </div>
      </nav>

      {/* User + collapse */}
      <div className="border-t border-zinc-800/60 p-2 space-y-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-zinc-700 text-zinc-200 text-xs font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium text-zinc-200 truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!collapsed && <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52 bg-zinc-900 border-zinc-700">
            <DropdownMenuItem className="text-zinc-300 hover:text-white focus:text-white focus:bg-zinc-800" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-700" />
            <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-zinc-800" onClick={() => signOut({ redirectUrl: "/" })}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-8 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
