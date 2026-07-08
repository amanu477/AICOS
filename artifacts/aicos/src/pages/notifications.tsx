import { useState, useEffect } from "react";
import { Bell, Loader2, RefreshCw, Package, ShoppingCart, Zap, AlertCircle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { DashLayout } from "@/components/dashboard/dash-layout";
import { useCurrentStore } from "@/lib/use-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "order" | "product" | "sync" | "ai" | "alert" | "info";
  title: string;
  body: string;
  read: boolean;
  time: Date;
}

function seedNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "1", type: "order", title: "New order received", read: false,
      body: "Order #1042 for $248.00 from sarah@example.com is awaiting fulfillment.",
      time: new Date(now - 8 * 60 * 1000),
    },
    {
      id: "2", type: "ai", title: "AI optimization complete", read: false,
      body: "23 products have been optimized with AI-generated SEO titles, descriptions, and pricing suggestions. Ready to review.",
      time: new Date(now - 25 * 60 * 1000),
    },
    {
      id: "3", type: "alert", title: "Low stock warning", read: false,
      body: "Vintage Denim Jacket (Size M) has only 2 units remaining in inventory.",
      time: new Date(now - 1.5 * 60 * 60 * 1000),
    },
    {
      id: "4", type: "sync", title: "Sync completed", read: true,
      body: "Products sync finished successfully. 147 products updated, 3 new products added.",
      time: new Date(now - 3 * 60 * 60 * 1000),
    },
    {
      id: "5", type: "order", title: "Order fulfilled", read: true,
      body: "Order #1039 has been marked as fulfilled and tracking info sent to customer.",
      time: new Date(now - 5 * 60 * 60 * 1000),
    },
    {
      id: "6", type: "ai", title: "AI pricing suggestion", read: true,
      body: "Nova AI suggests increasing the price of 'Classic White Sneakers' from $89 to $99 based on competitor pricing.",
      time: new Date(now - 24 * 60 * 60 * 1000),
    },
    {
      id: "7", type: "product", title: "Product published", read: true,
      body: "AI optimizations for 'Merino Wool Sweater' have been published to Shopify.",
      time: new Date(now - 26 * 60 * 60 * 1000),
    },
    {
      id: "8", type: "alert", title: "Refund issued", read: true,
      body: "A refund of $64.00 was issued for order #1031. Reason: Wrong size.",
      time: new Date(now - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "9", type: "info", title: "Weekly store summary", read: true,
      body: "This week: $3,248 revenue (+12%), 47 orders, 3 new customers. Your best performing product was 'Canvas Tote Bag'.",
      time: new Date(now - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "10", type: "sync", title: "Orders sync complete", read: true,
      body: "Orders sync completed. 12 new orders imported.",
      time: new Date(now - 4 * 24 * 60 * 60 * 1000),
    },
  ];
}

const TYPE_CONFIG: Record<Notification["type"], { icon: React.ElementType; color: string; bg: string }> = {
  order:   { icon: ShoppingCart, color: "text-blue-400",   bg: "bg-blue-400/10" },
  product: { icon: Package,      color: "text-violet-400", bg: "bg-violet-400/10" },
  sync:    { icon: RefreshCw,    color: "text-zinc-400",   bg: "bg-zinc-400/10" },
  ai:      { icon: Sparkles,     color: "text-violet-400", bg: "bg-violet-400/10" },
  alert:   { icon: AlertCircle,  color: "text-amber-400",  bg: "bg-amber-400/10" },
  info:    { icon: Info,         color: "text-zinc-400",   bg: "bg-zinc-400/10" },
};

function fmtRelative(d: Date) {
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.round(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h ago`;
  if (secs < 86400 * 7) return `${Math.round(secs / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDay(items: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;

  for (const n of items) {
    const d = new Date(n.time.getFullYear(), n.time.getMonth(), n.time.getDate()).getTime();
    const label = d === today ? "Today" : d === yesterday ? "Yesterday" : n.time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(n);
    } else {
      groups.push({ label, items: [n] });
    }
  }
  return groups;
}

export function NotificationsPage() {
  const { storeId } = useCurrentStore();
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  const visible = filter === "unread" ? notifications.filter(n => !n.read) : notifications;
  const groups = groupByDay(visible);

  return (
    <DashLayout
      title="Notifications"
      icon={Bell}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-800/60 overflow-hidden">
            {(["all", "unread"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  filter === f ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllRead} className="border-zinc-700 text-zinc-400 hover:text-white text-xs">
              Mark all read
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-2xl space-y-6">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-zinc-300">All caught up!</p>
            <p className="text-xs text-zinc-600">No {filter === "unread" ? "unread " : ""}notifications</p>
          </div>
        ) : (
          groups.map(group => (
            <section key={group.label}>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">{group.label}</h2>
              <div className="rounded-xl border border-zinc-800/60 overflow-hidden">
                {group.items.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-white/3",
                        i > 0 && "border-t border-zinc-800/40",
                        !n.read && "bg-white/2"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-xs font-semibold", n.read ? "text-zinc-300" : "text-white")}>{n.title}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-zinc-600">{fmtRelative(n.time)}</span>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </DashLayout>
  );
}
