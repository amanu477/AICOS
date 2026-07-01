import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Brain, Loader2, StopCircle, Sun, BarChart3, TrendingUp, MessageSquare, Copy, Check, RefreshCw } from "lucide-react";
import { useUser } from "@clerk/react";
import { cn } from "@/lib/utils";
import { NovaMarkdown } from "./nova-markdown";
import {
  fetchMessages, streamMessage, type NovaConversation, type NovaMessage
} from "@/lib/nova-api";

const QUICK_PROMPTS = [
  { icon: Sun, label: "What should I focus on today?", color: "text-amber-400" },
  { icon: TrendingUp, label: "Find me winning products for my niche", color: "text-emerald-400" },
  { icon: BarChart3, label: "Analyze my store's performance", color: "text-blue-400" },
  { icon: MessageSquare, label: "Write product descriptions for me", color: "text-violet-400" },
  { icon: Brain, label: "What's my best pricing strategy?", color: "text-pink-400" },
  { icon: Sparkles, label: "Suggest marketing campaigns", color: "text-cyan-400" },
];

interface NovaChatProps {
  conversation: NovaConversation | null;
  onTitleChange?: (id: string, title: string) => void;
}

export function NovaChat({ conversation, onTitleChange }: NovaChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    fetchMessages(conversation.id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const send = useCallback(async (content: string) => {
    if (!conversation || !content.trim() || streaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: NovaMessage = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    setStreaming(true);
    setStreamingContent("");
    abortRef.current = false;

    let full = "";
    try {
      for await (const chunk of streamMessage(conversation.id, content)) {
        if (abortRef.current) break;
        full += chunk;
        setStreamingContent(full);
      }
    } catch (e) {
      full = "Sorry, I ran into an issue. Please try again.";
      setStreamingContent(full);
    }

    const assistantMsg: NovaMessage = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: "assistant",
      content: full,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    setStreamingContent("");
    setStreaming(false);

    // Update title if this was the first message
    if (messages.length === 0 && onTitleChange) {
      onTitleChange(conversation.id, content.slice(0, 60) + (content.length > 60 ? "…" : ""));
    }
  }, [conversation, streaming, messages.length, onTitleChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const firstName = user?.firstName ?? "there";

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-violet-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Hi {firstName}, I'm Nova</h2>
          <p className="text-zinc-400 text-sm max-w-sm">
            Your AI Commerce Manager. I'm here to help you find winning products, grow revenue, and run your store smarter.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 max-w-lg mx-auto">
            {QUICK_PROMPTS.map(({ icon: Icon, label, color }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {/* needs conversation */}}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50 hover:border-zinc-700/80 hover:bg-zinc-800/50 transition-all text-left group"
              >
                <Icon className={cn("h-4 w-4 shrink-0", color)} />
                <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-6">Start a new conversation to chat with Nova</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Chat header */}
      <div className="px-6 py-3.5 border-b border-zinc-800/60 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{conversation.title}</p>
          <p className="text-xs text-zinc-500">Nova · AI Commerce Manager</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-zinc-600 animate-spin" />
          </div>
        ) : messages.length === 0 && !streaming ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-8 w-8 text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">Ask Nova anything about your store, products, or strategy.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg">
              {QUICK_PROMPTS.map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  onClick={() => send(label)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700/80 hover:bg-zinc-800/50 transition-all text-left group"
                >
                  <Icon className={cn("h-4 w-4 shrink-0", color)} />
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-3 group", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                </div>
              )}
              <div className={cn("max-w-[75%] relative", msg.role === "user" ? "max-w-[60%]" : "max-w-[80%]")}>
                {msg.role === "user" ? (
                  <div className="bg-zinc-700/60 border border-zinc-600/60 rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl rounded-tl-sm px-5 py-4">
                    <NovaMarkdown content={msg.content} />
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedId === msg.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 shrink-0 mt-0.5">
                  {user?.firstName?.[0] ?? "U"}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming */}
        {streaming && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            </div>
            <div className="max-w-[80%] bg-zinc-900/80 border border-zinc-800/60 rounded-2xl rounded-tl-sm px-5 py-4">
              {streamingContent ? (
                <NovaMarkdown content={streamingContent} />
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 sm:px-8 py-4 border-t border-zinc-800/60 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-zinc-800/50 border border-zinc-700/60 rounded-2xl px-4 py-3 focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nova anything…"
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed max-h-40"
            />
            {streaming ? (
              <button
                onClick={() => { abortRef.current = true; }}
                className="p-2 rounded-xl bg-zinc-700/60 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
              >
                <StopCircle className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-700 text-center mt-2">Nova can make mistakes. Verify important decisions independently.</p>
        </div>
      </div>
    </div>
  );
}
