import { sanitizeAI } from "@/lib/bot";
import { json } from "@/lib/server/bots";
import { encrypt, randomId, randomToken, sha256 } from "@/lib/server/crypto";
import { checkSupermemoryKey } from "@/lib/server/knowledge";
import { checkOpenRouterKey } from "@/lib/server/llm";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";
import { sanitizeWidget } from "@/lib/widget";

export const runtime = "nodejs";

/** Publish a new bot. Returns its public id and a private edit token. */
export async function POST(req: Request) {
  if (!rateLimit(`create:${clientIp(req)}`, 10, 3_600_000)) return json({ error: "Too many bots created from this network. Try again later." }, 429);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);
  const keys = (body.keys && typeof body.keys === "object" ? body.keys : {}) as Record<string, unknown>;
  const openrouter = typeof keys.openrouter === "string" ? keys.openrouter.trim() : "";
  const supermemory = typeof keys.supermemory === "string" ? keys.supermemory.trim() : "";
  if (!openrouter) return json({ error: "Add your OpenRouter API key before publishing." }, 400);

  const check = await checkOpenRouterKey(openrouter);
  if (!check.ok) return json({ error: check.error }, 400);
  if (supermemory) {
    const sm = await checkSupermemoryKey(supermemory);
    if (!sm.ok) return json({ error: sm.error }, 400);
  }

  const id = randomId("bot");
  const editToken = randomToken();
  const now = new Date().toISOString();
  const ai = sanitizeAI(body.ai);
  if (!ai.knowledgeNamespace) ai.knowledgeNamespace = id.replace("_", "-");
  await getStore().put({
    id,
    editTokenHash: sha256(editToken),
    createdAt: now,
    updatedAt: now,
    widget: sanitizeWidget(body.widget),
    ai,
    secrets: { openrouter: encrypt(openrouter), ...(supermemory ? { supermemory: encrypt(supermemory) } : {}) },
  });
  return json({ botId: id, editToken, knowledgeNamespace: ai.knowledgeNamespace }, 201);
}
