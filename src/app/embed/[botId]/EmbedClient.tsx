"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Launcher, OPEN_ANIMATIONS, Teaser } from "@/components/chat/Launcher";
import { useChat } from "@/components/chat/useChat";
import { avatarFill, fontCss, gradient, isAlwaysOpen, isCornerTemplate, type WidgetConfig } from "@/lib/widget";

// Runs inside the iframe that public/widget.js puts on the customer's page.
// The iframe is kept exactly as big as what's visible (launcher, open window…)
// so the rest of their page stays clickable: after every layout change we
// measure and post a "box" message telling the loader how to size/place us.

/** Transparent margin around the widget so shadows and the pulse ring aren't clipped. */
const PAD_CLOSED = 28;
const PAD_OPEN = 48;

const TRANSPARENT = "html,body{background:transparent!important;color-scheme:normal;margin:0;overflow:hidden}";

type Box =
  | { kind: "corner"; pos: WidgetConfig["position"]; x: number; y: number; w: number; h: number }
  | { kind: "bottom"; y: number; w: number | null; h: number }
  | { kind: "edge"; w: number; h: number }
  | { kind: "side"; w: number | null }
  | { kind: "fill" }
  | { kind: "inline" };

function post(msg: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.parent !== window) window.parent.postMessage({ __c4e: true, ...msg }, "*");
}

export function EmbedUnavailable({ reason }: { reason: string }) {
  useEffect(() => post({ type: "hide", reason }), [reason]);
  return <style>{TRANSPARENT}</style>;
}

