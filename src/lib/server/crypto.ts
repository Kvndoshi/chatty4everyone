import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// All secrets derive from CHATTY_SECRET. API keys are stored encrypted
// (AES-256-GCM) and only decrypted inside the chat route.

let warned = false;

function masterSecret(): string {
  const s = process.env.CHATTY_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CHATTY_SECRET must be set (16+ characters) to store bots in production.");
  }
  if (!warned) {
    warned = true;
    console.warn("[chatty] CHATTY_SECRET is not set — using an insecure development secret.");
  }
  return "chatty4everyone-insecure-dev-secret";
}

const derive = (purpose: string) => createHash("sha256").update(`${masterSecret()}:${purpose}`).digest();

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", derive("enc"), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decrypt(blob: string): string {
  const buf = Buffer.from(blob, "base64");
  const decipher = createDecipheriv("aes-256-gcm", derive("enc"), buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const sign = (data: string) => createHmac("sha256", derive("sig")).update(data).digest("base64url");

/** Short-lived token proving a visitor loaded the embed page for this bot. */
export function signSession(botId: string, ttlSeconds = 4 * 3600): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${exp}.${sign(`${botId}.${exp}`)}`;
}

export function verifySession(botId: string, token: unknown): boolean {
  if (typeof token !== "string") return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000 || !sig) return false;
  return safeEqual(sig, sign(`${botId}.${exp}`));
}

const B32 = "abcdefghijkmnpqrstuvwxyz23456789";
export function randomId(prefix: string, len = 12): string {
  const bytes = randomBytes(len);
  let out = "";
  for (const b of bytes) out += B32[b % B32.length];
  return `${prefix}_${out}`;
}

export const randomToken = () => randomBytes(24).toString("base64url");
