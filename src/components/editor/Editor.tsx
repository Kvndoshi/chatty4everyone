"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  AppWindow, BrainCircuit, CircleDot, Code, Droplet, Eye, GripHorizontal, LayoutTemplate, Loader2, MessageSquare, Moon,
  Move, PanelLeft, PictureInPicture2, Redo, Rocket, Shuffle, Sparkle, Sun, Type, Undo, Wand2,
} from "lucide-react";
import type { PickTarget } from "@/components/chat/ChatWindow";
import { useChat, type BuildRequest } from "@/components/chat/useChat";
import {
  DEFAULT_AI, companyFromHost, hostOf, newNamespace, promptFor, sanitizeAI, getUseCase, type AISettings,
} from "@/lib/bot";
import { DEFAULT_WIDGET, PALETTES, PRESETS, isAlwaysOpen, sanitizeWidget, type Preset, type Template, type WidgetConfig } from "@/lib/widget";
import { AiPanel } from "./AiPanel";
import { CodeDrawer } from "./CodeDrawer";
import { DesignPanel } from "./Panels";
import { Setup, type SetupResult } from "./Setup";
import { Stage } from "./Stage";
import { TAB_INFO, type Keys, type Published, type Tab } from "./types";

// ───────────────────────────── persistence ─────────────────────────────

const LS = { cfg: "c4e-editor-cfg-v2", ai: "c4e-ai-v1", ui: "c4e-ui-v1", bot: "c4e-bot-v1", setup: "c4e-setup-done-v1" };
const SS_KEYS = "c4e-keys-v1";

function readJSON<T>(storage: "local" | "session", key: string, parse: (raw: unknown) => T, fallback: T): T {
  try {
    const s = (storage === "local" ? localStorage : sessionStorage).getItem(key);
    return s ? parse(JSON.parse(s)) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(storage: "local" | "session", key: string, value: unknown) {
  try {
    (storage === "local" ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
  } catch { /* storage full or blocked — the editor still works for this session */ }
}

interface PanelRect { x: number; y: number; w: number; h: number }
interface UiPrefs { theme: "dark" | "light"; accent: string; floating: boolean; rect: PanelRect }

const ACCENTS = ["#0f8b80", "#4f46e5", "#7c3aed", "#c2410c", "#be123c", "#15803d"];
const defaultUi = (): UiPrefs => ({
  theme: "dark",
  accent: "#0f8b80",
  floating: typeof window !== "undefined" && window.innerWidth < 900,
  rect: { x: 16, y: 16, w: 392, h: 560 },
});
const parseUi = (raw: unknown): UiPrefs => {
  const d = defaultUi();
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<UiPrefs>;
  const r = (o.rect ?? {}) as Partial<PanelRect>;
  const num = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
  return {
    theme: o.theme === "light" ? "light" : "dark",
    accent: typeof o.accent === "string" && /^#[0-9a-f]{6}$/i.test(o.accent) ? o.accent : d.accent,
    floating: typeof o.floating === "boolean" ? o.floating : d.floating,
    rect: { x: num(r.x, d.rect.x), y: num(r.y, d.rect.y), w: num(r.w, d.rect.w), h: num(r.h, d.rect.h) },
  };
};
const parsePublished = (raw: unknown): Published | null => {
  const o = raw as Partial<Published> | null;
  return o && typeof o.botId === "string" && typeof o.editToken === "string"
    ? { botId: o.botId, editToken: o.editToken, publishedAt: String(o.publishedAt ?? ""), hasOpenRouter: !!o.hasOpenRouter, hasSupermemory: !!o.hasSupermemory, snapshot: typeof o.snapshot === "string" ? o.snapshot : "" }
    : null;
};
const parseKeys = (raw: unknown): Keys => {
  const o = (raw ?? {}) as Partial<Keys>;
  return { openrouter: typeof o.openrouter === "string" ? o.openrouter : "", supermemory: typeof o.supermemory === "string" ? o.supermemory : "" };
};
const snapshotOf = (cfg: WidgetConfig, ai: AISettings) => JSON.stringify({ cfg, ai });

// ───────────────────────────── tabs ─────────────────────────────

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  type: <LayoutTemplate size={18} strokeWidth={1.8} />,
  launcher: <CircleDot size={18} strokeWidth={1.8} />,
  colours: <Droplet size={18} strokeWidth={1.8} />,
  position: <Move size={18} strokeWidth={1.8} />,
  bubbles: <MessageSquare size={18} strokeWidth={1.8} />,
  text: <Type size={18} strokeWidth={1.8} />,
  window: <AppWindow size={18} strokeWidth={1.8} />,
  bot: <Sparkle size={18} strokeWidth={1.8} />,
  ai: <BrainCircuit size={18} strokeWidth={1.8} />,
};
const tabsFor = (mode: "open" | "closed", template: Template): Tab[] =>
  mode === "closed" && !isAlwaysOpen(template) ? ["type", "launcher", "colours", "position", "ai"] : ["type", "colours", "bubbles", "text", "window", "bot", "ai"];

const iconBtn: CSSProperties = {
  width: 32, height: 32, border: "1px solid var(--line)", borderRadius: 9, background: "var(--surface)", color: "var(--text-2)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, flexShrink: 0,
};
const textBtn = (on = false): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 12px", border: `1px solid ${on ? "var(--accent-line)" : "var(--line)"}`,
  borderRadius: 9, background: on ? "var(--accent-soft)" : "var(--surface)", color: "var(--text)", font: "500 13px var(--font)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
});

