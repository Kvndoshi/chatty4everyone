import "server-only";

// Fixed-window, in-memory rate limiter. Per server instance only — good enough
// to stop accidental loops and casual abuse; put a shared limiter (e.g. Upstash
// Ratelimit) in front for multi-instance deployments.

const windows = new Map<string, { start: number; count: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now - w.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 10_000) {
      for (const [k, v] of windows) if (now - v.start >= windowMs) windows.delete(k);
    }
    return true;
  }
  w.count += 1;
  return w.count <= max;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "local";
}
