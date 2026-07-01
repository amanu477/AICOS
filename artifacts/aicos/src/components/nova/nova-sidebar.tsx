import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Plus, Trash2, MessageSquare, Sun, BarChart3, TrendingUp,
  ChevronRight, MoreHorizontal, Pencil, Check, X, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NovaConversation } from "@/lib/nova-api";

const typeIcon = {
  chat: MessageSquare,
  daily_briefing: Sun,
  weekly_report: BarChart3,
  monthly_report: TrendingUp,
};

const typeColor = {
  chat: "text-zinc-400",
  daily_briefing: "text-amber-400",
  weekly_report: "text-blue-400",
  monthly_report: "text-violet-400",
};

interface NovaSidebarProps {
  conversations: NovaConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onGenerateBriefing: (type: "daily_briefing" | "weekly_report" | "monthly_report") => void;
  loading: boolean;
}

export function NovaSidebar({
  conversations, activeId, onSelect, onNew, onDelete, onRename,
  onGenerateBriefing, loading
}: NovaSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const startEdit = (conv: NovaConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const commitEdit = (id: string) => {
    if (editTitle.trim()) onRename(id, editTitle.trim());
    setEditingId(null);
  };

  const grouped = {
    reports: conversations.filter(c => c.type !== "chat"),
    chats: conversations.filter(c => c.type === "chat"),
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/80 border-r border-zinc-800/60 w-64 shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Nova</p>
            <p className="text-xs text-zinc-500">AI Commerce Manager</p>
          </div>
        </div>

        <button
          onClick={onNew}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New conversation
        </button>
      </div>

      {/* Generate reports */}
      <div className="px-3 py-3 border-b border-zinc-800/60">
        <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2 px-1">Generate</p>
        <div className="space-y-1">
          {[
            { type: "daily_briefing" as const, label: "Daily Briefing", icon: Sun, color: "text-amber-400" },
            { type: "weekly_report" as const, label: "Weekly Report", icon: BarChart3, color: "text-blue-400" },
            { type: "monthly_report" as const, label: "Monthly Report", icon: TrendingUp, color: "text-violet-400" },
          ].map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => onGenerateBriefing(type)}
              disabled={loading}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
              {label}
              <ChevronRight className="h-3 w-3 ml-auto text-zinc-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {grouped.reports.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-1 px-2">Reports</p>
            <div className="space-y-0.5">
              {grouped.reports.map(conv => (
                <ConvItem
                  key={conv.id} conv={conv} activeId={activeId} hoverId={hoverId}
                  editingId={editingId} editTitle={editTitle}
                  onSelect={onSelect} onDelete={onDelete}
                  onHover={setHoverId} onStartEdit={startEdit}
                  onCommitEdit={commitEdit} onCancelEdit={() => setEditingId(null)}
                  onEditTitleChange={setEditTitle}
                />
              ))}
            </div>
          </div>
        )}

        {grouped.chats.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-1 px-2">Conversations</p>
            <div className="space-y-0.5">
              {grouped.chats.map(conv => (
                <ConvItem
                  key={conv.id} conv={conv} activeId={activeId} hoverId={hoverId}
                  editingId={editingId} editTitle={editTitle}
                  onSelect={onSelect} onDelete={onDelete}
                  onHover={setHoverId} onStartEdit={startEdit}
                  onCommitEdit={commitEdit} onCancelEdit={() => setEditingId(null)}
                  onEditTitleChange={setEditTitle}
                />
              ))}
            </div>
          </div>
        )}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Sparkles className="h-8 w-8 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-500">No conversations yet.<br />Start chatting with Nova!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConvItem({
  conv, activeId, hoverId, editingId, editTitle,
  onSelect, onDelete, onHover, onStartEdit, onCommitEdit, onCancelEdit, onEditTitleChange
}: any) {
  const Icon = typeIcon[conv.type as keyof typeof typeIcon] ?? MessageSquare;
  const color = typeColor[conv.type as keyof typeof typeColor] ?? "text-zinc-400";
  const isActive = activeId === conv.id;
  const isHovered = hoverId === conv.id;
  const isEditing = editingId === conv.id;

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors relative",
        isActive ? "bg-white/8 border border-white/10" : "hover:bg-white/4"
      )}
      onClick={() => !isEditing && onSelect(conv.id)}
      onMouseEnter={() => onHover(conv.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            value={editTitle}
            onChange={e => onEditTitleChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onCommitEdit(conv.id);
              if (e.key === "Escape") onCancelEdit();
            }}
            className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-1.5 py-0.5 text-xs text-white outline-none"
          />
          <button onClick={() => onCommitEdit(conv.id)} className="text-emerald-400 hover:text-emerald-300">
            <Check className="h-3 w-3" />
          </button>
          <button onClick={onCancelEdit} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-xs text-zinc-300 truncate">{conv.title}</span>
          {(isActive || isHovered) && (
            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onStartEdit(conv)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(conv.id)}
                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