export function EmbedClient({ botId, cfg, session }: { botId: string; cfg: WidgetConfig; session: string }) {
  const T = cfg.template;
  const always = isAlwaysOpen(T);
  const [open, setOpen] = useState(always);
  const [mobile, setMobile] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);
  const [supportChat, setSupportChat] = useState(false);
  const [teaserGone, setTeaserGone] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const PAD = open ? PAD_OPEN : PAD_CLOSED;
  const interacted = useRef(false);

  const chat = useChat(
    useCallback((history) => ({ url: "/api/chat", body: { botId, session, messages: history } }), [botId, session]),
  );

  const show = useCallback((v: boolean) => {
    interacted.current = true;
    if (always) return;
    setOpen(v);
    if (v) setTeaserGone(true);
    else setSupportChat(false);
  }, [always]);

  // Commands from the host page (window.Chatty.open() etc.) and environment updates.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== window.parent || !e.data || e.data.__c4e !== true) return;
      const d = e.data as { type: string; mobile?: boolean; vw?: number; vh?: number };
      if (d.type === "env") {
        setMobile(!!d.mobile);
        if (typeof d.vw === "number" && typeof d.vh === "number") setViewport({ w: d.vw, h: d.vh });
      }
      else if (d.type === "open") show(true);
      else if (d.type === "close") show(false);
      else if (d.type === "toggle") {
        interacted.current = true;
        setOpen((o) => always || !o);
      }
    };
    window.addEventListener("message", onMsg);
    post({ type: "ready", template: T, shortcut: T === "search" && cfg.showKbd });
    return () => window.removeEventListener("message", onMsg);
  }, [T, cfg.showKbd, show, always]);

  // "Open automatically after 8 seconds", once per browser session.
  useEffect(() => {
    if (!cfg.autoOpen || always) return;
    let seen = false;
    try { seen = sessionStorage.getItem(`c4e-auto-${botId}`) === "1"; } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      if (interacted.current) return;
      try { sessionStorage.setItem(`c4e-auto-${botId}`, "1"); } catch {}
      setOpen(true);
      setTeaserGone(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [cfg.autoOpen, always, botId]);

  useEffect(() => {
    if (!open || always) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") show(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, always, show]);

  const corner = isCornerTemplate(T);
  const fill = (corner && open && mobile) || (T === "search" && open) || T === "fullpage" || (T === "bar" && open && mobile) || (T === "sidebar" && open && mobile);

  // Report our box to the loader whenever layout changes.
  useEffect(() => {
    const el = wrapRef.current;
    const send = () => {
      const r = el?.getBoundingClientRect();
      const w = Math.ceil(r?.width ?? 0), h = Math.ceil(r?.height ?? 0);
      let box: Box;
      if (T === "inline") box = { kind: "inline" };
      else if (fill) box = { kind: "fill" };
      else if (corner) box = { kind: "corner", pos: cfg.position, x: (mobile ? 12 : cfg.offsetX) - PAD, y: (mobile ? 14 : cfg.offsetY) - PAD, w, h };
      else if (T === "bar") box = { kind: "bottom", y: cfg.offsetY - PAD, w: mobile ? null : w, h };
      else if (T === "search") box = { kind: "corner", pos: "tr", x: 16 - PAD, y: 14 - PAD, w, h };
      else box = open ? { kind: "side", w: mobile ? null : w } : { kind: "edge", w, h };
      post({ type: "box", box });
    };
    send();
    if (!el) return;
    const ro = new ResizeObserver(send);
    ro.observe(el);
    return () => ro.disconnect();
  }, [T, fill, corner, open, mobile, cfg.position, cfg.offsetX, cfg.offsetY, PAD]);

  const anim = OPEN_ANIMATIONS[cfg.animation];
  // Never let the open window run off the visitor's screen.
  const winW = viewport ? Math.min(cfg.width, Math.max(280, viewport.w - cfg.offsetX - 24)) : cfg.width;
  const winH = viewport ? Math.min(cfg.height, Math.max(300, viewport.h - cfg.offsetY - cfg.triggerSize - 12 - 24)) : cfg.height;
  const sideW = Math.max(340, cfg.width - 20);
  const font = fontCss(cfg.font);
  const supportVariant = T === "support" && !supportChat ? "support" : "chat";
  const activate = (q?: string) => {
    setSupportChat(true);
    if (q) chat.send(q);
  };
  const close = () => show(false);
  const fillStyle: CSSProperties = { position: "absolute", inset: 0 };

  let body: React.ReactNode = null;

  if (T === "inline") {
    body = <div ref={wrapRef} style={fillStyle}><ChatWindow cfg={cfg} variant="chat" interactive chat={chat} /></div>;
  } else if (T === "fullpage") {
    body = <div ref={wrapRef} style={fillStyle}><ChatWindow cfg={cfg} variant="chat" flat interactive chat={chat} /></div>;
  } else if (corner) {
    if (open && mobile) {
      body = (
        <div ref={wrapRef} style={{ ...fillStyle, animation: anim }}>
          <ChatWindow cfg={cfg} variant={supportVariant} flat interactive chat={chat} onClose={close} onActivate={activate} />
        </div>
      );
    } else {
      const right = cfg.position === "br" || cfg.position === "tr";
      const bottom = cfg.position === "br" || cfg.position === "bl";
      body = (
        <div
          ref={wrapRef}
          style={{
            position: "absolute", [right ? "right" : "left"]: 0, [bottom ? "bottom" : "top"]: 0, padding: PAD, width: "max-content",
            display: "flex", flexDirection: bottom ? "column" : "column-reverse", alignItems: right ? "flex-end" : "flex-start", gap: 12,
          }}
        >
          {open && (
            <div style={{ width: winW, height: winH, animation: anim, transformOrigin: `${bottom ? "bottom" : "top"} ${right ? "right" : "left"}` }}>
              <ChatWindow cfg={cfg} variant={supportVariant} interactive chat={chat} onClose={close} onActivate={activate} />
            </div>
          )}
          {!open && cfg.teaser && !teaserGone && <Teaser cfg={cfg} onClick={() => show(true)} />}
          <Launcher cfg={cfg} open={open} onClick={() => show(!open)} />
        </div>
      );
    }
  } else if (T === "bar") {
    const barH = Math.min(mobile ? 440 : Math.min(cfg.height - 80, 460), viewport ? viewport.h - cfg.offsetY - 40 : Infinity);
    body = open && mobile ? (
      <div ref={wrapRef} style={{ ...fillStyle, animation: anim }}>
        <ChatWindow cfg={cfg} variant="bar" flat interactive chat={chat} onClose={close} />
      </div>
    ) : (
      <div ref={wrapRef} style={{ position: "absolute", left: 0, bottom: 0, padding: PAD, ...(mobile ? { right: 0 } : { width: "max-content" }) }}>
        <div style={{ width: mobile ? "100%" : cfg.barWidth }}>
          {open ? (
            <div style={{ height: barH, animation: anim, transformOrigin: "bottom center" }}>
              <ChatWindow cfg={cfg} variant="bar" interactive chat={chat} onClose={close} />
            </div>
          ) : (
            <ChatWindow cfg={cfg} variant="pill" onActivate={() => show(true)} />
          )}
        </div>
      </div>
    );
  } else if (T === "search") {
    body = open ? (
      <div ref={wrapRef} style={fillStyle}>
        <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(10,10,14,.45)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", animation: "c4fade .25s ease both" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", paddingTop: mobile ? 56 : "8%", boxSizing: "border-box", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: mobile ? "calc(100% - 20px)" : "min(640px, 90%)", height: mobile ? "70%" : "min(470px, 78%)", animation: anim, transformOrigin: "top center" }}>
            <ChatWindow cfg={cfg} variant="search" interactive chat={chat} onClose={close} />
          </div>
        </div>
      </div>
    ) : (
      <div ref={wrapRef} style={{ position: "absolute", top: 0, right: 0, padding: PAD, width: "max-content" }}>
        <button type="button" onClick={() => show(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 10px 0 14px", borderRadius: 999, border: "1px solid rgba(0,0,0,.1)", background: cfg.bg, color: cfg.text, fontFamily: font, fontSize: 14, cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,.18)", animation: "c4up .3s ease both" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: avatarFill(cfg), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{cfg.avatarImg ? "" : cfg.avatar}</span>
          {cfg.searchLabel}
          {cfg.showKbd && <span style={{ display: "flex", gap: 2, padding: "1px 6px", borderRadius: 5, border: "1px solid rgba(0,0,0,.12)", fontSize: 11, opacity: 0.7 }}>⌘ K</span>}
        </button>
      </div>
    );
  } else if (T === "sidebar") {
    body = open ? (
      <div ref={wrapRef} style={mobile ? fillStyle : { position: "absolute", top: 0, right: 0, bottom: 0, width: sideW, paddingLeft: PAD }}>
        <div style={{ width: "100%", height: "100%", boxShadow: mobile ? "none" : "-8px 0 30px rgba(0,0,0,.18)", animation: "c4slide .35s cubic-bezier(.2,.8,.2,1) both" }}>
          <ChatWindow cfg={cfg} variant="chat" flat interactive chat={chat} onClose={close} />
        </div>
      </div>
    ) : (
      <div ref={wrapRef} style={{ position: "absolute", top: 0, right: 0, padding: `${PAD}px 0 ${PAD}px ${PAD}px`, width: "max-content" }}>
        <button type="button" onClick={() => show(true)}
          style={{ writingMode: "vertical-rl", padding: "14px 9px", border: "none", borderRadius: "10px 0 0 10px", background: gradient(cfg), color: "#fff", fontFamily: font, fontSize: 12.5, fontWeight: 600, letterSpacing: ".04em", cursor: "pointer", boxShadow: "-4px 0 18px rgba(0,0,0,.2)" }}>
          {cfg.launcherText || `Ask ${cfg.botName || "us"}`}
        </button>
      </div>
    );
  }

  return (
    <div className="c4-embed">
      <style>{TRANSPARENT}</style>
      {body}
    </div>
  );
}
