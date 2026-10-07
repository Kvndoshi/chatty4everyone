import "server-only";
import Supermemory from "supermemory";

// Knowledge base = one Supermemory namespace per bot. Supermemory fetches and
// chunks URLs itself, so "learn from my website" is just add(url).

const client = (apiKey: string) => new Supermemory({ apiKey, timeoutInSeconds: 10, maxRetries: 1 });

export async function searchKnowledge(apiKey: string, namespace: string, query: string): Promise<string[]> {
  const res = await client(apiKey).search(namespace, { query: query.slice(0, 500), searchMode: "chunks", limit: 5 });
  return res.results
    .map((r) => r.chunk || r.memory || "")
    .filter(Boolean)
    .map((t) => t.slice(0, 1500));
}

export async function addKnowledge(apiKey: string, namespace: string, content: string): Promise<void> {
  await client(apiKey).add(namespace, { content });
}

export async function checkSupermemoryKey(apiKey: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await client(apiKey).search("c4e-key-check", { query: "ping", limit: 1 });
    return { ok: true };
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 401 || status === 403) return { ok: false, error: "That key was rejected by Supermemory." };
    // A 404 for an empty namespace still proves the key authenticated.
    if (status === 404) return { ok: true };
    return { ok: false, error: "Couldn't reach Supermemory. Try again." };
  }
}