// ───────────────────────────── editor ─────────────────────────────

export default function Editor() {
  const [hist, setHist] = useState(() => ({ cfg: readJSON("local", LS.cfg, sanitizeWidget, DEFAULT_WIDGET), past: [] as WidgetConfig[], future: [] as WidgetConfig[] }));
  const [ai, setAiState] = useState<AISettings>(() => readJSON("local", LS.ai, sanitizeAI, DEFAULT_AI));
  const [keys, setKeysState] = useState<Keys>(() => readJSON("session", SS_KEYS, parseKeys, { openrouter: "", supermemory: "" }));
  const [published, setPublished] = useState<Published | null>(() => readJSON("local", LS.bot, parsePublished, null));
  const [ui, setUi] = useState<UiPrefs>(() => readJSON("local", LS.ui, parseUi, defaultUi()));
  const [setupOpen, setSetupOpen] = useState(() => readJSON("local", LS.setup, (v) => v !== true, true));

  const [tab, setTab] = useState<Tab>("type");
  const [mode, setModeState] = useState<"open" | "closed">("open");
  const [hide, setHide] = useState(false);
  const [preview, setPreview] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [supportChat, setSupportChat] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [accentOpen, setAccentOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  const cfg = hist.cfg;
  const lastPush = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mainRef = useRef<HTMLDivElement>(null);
  const [origin] = useState(() => process.env.NEXT_PUBLIC_APP_URL || window.location.origin);

  useEffect(() => writeJSON("local", LS.cfg, cfg), [cfg]);
  useEffect(() => writeJSON("local", LS.ai, ai), [ai]);
  useEffect(() => writeJSON("session", SS_KEYS, keys), [keys]);
  useEffect(() => writeJSON("local", LS.ui, ui), [ui]);
  useEffect(() => { if (published) writeJSON("local", LS.bot, published); else try { localStorage.removeItem(LS.bot); } catch {} }, [published]);
  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(replayTimer.current); }, []);

  const notify = useCallback((text: string, error = false) => {
    setToast({ text, error });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), error ? 6000 : 3800);
  }, []);

  // Changes made within 450ms are one undo step (so slider drags don't flood history).
  const update = useCallback((patch: Partial<WidgetConfig>) => {
    const now = Date.now();
    const push = now - lastPush.current > 450;
    lastPush.current = now;
    setHist((h) => ({ cfg: { ...h.cfg, ...patch }, past: push ? [...h.past, h.cfg].slice(-60) : h.past, future: [] }));
  }, []);
  const undo = useCallback(() => setHist((h) => (h.past.length ? { cfg: h.past[h.past.length - 1], past: h.past.slice(0, -1), future: [h.cfg, ...h.future] } : h)), []);
  const redo = useCallback(() => setHist((h) => (h.future.length ? { cfg: h.future[0], past: [...h.past, h.cfg], future: h.future.slice(1) } : h)), []);
  const setAI = useCallback((patch: Partial<AISettings>) => setAiState((a) => ({ ...a, ...patch })), []);
  const setKeys = useCallback((patch: Partial<Keys>) => setKeysState((k) => ({ ...k, ...patch })), []);

  const setMode = useCallback((m: "open" | "closed") => {
    if (m === "closed") setSupportChat(false);
    setModeState(m);
    setTab((t) => (tabsFor(m, cfg.template).includes(t) ? t : m === "open" ? "window" : "launcher"));
  }, [cfg.template]);
  const replay = useCallback(() => {
    setMode("open");
    setHide(true);
    clearTimeout(replayTimer.current);
    replayTimer.current = setTimeout(() => setHide(false), 90);
  }, [setMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Preview chat: draft key → owner (published) → canned demo replies.
  const buildRequest = useCallback<BuildRequest>((history) => {
    if (keys.openrouter.trim()) {
      return { url: "/api/chat", body: { messages: history, keys: { openrouter: keys.openrouter.trim(), supermemory: keys.supermemory.trim() }, ai, botName: cfg.botName } };
    }
    if (published?.hasOpenRouter) {
      return { url: "/api/chat", body: { messages: history, botId: published.botId, editToken: published.editToken, ai, botName: cfg.botName } };
    }
    return null;
  }, [keys, published, ai, cfg.botName]);
  const chat = useChat(buildRequest);

  const togglePreview = () => {
    setPreview((p) => {
      if (p) chat.reset();
      return !p;
    });
    setCodeOpen(false);
    setSupportChat(false);
  };

  const onPick = (t: PickTarget) => {
    setModeState("open");
    setTab(t);
  };

  const shuffle = () => {
    const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const presets = Object.keys(PRESETS) as Preset[];
    const pk = presets[Math.floor(Math.random() * presets.length)];
    const tps: Template[] = ["bubble", "support", "bar", "search", "sidebar"];
    update({ palette: pal.name, primary: pal.primary, secondary: pal.secondary, bg: pal.bg, text: pal.text, preset: pk, ...PRESETS[pk], template: tps[Math.floor(Math.random() * tps.length)], userBg: "", botBg: "", userText: "", botText: "" });
    replay();
  };

  const dirty = !!published && published.snapshot !== snapshotOf(cfg, ai);

  const publish = async () => {
    if (!keys.openrouter.trim() && !published?.hasOpenRouter) {
      setTab("ai");
      notify("Add your OpenRouter API key (AI tab) before publishing.", true);
      return;
    }
    setPublishing(true);
    try {
      const sendKeys: Record<string, string> = {};
      if (keys.openrouter.trim()) sendKeys.openrouter = keys.openrouter.trim();
      if (keys.supermemory.trim()) sendKeys.supermemory = keys.supermemory.trim();
      const body = JSON.stringify({ widget: cfg, ai, keys: sendKeys });
      const res = published
        ? await fetch(`/api/bots/${published.botId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${published.editToken}` }, body })
        : await fetch("/api/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await res.json().catch(() => ({}));
      if (published && (res.status === 403 || res.status === 404)) {
        setPublished(null);
        throw new Error("This browser can no longer update that bot. Click Publish again to create a new one.");
      }
      if (!res.ok) throw new Error(data.error || `Publishing failed (${res.status}).`);
      const nextAi = { ...ai, knowledgeNamespace: data.knowledgeNamespace || ai.knowledgeNamespace };
      setAiState(nextAi);
      setPublished({
        botId: data.botId,
        editToken: published?.editToken ?? data.editToken,
        publishedAt: new Date().toISOString(),
        hasOpenRouter: true,
        hasSupermemory: !!published?.hasSupermemory || !!sendKeys.supermemory,
        snapshot: snapshotOf(cfg, nextAi),
      });
      // Keys now live (encrypted) on the server; drop the browser copy.
      setKeysState({ openrouter: "", supermemory: "" });
      setCodeOpen(true);
      notify(published ? "Changes are live." : "Published! Paste the code below into your site.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Publishing failed.", true);
    } finally {
      setPublishing(false);
    }
  };

  const onSetupDone = (r: SetupResult) => {
    const host = hostOf(r.website);
    const company = companyFromHost(host) || r.botName;
    const uc = getUseCase(r.useCase);
    update({
      botName: r.botName,
      placeholder: `Ask ${r.botName} anything…`,
      welcome: uc.welcome(r.botName, company),
      suggestions: uc.suggestions,
      teaserText: uc.teaser,
      avatar: cfg.avatar === DEFAULT_WIDGET.avatar && company ? company[0].toUpperCase() : cfg.avatar,
      ...(r.useCase === "support" ? { template: "support" as const } : r.useCase === "docs" ? { template: "search" as const } : {}),
    });
    const ns = r.keys.supermemory.trim() ? ai.knowledgeNamespace || newNamespace(host || r.botName) : ai.knowledgeNamespace;
    setAI({
      website: r.website,
      useCase: r.useCase,
      systemPrompt: promptFor(r.useCase, r.botName, company) + (r.notes ? `\n\nImportant facts to keep in mind:\n${r.notes}` : ""),
      allowedDomains: host ? [host] : ai.allowedDomains,
      knowledgeNamespace: ns,
    });
    setKeysState(r.keys);
    setSetupOpen(false);
    writeJSON("local", LS.setup, true);
    replay();
    if (r.learnFromSite && host) {
      fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supermemoryKey: r.keys.supermemory.trim(), namespace: ns, urls: [`https://${host}`] }),
      })
        .then((res) => res.json().then((d) => (res.ok ? notify(`Learning from ${host} — give it a minute.`) : notify(d.error || "Couldn't add your website.", true))))
        .catch(() => notify("Couldn't add your website to the knowledge base.", true));
    }
    notify(r.keys.openrouter.trim() ? `${r.botName} is ready — hit Preview and ask it something.` : "Design away! Add an AI key in the AI tab when you're ready.");
  };
  const skipSetup = () => {
    setSetupOpen(false);
    writeJSON("local", LS.setup, true);
  };

  // ─── floating panel drag / resize ───
  const clampRect = (r: PanelRect): PanelRect => {
    const box = mainRef.current?.getBoundingClientRect();
    const W = box?.width ?? window.innerWidth, H = box?.height ?? window.innerHeight;
    const w = Math.min(Math.max(320, r.w), Math.max(320, W - 24)), h = Math.min(Math.max(320, r.h), Math.max(320, H - 24));
    let x = Math.min(Math.max(0, r.x), Math.max(0, W - w)), y = Math.min(Math.max(0, r.y), Math.max(0, H - h));
    // Snap to a 12px margin when close to an edge.
    if (x < 28) x = 12; if (y < 28) y = 12;
    if (W - (x + w) < 28) x = W - w - 12; if (H - (y + h) < 28) y = H - h - 12;
    return { x: Math.max(0, x), y: Math.max(0, y), w, h };
  };
  const dragPanel = (kind: "move" | "resize") => (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const start = ui.rect, x0 = e.clientX, y0 = e.clientY;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      const r = kind === "move" ? { ...start, x: start.x + dx, y: start.y + dy } : { ...start, w: start.w + dx, h: start.h + dy };
      setUi((u) => ({ ...u, rect: kind === "move" ? { ...r, w: start.w, h: start.h } : r }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setUi((u) => ({ ...u, rect: clampRect(u.rect) }));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const always = isAlwaysOpen(cfg.template);
  const tabs = tabsFor(mode, cfg.template);
  const curTab = tabs.includes(tab) ? tab : tabs[0];
  const info = TAB_INFO[curTab];
  const isDark = ui.theme === "dark";
  const host = hostOf(ai.website);
  const grad = `linear-gradient(135deg, ${cfg.primary}, ${cfg.secondary})`;

  const rail = (
    <nav aria-label="Editor sections" style={{ width: 68, flexShrink: 0, borderRight: "1px solid var(--line)", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 0", overflowY: "auto" }}>
      {tabs.map((t) => {
        const on = t === curTab;
        return (
          <button key={t} type="button" onClick={() => setTab(t)} aria-current={on ? "page" : undefined} className="c4-rail-btn"
            style={{ width: 56, height: 54, flexShrink: 0, border: "none", borderRadius: 12, background: on ? "var(--accent-soft)" : "transparent", color: on ? "var(--accent-text)" : "var(--text-3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", font: "500 10.5px var(--font)", transition: "background .15s,color .15s" }}>
            {TAB_ICONS[t]}{TAB_INFO[t].label}
          </button>
        );
      })}
    </nav>
  );

  const modeSeg = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 3, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", opacity: always ? 0.45 : 1 }}>
      {(["closed", "open"] as const).map((m) => {
        const on = (always ? "open" : mode) === m;
        return (
          <button key={m} type="button" aria-pressed={on} onClick={() => { if (!always) setMode(m); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 36, border: "none", borderRadius: 9, background: on ? "var(--surface)" : "transparent", boxShadow: on ? "0 1px 2px rgba(0,0,0,.12), 0 0 0 1px var(--line)" : "none", color: on ? "var(--text)" : "var(--text-3)", font: "600 12.5px var(--font)", cursor: always ? "default" : "pointer", transition: "background .15s" }}>
            {m === "closed" ? (
              <span style={{ width: 13, height: 13, borderRadius: "50%", background: grad, boxShadow: `0 2px 6px -1px ${cfg.primary}` }} />
            ) : (
              <span style={{ position: "relative", width: 13, height: 15, borderRadius: 3, border: "2px solid currentColor", boxSizing: "border-box" }}><span style={{ position: "absolute", left: 0, right: 0, top: 0, height: 3, background: "currentColor" }} /></span>
            )}
            {m === "closed" ? "Closed view" : "Open view"}
          </button>
        );
      })}
    </div>
  );

  const panel = (
    <section aria-label={info.title} style={{ flex: 1, minWidth: 0, background: "var(--surface)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: 14, paddingBottom: 14, borderBottom: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 14 }}>
        {ui.floating && (
          <div onPointerDown={dragPanel("move")} title="Drag to move"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 14, margin: "-6px 0 -6px", cursor: "grab", color: "var(--text-3)", touchAction: "none" }}>
            <GripHorizontal size={16} />
          </div>
        )}
        {curTab !== "ai" && modeSeg}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0 4px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 30, lineHeight: 1, letterSpacing: "-.01em" }}>{info.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 6 }}>{info.sub}</div>
          </div>
          <button type="button" onClick={() => setUi((u) => ({ ...u, floating: !u.floating, rect: clampRect(u.rect) }))} className="c4-ghost"
            title={ui.floating ? "Dock the editor to the side" : "Pop the editor out into a movable window"} aria-label={ui.floating ? "Dock editor" : "Float editor"}
            style={{ width: 30, height: 30, border: "none", borderRadius: 8, background: "transparent", color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {ui.floating ? <PanelLeft size={16} /> : <PictureInPicture2 size={16} />}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "18px 20px 28px" }}>
        <div key={curTab} style={{ animation: "c4up .3s ease both" }}>
          {curTab === "ai" ? (
            <AiPanel ai={ai} setAI={setAI} cfg={cfg} keys={keys} setKeys={setKeys} published={published} />
          ) : (
            <DesignPanel tab={curTab} cfg={cfg} update={update} setMode={setMode} replay={replay} />
          )}
        </div>
      </div>
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--text-3)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" }} />Autosaved</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button type="button" onClick={() => setSetupOpen(true)} className="c4-ghost"
            style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 10px", border: "none", background: "transparent", color: "var(--text-2)", font: "500 12px var(--font)", cursor: "pointer", borderRadius: 7 }}>
            <Wand2 size={13} />Setup
          </button>
          <button type="button" onClick={() => { update({ ...DEFAULT_WIDGET }); replay(); }} className="c4-ghost"
            style={{ height: 28, padding: "0 10px", border: "none", background: "transparent", color: "var(--text-2)", font: "500 12px var(--font)", cursor: "pointer", borderRadius: 7 }}>
            Reset design
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="c4-app" data-theme={ui.theme} style={{ ["--accent" as string]: ui.accent, height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", gap: 16, padding: "0 16px 0 18px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, overflow: "hidden" }}>
          <Link href="/" aria-label="Chatty4Everyone home"
            style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(140deg,var(--accent-glow),var(--accent) 55%,color-mix(in oklch,var(--accent) 70%,black))", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35),0 4px 14px -4px var(--accent)", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, textDecoration: "none" }}>
            C4
          </Link>
          <span className="c4-hide-xs" style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>Chatty4Everyone</span>
          <span className="c4-hide-xs" style={{ color: "var(--text-3)", fontSize: 14 }}>/</span>
          <span className="c4-hide-xs" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text-2)", whiteSpace: "nowrap" }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: cfg.primary, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{(host || "y")[0].toUpperCase()}</span>
            {host || "your-site.com"}
          </span>
          <span className="c4-hide-xs" style={{ color: "var(--text-3)", fontSize: 14 }}>/</span>
          <span className="c4-hide-sm" style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cfg.botName || "Assistant"} · Design</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button type="button" onClick={undo} title="Undo (⌘Z)" aria-label="Undo" disabled={!hist.past.length} className="c4-btn" style={{ ...iconBtn, opacity: hist.past.length ? 1 : 0.4 }}><Undo size={15} /></button>
          <button type="button" onClick={redo} title="Redo (⇧⌘Z)" aria-label="Redo" disabled={!hist.future.length} className="c4-btn" style={{ ...iconBtn, opacity: hist.future.length ? 1 : 0.4 }}><Redo size={15} /></button>
          <span style={{ width: 1, height: 20, background: "var(--line)", margin: "0 4px" }} />
          <button type="button" onClick={shuffle} title="Surprise me" className="c4-btn" style={textBtn()}><Shuffle size={14} /><span className="c4-hide-sm">Surprise me</span></button>
          <div style={{ position: "relative" }}>
            <button type="button" onClick={() => setAccentOpen((o) => !o)} title="Editor accent colour" aria-label="Editor accent colour" aria-expanded={accentOpen} className="c4-btn" style={iconBtn}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 2px var(--surface), 0 0 0 3px var(--line-strong)" }} />
            </button>
            {accentOpen && (
              <div style={{ position: "absolute", right: 0, top: 38, zIndex: 20, display: "flex", alignItems: "center", gap: 6, padding: 8, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)" }}>
                {ACCENTS.map((a) => (
                  <button key={a} type="button" aria-label={`Accent ${a}`} onClick={() => { setUi((u) => ({ ...u, accent: a })); setAccentOpen(false); }}
                    style={{ width: 22, height: 22, borderRadius: "50%", background: a, border: "none", cursor: "pointer", boxShadow: ui.accent === a ? "0 0 0 2px var(--surface), 0 0 0 4px var(--text)" : "none" }} />
                ))}
                <label title="Custom" style={{ position: "relative", width: 22, height: 22, borderRadius: "50%", background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)", cursor: "pointer", overflow: "hidden" }}>
                  <input type="color" aria-label="Custom accent" value={ui.accent} onChange={(e) => setUi((u) => ({ ...u, accent: e.target.value }))} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                </label>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setUi((u) => ({ ...u, theme: isDark ? "light" : "dark" }))} title="Light / dark" aria-label="Toggle light or dark editor" className="c4-btn" style={iconBtn}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button type="button" onClick={togglePreview} className="c4-btn" style={textBtn(preview)}><Eye size={14} />{preview ? "Back to editing" : "Preview"}</button>
          <button type="button" onClick={() => setCodeOpen((o) => !o)} className="c4-btn" style={textBtn(codeOpen)}><Code size={14} /><span className="c4-hide-sm">Get code</span></button>
          <button type="button" onClick={publish} disabled={publishing} className="c4-primary"
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 14px", border: "none", borderRadius: 9, background: "var(--accent)", color: "var(--accent-ink)", font: "600 13px var(--font)", cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,.25),0 6px 18px -6px var(--accent)", flexShrink: 0 }}>
            {publishing ? <Loader2 size={14} style={{ animation: "c4spin 1s linear infinite" }} /> : <Rocket size={14} />}
            {published && !dirty ? "Published" : published ? "Update" : "Publish"}
            {dirty && <span title="Unpublished changes" style={{ position: "absolute", top: -3, right: -3, width: 9, height: 9, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 0 2px var(--surface)" }} />}
          </button>
        </div>
      </header>

      <div ref={mainRef} style={{ position: "relative", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: preview || ui.floating ? "minmax(0,1fr)" : "68px 324px minmax(0,1fr)" }}>
        {!preview && !ui.floating && (<>{rail}<div style={{ display: "flex", minHeight: 0, borderRight: "1px solid var(--line)" }}>{panel}</div></>)}
        <Stage
          cfg={cfg} update={update} mode={mode} setMode={setMode} preview={preview} exitPreview={togglePreview} hide={hide}
          onPick={onPick} chat={chat} supportChat={supportChat} setSupportChat={setSupportChat} published={published} origin={origin}
          tiltEnabled={!codeOpen && !(ui.floating && !preview)}
        >
          {codeOpen && (
            <CodeDrawer origin={origin} published={published} template={cfg.template} onClose={() => setCodeOpen(false)} onPublish={publish} publishing={publishing} dirty={dirty} />
          )}
        </Stage>
        {!preview && ui.floating && (
          <div role="dialog" aria-label="Editor panel"
            style={{ position: "absolute", left: ui.rect.x, top: ui.rect.y, width: ui.rect.w, height: ui.rect.h, zIndex: 10, display: "flex", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)", background: "var(--surface)", animation: "c4up .25s ease both" }}>
            {rail}
            {panel}
            <div onPointerDown={dragPanel("resize")} title="Drag to resize" aria-hidden
              style={{ position: "absolute", right: 0, bottom: 0, width: 18, height: 18, cursor: "nwse-resize", touchAction: "none", background: "linear-gradient(135deg, transparent 50%, var(--line-strong) 50%, var(--line-strong) 60%, transparent 60%, transparent 72%, var(--line-strong) 72%, var(--line-strong) 82%, transparent 82%)" }} />
          </div>
        )}
      </div>

      {toast && (
        <div role="status" style={{ position: "fixed", left: "50%", top: 68, transform: "translateX(-50%)", zIndex: 60, maxWidth: "min(520px, calc(100% - 32px))", padding: "10px 16px", borderRadius: 12, background: toast.error ? "#7f1d1d" : "var(--text)", color: toast.error ? "#fff" : "var(--surface)", font: "500 13px/1.45 var(--font)", boxShadow: "0 12px 40px -10px rgba(0,0,0,.5)", animation: "c4up .25s ease both" }}>
          {toast.text}
        </div>
      )}

      {setupOpen && (
        <Setup initial={{ website: ai.website, botName: cfg.botName, useCase: ai.useCase, keys }} onDone={onSetupDone} onSkip={skipSetup} />
      )}
    </div>
  );
}
