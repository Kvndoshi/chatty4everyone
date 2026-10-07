import { sanitizeAI } from "@/lib/bot";
import { BOT_ID_RE, bearer, isOwner, json } from "@/lib/server/bots";
import { encrypt } from "@/lib/server/crypto";
import { checkSupermemoryKey } from "@/lib/server/knowledge";
import { checkOpenRouterKey } from "@/lib/server/llm";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";
import { sanitizeWidget } from "@/lib/widget";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function ownedBot(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!BOT_ID_RE.test(id)) return { error: json({ error: "Not found." }, 404) };
  const bot = await getStore().get(id);
  if (!bot) return { error: json({ error: "Not found." }, 404) };
  if (!isOwner(bot, bearer(req))) return { error: json({ error: "Not allowed." }, 403) };
  return { bot };
}

/** Owner view: settings without secrets, plus which keys are connected. */
export async function GET(req: Request, ctx: Ctx) {
  const r = await ownedBot(req, ctx);
  if (r.error) return r.error;
  const { bot } = r;
  return json({
    botId: bot.id,
    widget: bot.widget,
    ai: bot.ai,
    keys: { openrouter: !!bot.secrets.openrouter, supermemory: !!bot.secrets.supermemory },
    updatedAt: bot.updatedAt,
  });
}

/** Republish settings. Keys are only replaced when sent; `supermemory: null` removes it. */
export async function PUT(req: Request, ctx: Ctx) {
  if (!rateLimit(`update:${clientIp(req)}`, 60, 60_000)) return json({ error: "Too many updates. Try again shortly." }, 429);
  const r = await ownedBot(req, ctx);
  if (r.error) return r.error;
  const { bot } = r;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);

  const keys = (body.keys && typeof body.keys === "object" ? body.keys : {}) as Record<string, unknown>;
  const secrets = { ...bot.secrets };
  if (typeof keys.openrouter === "string" && keys.openrouter.trim()) {
    const check = await checkOpenRouterKey(keys.openrouter.trim());
    if (!check.ok) return json({ error: check.error }, 400);
    secrets.openrouter = encrypt(keys.openrouter.trim());
  }
  if (typeof keys.supermemory === "string" && keys.supermemory.trim()) {
    const sm = await checkSupermemoryKey(keys.supermemory.trim());
    if (!sm.ok) return json({ error: sm.error }, 400);
    secrets.supermemory = encrypt(keys.supermemory.trim());
  } else if (keys.supermemory === null) {
    delete secrets.supermemory;
  }

  const ai = body.ai ? sanitizeAI(body.ai) : bot.ai;
  if (!ai.knowledgeNamespace) ai.knowledgeNamespace = bot.ai.knowledgeNamespace || bot.id.replace("_", "-");
  await getStore().put({
    ...bot,
    widget: body.widget ? sanitizeWidget(body.widget) : bot.widget,
    ai,
    secrets,
    updatedAt: new Date().toISOString(),
  });
  return json({ botId: bot.id, knowledgeNamespace: ai.knowledgeNamespace });
}
