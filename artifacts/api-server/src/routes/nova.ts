import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  novaConversationsTable,
  novaMessagesTable,
  novaMemoryTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { groq, NOVA_MODEL } from "../lib/groq";
import { buildNovaSystemPrompt } from "../lib/nova-system-prompt";
import { logger } from "../lib/logger";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = auth.userId;
  next();
}

router.use(requireAuth);

// GET /nova/memory
router.get("/memory", async (req: any, res) => {
  try {
    const [mem] = await db
      .select()
      .from(novaMemoryTable)
      .where(eq(novaMemoryTable.userId, req.userId));
    res.json(mem ?? null);
  } catch (err) {
    logger.error({ err }, "GET /nova/memory error");
    res.status(500).json({ error: "Failed to fetch memory" });
  }
});

// PUT /nova/memory
router.put("/memory", async (req: any, res) => {
  try {
    const body = req.body;
    const [existing] = await db
      .select()
      .from(novaMemoryTable)
      .where(eq(novaMemoryTable.userId, req.userId));

    if (existing) {
      const [updated] = await db
        .update(novaMemoryTable)
        .set({ ...body, userId: req.userId })
        .where(eq(novaMemoryTable.userId, req.userId))
        .returning();
      return res.json(updated);
    } else {
      const [created] = await db
        .insert(novaMemoryTable)
        .values({ ...body, userId: req.userId })
        .returning();
      return res.json(created);
    }
  } catch (err) {
    logger.error({ err }, "PUT /nova/memory error");
    res.status(500).json({ error: "Failed to save memory" });
  }
});

// GET /nova/conversations
router.get("/conversations", async (req: any, res) => {
  try {
    const convos = await db
      .select()
      .from(novaConversationsTable)
      .where(eq(novaConversationsTable.userId, req.userId))
      .orderBy(desc(novaConversationsTable.updatedAt));
    res.json(convos);
  } catch (err) {
    logger.error({ err }, "GET /nova/conversations error");
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// POST /nova/conversations
router.post("/conversations", async (req: any, res) => {
  try {
    const { title = "New conversation", type = "chat" } = req.body;
    const [conv] = await db
      .insert(novaConversationsTable)
      .values({ userId: req.userId, title, type })
      .returning();
    res.status(201).json(conv);
  } catch (err) {
    logger.error({ err }, "POST /nova/conversations error");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// DELETE /nova/conversations/:id
router.delete("/conversations/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const [conv] = await db
      .select()
      .from(novaConversationsTable)
      .where(and(eq(novaConversationsTable.id, id), eq(novaConversationsTable.userId, req.userId)));
    if (!conv) return res.status(404).json({ error: "Not found" });

    await db.delete(novaConversationsTable).where(eq(novaConversationsTable.id, id));
    res.status(204).end();
  } catch (err) {
    logger.error({ err }, "DELETE /nova/conversations/:id error");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// PATCH /nova/conversations/:id/title
router.patch("/conversations/:id/title", async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const [conv] = await db
      .update(novaConversationsTable)
      .set({ title })
      .where(and(eq(novaConversationsTable.id, id), eq(novaConversationsTable.userId, req.userId)))
      .returning();
    if (!conv) return res.status(404).json({ error: "Not found" });
    res.json(conv);
  } catch (err) {
    logger.error({ err }, "PATCH /nova/conversations/:id/title error");
    res.status(500).json({ error: "Failed to update title" });
  }
});

// GET /nova/conversations/:id/messages
router.get("/conversations/:id/messages", async (req: any, res) => {
  try {
    const { id } = req.params;
    const [conv] = await db
      .select()
      .from(novaConversationsTable)
      .where(and(eq(novaConversationsTable.id, id), eq(novaConversationsTable.userId, req.userId)));
    if (!conv) return res.status(404).json({ error: "Not found" });

    const msgs = await db
      .select()
      .from(novaMessagesTable)
      .where(eq(novaMessagesTable.conversationId, id))
      .orderBy(novaMessagesTable.createdAt);
    res.json(msgs);
  } catch (err) {
    logger.error({ err }, "GET /nova/conversations/:id/messages error");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /nova/conversations/:id/messages — streaming SSE
router.post("/conversations/:id/messages", async (req: any, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: "Message content required" });
  }

  try {
    const [conv] = await db
      .select()
      .from(novaConversationsTable)
      .where(and(eq(novaConversationsTable.id, id), eq(novaConversationsTable.userId, req.userId)));
    if (!conv) return res.status(404).json({ error: "Not found" });

    const [memory] = await db
      .select()
      .from(novaMemoryTable)
      .where(eq(novaMemoryTable.userId, req.userId));

    const history = await db
      .select()
      .from(novaMessagesTable)
      .where(eq(novaMessagesTable.conversationId, id))
      .orderBy(novaMessagesTable.createdAt);

    // Save user message
    await db.insert(novaMessagesTable).values({
      conversationId: id,
      role: "user",
      content,
    });

    // Auto-update title on first message
    if (history.length === 0) {
      const shortTitle = content.slice(0, 60) + (content.length > 60 ? "…" : "");
      await db
        .update(novaConversationsTable)
        .set({ title: shortTitle })
        .where(eq(novaConversationsTable.id, id));
    }

    const systemPrompt = buildNovaSystemPrompt(memory ?? null);
    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-30) // keep last 30 messages for context
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";

    const stream = await groq.chat.completions.create({
      model: NOVA_MODEL,
      messages: chatMessages,
      stream: true,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(novaMessagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    logger.error({ err }, "POST /nova/conversations/:id/messages error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process message" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

// POST /nova/generate-briefing — generate a daily/weekly/monthly report
router.post("/generate-briefing", async (req: any, res) => {
  const { type = "daily_briefing" } = req.body;

  const typeLabels: Record<string, string> = {
    daily_briefing: "Daily Briefing",
    weekly_report: "Weekly Report",
    monthly_report: "Monthly Report",
  };

  try {
    const [memory] = await db
      .select()
      .from(novaMemoryTable)
      .where(eq(novaMemoryTable.userId, req.userId));

    // Create a new conversation for this briefing
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const [conv] = await db
      .insert(novaConversationsTable)
      .values({
        userId: req.userId,
        title: `${typeLabels[type]} — ${today}`,
        type,
      })
      .returning();

    const systemPrompt = buildNovaSystemPrompt(memory ?? null);
    const promptMap: Record<string, string> = {
      daily_briefing: `Generate my Daily Briefing for today (${today}). Include: overnight activity summary, today's top opportunities, key risks to watch, product recommendations, and today's action items. Make it feel like I'm walking into the office and you've already started working.`,
      weekly_report: `Generate my Weekly Report for the week ending ${today}. Include: performance summary, top wins and losses, trend analysis, product performance highlights, supplier updates, marketing insights, and next week's priorities.`,
      monthly_report: `Generate my Monthly Report for the month ending ${today}. Include: revenue overview, growth analysis, top performing products, audience insights, competitor landscape, what worked and what didn't, and strategic recommendations for next month.`,
    };

    const userPrompt = promptMap[type] ?? promptMap.daily_briefing;

    await db.insert(novaMessagesTable).values({
      conversationId: conv.id,
      role: "user",
      content: userPrompt,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send conversation ID first so client can navigate
    res.write(`data: ${JSON.stringify({ conversationId: conv.id })}\n\n`);

    let fullResponse = "";
    const stream = await groq.chat.completions.create({
      model: NOVA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    await db.insert(novaMessagesTable).values({
      conversationId: conv.id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    logger.error({ err }, "POST /nova/generate-briefing error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate briefing" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
