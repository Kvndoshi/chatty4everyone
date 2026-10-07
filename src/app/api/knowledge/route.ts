import { BOT_ID_RE, botKeys, isOwner, json } from "@/lib/server/bots";
import { addKnowledge } from "@/lib/server/knowledge";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";

export const runtime = "nodejs";

const NS_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/**
 * Adds web pages to a bot's knowledge base. Supermemory downloads and indexes
 * the URLs on its side. Auth: the owner's Supermemory key (before publishing)
 * or the bot's edit token (after).
 */
export async function POST(req: Request) {
  if (!rateLimit(`knowledge:${clientIp(req)}`, 10, 60_000)) return json({ error: "Too many requests. Wait a minute." }, 429);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);

  let key = typeof body.supermemoryKey === "string" ? body.supermemoryKey.trim() : "";
  let namespace = typeof body.namespace === "string" ? body.namespace : "";
  if (!key && typeof body.botId === "string" && BOT_ID_RE.test(body.botId)) {
    const bot = await getStore().get(body.botId);
    if (!bot || !isOwner(bot, body.editToken)) return json({ error: "Not allowed." }, 403);
    key = botKeys(bot).supermemory ?? "";
    namespace = bot.ai.knowledgeNamespace;
  }
  if (!key) return json({ error: "Connect a Supermemory key to add knowledge." }, 400);
  if (!NS_RE.test(namespace)) return json({ error: "Invalid knowledge namespace." }, 400);

  const urls = (Array.isArray(body.urls) ? body.urls : [])
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter((u) => {
      try {
        const p = new URL(u);
        return p.protocol === "https:" || p.protocol === "http:";
      } catch {
        return false;
      }
    })
    .slice(0, 10);
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 50_000) : "";
  if (!urls.length && !text) return json({ error: "Add at least one page URL or some text." }, 400);

  const results = await Promise.allSettled([...urls, ...(text ? [text] : [])].map((content) => addKnowledge(key, namespace, content)));
  const failed = results.flatMap((r, i) => (r.status === "rejected" ? [i < urls.length ? urls[i] : "text"] : []));
  if (failed.length === results.length) return json({ error: "Supermemory rejected the request. Check your key and try again.", failed }, 502);
  return json({ added: results.length - failed.length, failed });
}
