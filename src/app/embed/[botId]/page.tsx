import type { Metadata } from "next";
import { headers } from "next/headers";
import { BOT_ID_RE, domainAllowed } from "@/lib/server/bots";
import { signSession } from "@/lib/server/crypto";
import { getStore } from "@/lib/server/store";
import { EmbedClient, EmbedUnavailable } from "./EmbedClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chat", robots: { index: false, follow: false } };

// Loaded inside an iframe by public/widget.js. The loader sets
// referrerpolicy="origin", so the Referer header tells us which site is
// embedding the bot and we can enforce the owner's allowed domains.
export default async function EmbedPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const bot = BOT_ID_RE.test(botId) ? await getStore().get(botId) : null;
  if (!bot) return <EmbedUnavailable reason="This assistant doesn't exist (check the data-bot id)." />;

  const h = await headers();
  let refHost = "";
  try {
    refHost = new URL(h.get("referer") ?? "").hostname;
  } catch {}
  const selfHost = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(":")[0];
  if (bot.ai.allowedDomains.length && !(refHost && (refHost === selfHost || domainAllowed(bot.ai.allowedDomains, refHost)))) {
    return <EmbedUnavailable reason={`This assistant isn't enabled for ${refHost || "this site"}. Add the domain under AI → Allowed websites.`} />;
  }

  return <EmbedClient botId={bot.id} cfg={bot.widget} session={signSession(bot.id)} />;
}
