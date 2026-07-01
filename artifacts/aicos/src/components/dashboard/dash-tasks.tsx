import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckSquare, Square, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = { id: number; label: string; priority: "high" | "medium" | "low"; done: boolean; due: string };

const INITIAL_TASKS: Task[] = [
  { id: 1, label: "Review 5 flagged products for quality", priority: "high", done: false, due: "Today" },
  { id: 2, label: "Approve auto-imported supplier catalog", priority: "high", done: false, due: "Today" },
  { id: 3, label: "Set pricing rules for new niche", priority: "medium", done: false, due: "Tomorrow" },
  { id: 4, label: "Enable abandoned cart automation", priority: "medium", done: true, due: "Done" },
  { id: 5, label: "Update store descriptions with AI copy", priority: "low", done: false, due: "This week" },
  { id: 6, label: "Check supplier for USB hub restock", priority: "low", done: false, due: "This week" },
];

const priorityStyle = {
  high: "text-red-400 bg-red-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  low: "text-zinc-400 bg-zinc-400/10",
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function DashTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggle = (id: number) => setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const pending = tasks.filter((t) => !t.done).length;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Tasks</h3>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-zinc-700/60 text-zinc-400">{pending} remaining</span>
        </div>
        <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.8 } } }}
        initial="hidden"
        animate="show"
        className="px-4 py-3 space-y-1"
      >
        <AnimatePresence>
          {tasks.map((t) => (
            <motion.div
              key={t.id}
              variants={item}
              layout
              className={cn(
                "flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer group",
                t.done ? "opacity-50" : "hover:bg-white/3"
              )}
              onClick={() => toggle(t.id)}
            >
              <div className="mt-0.5 shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                {t.done
                  ? <CheckSquare className="h-4 w-4 text-emerald-400" />
                  : <Square className="h-4 w-4" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium leading-snug", t.done ? "line-through text-zinc-600" : "text-zinc-200")}>
                  {t.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded capitalize", priorityStyle[t.priority])}>
                    {t.priority}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-600">
                    <Clock className="h-3 w-3" />{t.due}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
