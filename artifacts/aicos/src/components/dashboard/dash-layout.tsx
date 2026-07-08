import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { DashSidebar } from "./dash-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DashLayoutProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  /** Set true for pages that render their own inner scroll/flex layout */
  noScroll?: boolean;
}

export function DashLayout({ children, title, icon: Icon, actions, noScroll }: DashLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
        <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto flex-shrink-0 transition-transform duration-200 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <DashSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex items-center gap-3 h-14 px-4 sm:px-6 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
            {title && <h1 className="text-sm font-semibold text-white">{title}</h1>}
            <div className="flex-1" />
            {actions}
          </header>

          {noScroll ? (
            <div className="flex-1 overflow-hidden">{children}</div>
          ) : (
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

/** Consistent empty state for pages that need Shopify connected */
export function NoStoreState({ message = "Connect your Shopify store to see data here." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 gap-4 text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center">
        <svg className="h-6 w-6 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">No store connected</p>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">{message}</p>
      </div>
      <a
        href="/connect-shopify"
        className="text-xs bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
      >
        Connect Shopify
      </a>
    </div>
  );
}
