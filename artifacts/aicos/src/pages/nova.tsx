import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { DashSidebar } from "@/components/dashboard/dash-sidebar";
import { NovaSidebar } from "@/components/nova/nova-sidebar";
import { NovaChat } from "@/components/nova/nova-chat";
import { NovaMemoryPanel } from "@/components/nova/nova-memory-panel";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  fetchConversations, createConversation, deleteConversation,
  renameConversation, fetchMemory, streamBriefing,
  type NovaConversation, type NovaMemory,
} from "@/lib/nova-api";

export function NovaPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [conversations, setConversations] = useState<NovaConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<NovaConversation | null>(null);
  const [memory, setMemory] = useState<NovaMemory | null>(null);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefingStatus, setBriefingStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchConversations(), fetchMemory()])
      .then(([convos, mem]) => {
        setConversations(convos);
        setMemory(mem);
        if (convos.length > 0) setActiveConversation(convos[0]);
      })
      .catch(() => setError("Failed to load Nova. Please refresh."))
      .finally(() => setLoadingInit(false));
  }, []);

  const handleNew = useCallback(async () => {
    setLoading(true);
    try {
      const conv = await createConversation("New conversation");
      setConversations(prev => [conv, ...prev]);
      setActiveConversation(conv);
    } catch {
      setError("Failed to create conversation.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation?.id === id) {
      setActiveConversation(conversations.find(c => c.id !== id) ?? null);
    }
  }, [activeConversation, conversations]);

  const handleRename = useCallback(async (id: string, title: string) => {
    const updated = await renameConversation(id, title);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    if (activeConversation?.id === id) {
      setActiveConversation(prev => prev ? { ...prev, title } : prev);
    }
  }, [activeConversation]);

  const handleTitleChange = useCallback((id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    if (activeConversation?.id === id) {
      setActiveConversation(prev => prev ? { ...prev, title } : prev);
    }
  }, [activeConversation]);

  const handleGenerateBriefing = useCallback(async (type: "daily_briefing" | "weekly_report" | "monthly_report") => {
    const labels = { daily_briefing: "Daily Briefing", weekly_report: "Weekly Report", monthly_report: "Monthly Report" };
    setBriefingStatus(`Generating ${labels[type]}…`);
    setLoading(true);

    let convId: string | null = null;
    let title = "";
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    try {
      for await (const event of streamBriefing(type)) {
        if (event.conversationId && !convId) {
          convId = event.conversationId;
          title = `${labels[type]} — ${today}`;
          const newConv: NovaConversation = {
            id: convId,
            title,
            type,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setConversations(prev => [newConv, ...prev]);
          setActiveConversation(newConv);
        }
      }
    } catch {
      setError("Failed to generate briefing.");
    } finally {
      setLoading(false);
      setBriefingStatus(null);
    }
  }, []);

  if (loadingInit) {
    return (
      <div className="flex h-screen bg-zinc-950 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-violet-400 animate-pulse" />
          </div>
          <p className="text-sm text-zinc-400">Loading Nova…</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        {/* App sidebar */}
        <DashSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Nova sidebar */}
        <NovaSidebar
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={(id) => setActiveConversation(conversations.find(c => c.id === id) ?? null)}
          onNew={handleNew}
          onDelete={handleDelete}
          onRename={handleRename}
          onGenerateBriefing={handleGenerateBriefing}
          loading={loading}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Top bar */}
          <header className="flex items-center justify-between h-14 px-5 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              {briefingStatus && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-violet-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {briefingStatus}
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                  <button onClick={() => setError(null)} className="ml-1 hover:text-red-300"><X className="h-3 w-3" /></button>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => setMemoryOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                memoryOpen
                  ? "bg-violet-500/20 border border-violet-500/30 text-violet-300"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              Nova's Memory
            </button>
          </header>

          {/* Chat + Memory panel */}
          <div className="flex-1 flex min-h-0">
            <NovaChat
              conversation={activeConversation}
              onTitleChange={handleTitleChange}
            />

            <AnimatePresence>
              {memoryOpen && (
                <NovaMemoryPanel
                  memory={memory}
                  onClose={() => setMemoryOpen(false)}
                  onSaved={(mem) => {
                    setMemory(mem);
                    setMemoryOpen(false);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
