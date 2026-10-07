import "server-only";
import type { AISettings } from "@/lib/bot";
import { decrypt, safeEqual, sha256 } from "./crypto";
import type { BotRecord } from "./store";

export const BOT_ID_RE = /^bot_[a-z0-9]{8,32}$/;

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export function isOwner(bot: BotRecord, token: unknown): boolean {
  return typeof token === "string" && token.length > 10 && safeEqual(sha256(token), bot.editTokenHash);
}

export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  return h?.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

export function botKeys(bot: BotRecord): { openrouter: string | null; supermemory: string | null } {
  const dec = (v?: string) => {
    if (!v) return null;
    try {
      return decrypt(v);
    } catch {
      return null;
    }
  };
  return { openrouter: dec(bot.secrets.openrouter), supermemory: dec(bot.secrets.supermemory) };
}

export function systemPrompt(ai: AISettings, botName: string, knowledge: string[]): string {
  const where = ai.website ? `the website ${ai.website}` : "a website";
  let s = `${ai.systemPrompt.trim()}

Your name is ${botName || "Assistant"}. You are talking to a visitor through a small chat widget on ${where}.
Reply in the visitor's language. Keep answers short (a few sentences or a brief list) and use simple markdown only: **bold**, lists and [links](https://example.com).
If you don't know something, say so honestly instead of guessing.`;
  if (knowledge.length) {
    s += `

Relevant information from the site's knowledge base. Use it when it answers the question and don't mention where it came from:
---
${knowledge.join("\n---\n")}
---`;
  }
  return s;
}

/** Hostname match: "flowbase.io" allows flowbase.io and *.flowbase.io. */
export function domainAllowed(allowed: string[], host: string): boolean {
  if (!allowed.length) return true;
  const h = host.toLowerCase().replace(/^www\./, "");
  return allowed.some((d) => h === d || h.endsWith(`.${d}`));
}
