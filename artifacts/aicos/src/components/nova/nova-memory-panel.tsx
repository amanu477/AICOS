import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Save, X, Plus, Trash2 } from "lucide-react";
import { saveMemory, type NovaMemory } from "@/lib/nova-api";
import { cn } from "@/lib/utils";

interface NovaMemoryPanelProps {
  memory: NovaMemory | null;
  onClose: () => void;
  onSaved: (mem: NovaMemory) => void;
}

export function NovaMemoryPanel({ memory, onClose, onSaved }: NovaMemoryPanelProps) {
  const [form, setForm] = useState<NovaMemory>({
    preferredNiche: memory?.preferredNiche ?? "",
    preferredSuppliers: memory?.preferredSuppliers ?? [],
    preferredCountries: memory?.preferredCountries ?? [],
    brandVoice: memory?.brandVoice ?? "",
    pricingStrategy: memory?.pricingStrategy ?? "",
    profitGoalMonthly: memory?.profitGoalMonthly ?? undefined,
    storeContext: memory?.storeContext ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [newSupplier, setNewSupplier] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const save = async () => {
    setSaving(true);
    try {
      const result = await saveMemory(form);
      onSaved(result);
    } finally {
      setSaving(false);
    }
  };

  const addSupplier = () => {
    if (newSupplier.trim()) {
      setForm(f => ({ ...f, preferredSuppliers: [...(f.preferredSuppliers ?? []), newSupplier.trim()] }));
      setNewSupplier("");
    }
  };

  const addCountry = () => {
    if (newCountry.trim()) {
      setForm(f => ({ ...f, preferredCountries: [...(f.preferredCountries ?? []), newCountry.trim()] }));
      setNewCountry("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-80 shrink-0 flex flex-col h-full bg-zinc-900/80 border-l border-zinc-800/60 overflow-y-auto"
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-400" />
          <p className="text-sm font-semibold text-white">Nova's Memory</p>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Nova learns your preferences to give personalized advice. Fill these in to get better recommendations.
        </p>

        <Field label="Preferred Niche">
          <input
            value={form.preferredNiche ?? ""}
            onChange={e => setForm(f => ({ ...f, preferredNiche: e.target.value }))}
            placeholder="e.g. Home & Garden, Fashion, Electronics"
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors"
          />
        </Field>

        <Field label="Preferred Suppliers">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(form.preferredSuppliers ?? []).map((s, i) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-700/60 text-zinc-300">
                  {s}
                  <button onClick={() => setForm(f => ({ ...f, preferredSuppliers: f.preferredSuppliers?.filter((_, j) => j !== i) }))} className="text-zinc-500 hover:text-red-400">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={newSupplier}
                onChange={e => setNewSupplier(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSupplier()}
                placeholder="AliExpress, Spocket…"
                className="flex-1 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors"
              />
              <button onClick={addSupplier} className="p-1.5 rounded-lg bg-zinc-700/60 hover:bg-zinc-600/60 transition-colors">
                <Plus className="h-3.5 w-3.5 text-zinc-300" />
              </button>
            </div>
          </div>
        </Field>

        <Field label="Target Countries">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {(form.preferredCountries ?? []).map((c, i) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-700/60 text-zinc-300">
                  {c}
                  <button onClick={() => setForm(f => ({ ...f, preferredCountries: f.preferredCountries?.filter((_, j) => j !== i) }))} className="text-zinc-500 hover:text-red-400">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={newCountry}
                onChange={e => setNewCountry(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCountry()}
                placeholder="USA, UK, Canada…"
                className="flex-1 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors"
              />
              <button onClick={addCountry} className="p-1.5 rounded-lg bg-zinc-700/60 hover:bg-zinc-600/60 transition-colors">
                <Plus className="h-3.5 w-3.5 text-zinc-300" />
              </button>
            </div>
          </div>
        </Field>

        <Field label="Brand Voice">
          <textarea
            value={form.brandVoice ?? ""}
            onChange={e => setForm(f => ({ ...f, brandVoice: e.target.value }))}
            placeholder="e.g. Friendly and approachable, premium and minimal, playful Gen Z tone…"
            rows={2}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors resize-none"
          />
        </Field>

        <Field label="Pricing Strategy">
          <input
            value={form.pricingStrategy ?? ""}
            onChange={e => setForm(f => ({ ...f, pricingStrategy: e.target.value }))}
            placeholder="e.g. 3x cost, competitive, premium pricing…"
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors"
          />
        </Field>

        <Field label="Monthly Profit Goal ($)">
          <input
            type="number"
            value={form.profitGoalMonthly ?? ""}
            onChange={e => setForm(f => ({ ...f, profitGoalMonthly: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder="e.g. 5000"
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors"
          />
        </Field>

        <Field label="Store Context">
          <textarea
            value={form.storeContext ?? ""}
            onChange={e => setForm(f => ({ ...f, storeContext: e.target.value }))}
            placeholder="Anything else Nova should know about your store, products, or goals…"
            rows={3}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/60 transition-colors resize-none"
          />
        </Field>
      </div>

      <div className="px-4 py-4 border-t border-zinc-800/60">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save to Nova's Memory"}
        </button>
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
