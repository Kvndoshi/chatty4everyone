import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AISettings } from "@/lib/bot";
import type { WidgetConfig } from "@/lib/widget";

export interface BotRecord {
  id: string;
  /** sha256 of the owner's edit token. */
  editTokenHash: string;
  createdAt: string;
  updatedAt: string;
  widget: WidgetConfig;
  ai: AISettings;
  /** AES-GCM encrypted API keys (see crypto.ts). Never sent to browsers. */
  secrets: { openrouter?: string; supermemory?: string };
}

interface Store {
  get(id: string): Promise<BotRecord | null>;
  put(bot: BotRecord): Promise<void>;
}

/** Upstash Redis over its REST API — works on serverless hosts. */
function upstashStore(url: string, token: string): Store {
  const call = async (cmd: string[]) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash error ${res.status}`);
    return ((await res.json()) as { result: unknown }).result;
  };
  return {
    async get(id) {
      const raw = await call(["GET", `c4e:bot:${id}`]);
      return typeof raw === "string" ? (JSON.parse(raw) as BotRecord) : null;
    },
    async put(bot) {
      await call(["SET", `c4e:bot:${bot.id}`, JSON.stringify(bot)]);
    },
  };
}

/**
 * JSON file on local disk — fine for localhost and single-server installs.
 * Not suitable for serverless hosts (their disk is ephemeral): set the
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN env vars there.
 */
function fileStore(file: string): Store {
  let chain: Promise<unknown> = Promise.resolve();
  const readAll = async (): Promise<Record<string, BotRecord>> => {
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw e;
    }
  };
  return {
    async get(id) {
      await chain;
      return (await readAll())[id] ?? null;
    },
    put(bot) {
      const job = chain.then(async () => {
        const all = await readAll();
        all[bot.id] = bot;
        await mkdir(path.dirname(file), { recursive: true });
        const tmp = `${file}.${process.pid}.tmp`;
        await writeFile(tmp, JSON.stringify(all, null, 2), { mode: 0o600 });
        await rename(tmp, file);
      });
      chain = job.catch(() => {});
      return job;
    },
  };
}

let store: Store | null = null;

export function getStore(): Store {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  store = url && token ? upstashStore(url, token) : fileStore(path.join(process.cwd(), ".data", "bots.json"));
  return store;
}
