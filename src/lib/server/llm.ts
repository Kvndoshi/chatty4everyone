import "server-only";
import type { ChatMessage } from "@/lib/bot";

// Overridable for OpenRouter-compatible gateways/proxies (and local testing).
const OPENROUTER = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");

export class UpstreamError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function upstreamError(res: Response): Promise<UpstreamError> {
  const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  const detail = data?.error?.message;
  if (res.status === 401) return new UpstreamError("The OpenRouter API key was rejected. Check it in the AI tab.", 401);
  if (res.status === 402) return new UpstreamError("The OpenRouter account is out of credits.", 402);
  if (res.status === 429) return new UpstreamError("The AI provider is rate limiting requests. Try again in a moment.", 429);
  return new UpstreamError(detail ? `AI provider error: ${detail}` : `AI provider error (${res.status}).`, res.status);
}

/**
 * Streams a chat completion from OpenRouter and returns a stream of plain text
 * deltas. Throws UpstreamError before streaming starts if the request fails.
 */
export async function streamCompletion(opts: {
  apiKey: string;
  model: string;
  temperature: number;
  messages: { role: "system" | ChatMessage["role"]; content: string }[];
  referer?: string;
  signal?: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OPENROUTER}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Chatty4Everyone",
      ...(opts.referer ? { "HTTP-Referer": opts.referer } : {}),
    },
    body: JSON.stringify({ model: opts.model, messages: opts.messages, temperature: opts.temperature, max_tokens: 900, stream: true }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) throw await upstreamError(res);

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buf += dec.decode(value, { stream: true });
        let out = "";
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue; // comments like ": OPENROUTER PROCESSING"
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[]; error?: { message?: string } };
            if (json.error?.message) out += `\n\n⚠️ ${json.error.message}`;
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) out += delta;
          } catch {
            // ignore partial / non-JSON lines
          }
        }
        if (out) {
          controller.enqueue(enc.encode(out));
          return;
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/** Checks an OpenRouter key without spending credits. */
export async function checkOpenRouterKey(apiKey: string): Promise<{ ok: true; label: string } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(`${OPENROUTER}/key`, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach OpenRouter. Try again in a moment." };
  }
  if (res.status === 401 || res.status === 403) return { ok: false, error: "That key was rejected by OpenRouter." };
  if (!res.ok) return { ok: false, error: `OpenRouter returned ${res.status}. Try again.` };
  const data = (await res.json().catch(() => null)) as { data?: { label?: string } } | null;
  return { ok: true, label: data?.data?.label || "OpenRouter key" };
}

/** Public model list for the model picker. */
export async function listModels(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${OPENROUTER}/models`, { next: { revalidate: 3600 } }).catch(() => null);
  if (!res) return [];
  if (!res.ok) return [];
  const data = (await res.json().catch(() => null)) as { data?: { id: string; name?: string }[] } | null;
  return (data?.data ?? []).map((m) => ({ id: m.id, name: m.name || m.id }));
}
