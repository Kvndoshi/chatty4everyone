import { json } from "@/lib/server/bots";
import { checkSupermemoryKey } from "@/lib/server/knowledge";
import { checkOpenRouterKey } from "@/lib/server/llm";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

/** Setup flow "Verify" button: confirms a key works without storing it. */
export async function POST(req: Request) {
  if (!rateLimit(`verify:${clientIp(req)}`, 20, 60_000)) return json({ ok: false, error: "Too many attempts. Wait a minute." }, 429);
  const body = (await req.json().catch(() => null)) as { provider?: unknown; key?: unknown } | null;
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  if (!key || key.length > 300) return json({ ok: false, error: "Paste a key first." }, 400);
  try {
    if (body?.provider === "openrouter") return json(await checkOpenRouterKey(key));
    if (body?.provider === "supermemory") return json(await checkSupermemoryKey(key));
  } catch {
    return json({ ok: false, error: "Couldn't reach the provider. Check your connection and try again." }, 502);
  }
  return json({ ok: false, error: "Unknown provider." }, 400);
}
