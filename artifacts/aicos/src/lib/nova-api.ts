const BASE = "/api/nova";

export type NovaConversation = {
  id: string;
  title: string;
  type: "chat" | "daily_briefing" | "weekly_report" | "monthly_report";
  createdAt: string;
  updatedAt: string;
};

export type NovaMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type NovaMemory = {
  id?: string;
  userId?: string;
  preferredNiche?: string | null;
  preferredSuppliers?: string[];
  preferredCountries?: string[];
  brandVoice?: string | null;
  pricingStrategy?: string | null;
  profitGoalMonthly?: number | null;
  storeContext?: string | null;
};

export async function fetchConversations(): Promise<NovaConversation[]> {
  const res = await fetch(`${BASE}/conversations`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function createConversation(title = "New conversation", type = "chat"): Promise<NovaConversation> {
  const res = await fetch(`${BASE}/conversations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, type }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  await fetch(`${BASE}/conversations/${id}`, { method: "DELETE", credentials: "include" });
}

export async function renameConversation(id: string, title: string): Promise<NovaConversation> {
  const res = await fetch(`${BASE}/conversations/${id}/title`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename");
  return res.json();
}

export async function fetchMessages(conversationId: string): Promise<NovaMessage[]> {
  const res = await fetch(`${BASE}/conversations/${conversationId}/messages`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function fetchMemory(): Promise<NovaMemory | null> {
  const res = await fetch(`${BASE}/memory`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function saveMemory(data: Partial<NovaMemory>): Promise<NovaMemory> {
  const res = await fetch(`${BASE}/memory`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save memory");
  return res.json();
}

export async function* streamMessage(conversationId: string, content: string): AsyncGenerator<string> {
  const res = await fetch(`${BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok || !res.body) throw new Error("Stream failed");
  yield* parseSSEStream(res.body);
}

export async function* streamBriefing(
  type: "daily_briefing" | "weekly_report" | "monthly_report"
): AsyncGenerator<{ content?: string; conversationId?: string; done?: boolean }> {
  const res = await fetch(`${BASE}/generate-briefing`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!res.ok || !res.body) throw new Error("Stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {}
      }
    }
  }
}

async function* parseSSEStream(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const obj = JSON.parse(line.slice(6));
          if (obj.content) yield obj.content;
          if (obj.done) return;
        } catch {}
      }
    }
  }
}
