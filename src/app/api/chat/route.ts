import { sanitizeAI, type AISettings, type ChatMessage } from "@/lib/bot";
import { BOT_ID_RE, botKeys, isOwner, json, systemPrompt } from "@/lib/server/bots";
import { verifySession } from "@/lib/server/crypto";
import { searchKnowledge } from "@/lib/server/knowledge";
import { streamCompletion, UpstreamError } from "@/lib/server/llm";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";

export const runtime = "nodejs";

// One endpoint, three callers:
//  • draft   — the editor before publishing; the owner's key rides in the body.
//  • owner   — the editor after publishing; edit token + draft AI settings.
//  • visitor — the embed widget; a session token minted by the embed page.

function parseMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 30) return null;
  const out: ChatMessage[] = [];
  for (const m of input) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    out.push({ role, content: content.slice(0, 4000) });
  }
  return out[out.length - 1].role === "user" ? out : null;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);
  const messages = parseMessages(body.messages);
  if (!messages) return json({ error: "Invalid messages." }, 400);
  const ip = clientIp(req);

  let apiKey: string | null = null;
  let memoryKey: string | null = null;
  let ai: AISettings;
  let botName = typeof body.botName === "string" ? body.botName.slice(0, 40) : "";
  const keys = (body.keys && typeof body.keys === "object" ? body.keys : {}) as Record<string, unknown>;

  if (typeof keys.openrouter === "string" && keys.openrouter.trim()) {
    if (!rateLimit(`draft:${ip}`, 30, 60_000)) return json({ error: "Too many messages — slow down a little." }, 429);
    apiKey = keys.openrouter.trim();
    memoryKey = typeof keys.supermemory === "string" && keys.supermemory.trim() ? keys.supermemory.trim() : null;
    ai = sanitizeAI(body.ai);
  } else if (typeof body.botId === "string" && BOT_ID_RE.test(body.botId)) {
    const bot = await getStore().get(body.botId);
    if (!bot) return json({ error: "This assistant no longer exists." }, 404);
    if (isOwner(bot, body.editToken)) {
      if (!rateLimit(`owner:${ip}`, 30, 60_000)) return json({ error: "Too many messages — slow down a little." }, 429);
      ai = body.ai ? sanitizeAI(body.ai) : bot.ai;
      botName ||= bot.widget.botName;
    } else if (verifySession(bot.id, body.session)) {
      if (!rateLimit(`visitor:${ip}:${bot.id}`, 20, 60_000) || !rateLimit(`bot:${bot.id}`, 600, 60_000)) {
        return json({ error: "Lots of questions right now — please try again in a minute." }, 429);
      }
      ai = bot.ai;
      botName = bot.widget.botName;
    } else {
      return json({ error: "Your session expired. Reload the page to keep chatting." }, 401);
    }
    const k = botKeys(bot);
    apiKey = k.openrouter;
    memoryKey = k.supermemory;
  } else {
    return json({ error: "Connect an AI key to start chatting." }, 400);
  }

  if (!apiKey) return json({ error: "This assistant has no AI key configured yet." }, 400);

  let knowledge: string[] = [];
  if (memoryKey && ai.knowledgeNamespace) {
    try {
      knowledge = await searchKnowledge(memoryKey, ai.knowledgeNamespace, messages[messages.length - 1].content);
    } catch (e) {
      console.warn("[chat] knowledge search failed:", e instanceof Error ? e.message : e);
    }
  }

  try {
    const stream = await streamCompletion({
      apiKey,
      model: ai.model,
      temperature: ai.temperature,
      messages: [{ role: "system", content: systemPrompt(ai, botName, knowledge) }, ...messages],
      referer: req.headers.get("origin") ?? undefined,
      signal: req.signal,
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
    });
  } catch (e) {
    if (e instanceof UpstreamError) return json({ error: e.message }, e.status === 429 ? 429 : e.status === 401 || e.status === 402 ? 400 : 502);
    console.error("[chat] upstream failure:", e);
    return json({ error: "Couldn't reach the AI provider. Try again." }, 502);
  }
}
