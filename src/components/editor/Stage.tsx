"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Lock, Monitor, MousePointerClick, Smartphone } from "lucide-react";
import { ChatWindow, type PickTarget } from "@/components/chat/ChatWindow";
import { Launcher, OPEN_ANIMATIONS, Teaser } from "@/components/chat/Launcher";
import type { ChatController } from "@/components/chat/useChat";
import { BackdropSite } from "@/components/sites/MockSites";
import { bookmarklet } from "@/lib/embed-code";
import { avatarFill, fontCss, gradient, isAlwaysOpen, isCornerTemplate, type WidgetConfig } from "@/lib/widget";
import type { Published, Site } from "./types";

interface Props {
  cfg: WidgetConfig;
  update: (patch: Partial<WidgetConfig>) => void;
  mode: "open" | "closed";
  setMode: (m: "open" | "closed") => void;
  preview: boolean;
  exitPreview: () => void;
  /** Briefly unmounts the window to replay its open animation. */
  hide: boolean;
  onPick: (t: PickTarget) => void;
  chat: ChatController;
  supportChat: boolean;
  setSupportChat: (v: boolean) => void;
  published: Published | null;
  origin: string;
  /** Overlays rendered above the canvas (e.g. the code drawer). */
  children?: ReactNode;
  tiltEnabled: boolean;
}

const SITES: { id: Site; label: string }[] = [
  { id: "saas", label: "SaaS" }, { id: "docs", label: "Docs" }, { id: "shop", label: "Shop" }, { id: "blank", label: "Blank" }, { id: "live", label: "Live URL" },
];
const SITE_URL: Record<Exclude<Site, "live">, string> = { saas: "flowbase.io", docs: "docs.flowbase.io/introduction", shop: "arco.store/jackets/quilted", blank: "localhost:3000" };

const flatBtn = (on: boolean): CSSProperties => ({
  height: 28, padding: "0 10px", border: "none", borderRadius: 9, background: on ? "var(--accent-soft)" : "transparent",
  color: on ? "var(--accent-text)" : "var(--text-2)", font: "500 12.5px var(--font)", cursor: "pointer", transition: "background .15s",
});
const divider = <span style={{ width: 1, height: 18, background: "var(--line-strong)" }} />;

/** Edge grip for drag-to-resize. */
function Handle({ style, bar, cursor, onDown }: { style: CSSProperties; bar: CSSProperties; cursor: string; onDown: (e: ReactPointerEvent) => void }) {
  return (
    <div onPointerDown={onDown} title="Drag to resize"
      style={{ position: "absolute", cursor, display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none", zIndex: 2, ...style }}>
      <span style={{ borderRadius: 2, background: "var(--accent)", opacity: 0.75, boxShadow: "0 0 0 2px #fff", ...bar }} />
    </div>
  );
}

/** Round/pill grip for drag-to-resize. */
function Dot({ style, cursor, onDown }: { style: CSSProperties; cursor: string; onDown: (e: ReactPointerEvent) => void }) {
  return (
    <div onPointerDown={onDown} title="Drag to resize"
      style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "3px solid var(--accent)", boxSizing: "border-box", cursor, touchAction: "none", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,.3)", ...style }} />
  );
}

export function Stage(p: Props) {
  const { cfg, update, mode, setMode, preview, hide, chat } = p;
  const [site, setSite] = useState<Site>("saas");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [liveUrl, setLiveUrl] = useState("https://example.com");
  const [liveDraft, setLiveDraft] = useState("https://example.com");
  const [badge, setBadge] = useState<string | null>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });

  const tiltRef = useRef<HTMLDivElement>(null);
  const cornerRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const dragging = useRef(false);
  const suppressClick = useRef(false);

  const frameRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!el) return;
    const measure = () => setFrame({ w: el.offsetWidth, h: el.offsetHeight });
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);

  const T = cfg.template;
  const always = isAlwaysOpen(T);
  const open = (always || mode === "open") && !hide;
  const mobile = device === "mobile";
  const corner = isCornerTemplate(T);
  const canResize = !preview && !mobile;
  const aR = cfg.position === "br" || cfg.position === "tr";
  const aB = cfg.position === "br" || cfg.position === "bl";
  const ox = mobile ? 12 : cfg.offsetX, oy = mobile ? 14 : cfg.offsetY;
  const anim = OPEN_ANIMATIONS[cfg.animation];
  const font = fontCss(cfg.font);

  // Fit the widget into the frame: shrink (never below 55%) when it wouldn't fit.
  const needH = cfg.height + cfg.triggerSize + 12 + 2 * oy, needW = cfg.width + 2 * ox;
  const sc = Math.max(0.55, frame.h ? Math.min(1, frame.h / needH, mobile ? 1 : frame.w / needW) : 1);
  const siteW = mobile ? 390 : 1280;
  const siteScale = frame.w ? frame.w / siteW : mobile ? 0.9 : 0.7;

  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || !p.tiltEnabled || preview || dragging.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
  };
  const tiltEnd = () => { if (tiltRef.current) tiltRef.current.style.transform = "none"; };

  // Drag-to-resize: sx/sy are -1/0/1 for which edge is being pulled.
  const startResize = (e: ReactPointerEvent, sx: number, sy: number, key: "width" | "barWidth" = "width", factor = 1) => {
    e.preventDefault();
    e.stopPropagation();
    tiltEnd();
    dragging.current = true;
    const s = sc, w0 = cfg[key], h0 = cfg.height, x0 = e.clientX, y0 = e.clientY;
    let raf = 0, last: PointerEvent | null = null;
    const move = (ev: PointerEvent) => {
      last = ev;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!last) return;
        const dx = (last.clientX - x0) / s, dy = (last.clientY - y0) / s;
        const patch: Partial<WidgetConfig> = {};
        let w = w0, h = h0;
        if (sx) {
          const [lo, hi] = key === "barWidth" ? [320, 820] : [280, 560];
          w = Math.round(Math.min(hi, Math.max(lo, w0 + sx * dx * factor)));
          patch[key] = w;
          if (key === "width") patch.size = "custom";
        }
        if (sy) {
          h = Math.round(Math.min(780, Math.max(360, h0 + sy * dy)));
          patch.height = h;
          patch.size = "custom";
        }
        update(patch);
        setBadge(key === "barWidth" ? `${w}px wide` : `${w} × ${h}`);
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      cancelAnimationFrame(raf);
      dragging.current = false;
      setBadge(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Drag the whole corner group (by the launcher or the window header); it
  // snaps to the nearest corner and keeps the distance from the edges.
  const startGroupDrag = (e: ReactPointerEvent, onTap?: () => void) => {
    if (e.button !== 0) return;
    const el = cornerRef.current, btn = launcherRef.current;
    if (!el || !btn) return;
    const s = sc, x0 = e.clientX, y0 = e.clientY;
    const target = e.currentTarget as HTMLElement;
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!moved && Math.hypot(dx, dy) > 5 && !preview && !mobile) {
        moved = true;
        dragging.current = true;
        tiltEnd();
        target.style.cursor = "grabbing";
      }
      if (moved) {
        el.style.transition = "none";
        el.style.transform = `translate(${dx / s}px, ${dy / s}px)`;
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      target.style.cursor = "";
      if (!moved) { onTap?.(); return; }
      dragging.current = false;
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 0);
      const box = (el.parentElement as HTMLElement).getBoundingClientRect(), r = btn.getBoundingClientRect();
      const W = box.width / s, H = box.height / s;
      const lx = (r.left - box.left) / s, ly = (r.top - box.top) / s, lw = r.width / s, lh = r.height / s;
      const right = lx + lw / 2 > W / 2, bottom = ly + lh / 2 > H / 2;
      const offsetX = Math.round(Math.min(200, Math.max(0, right ? W - (lx + lw) : lx)));
      const offsetY = Math.round(Math.min(200, Math.max(0, bottom ? H - (ly + lh) : ly)));
      el.style.transform = "";
      el.style.transition = "";
      update({ position: `${bottom ? "b" : "t"}${right ? "r" : "l"}` as WidgetConfig["position"], offsetX, offsetY });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const pick = (t: PickTarget) => {
    if (suppressClick.current) return;
    p.onPick(t);
  };
  const toggleOpen = () => { if (!always) setMode(open ? "closed" : "open"); };
  const activate = (q?: string) => {
    if (!preview) { setMode("open"); return; }
    p.setSupportChat(true);
    if (q) chat.send(q);
  };
  const windowProps = {
    cfg,
    interactive: preview,
    chat,
    showSample: !preview,
    onPick: preview ? undefined : pick,
  };
  const winVariant = T === "support" && !(preview && p.supportChat) ? "support" : "chat";

  const pad = mobile
    ? "50px 12px 14px"
    : `${aB ? Math.max(18, oy) : oy}px ${aR ? ox : Math.max(18, ox)}px ${aB ? oy : Math.max(18, oy)}px ${aR ? Math.max(18, ox) : ox}px`;
  const widget = (
    <>
      {corner && (
        <div ref={cornerRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: aB ? "column" : "column-reverse", justifyContent: "flex-end", alignItems: mobile ? "flex-end" : aR ? "flex-end" : "flex-start", gap: 12, padding: pad, boxSizing: "border-box" }}>
          {open && (
            <div style={{ position: "relative", pointerEvents: "auto", width: mobile ? "100%" : cfg.width, height: mobile ? Math.min(cfg.height, 600) : cfg.height, flex: "0 1 auto", minHeight: 0, animation: anim, transformOrigin: `${aB ? "bottom" : "top"} ${aR ? "right" : "left"}` }}>
              <ChatWindow {...windowProps} variant={winVariant} onActivate={activate}
                onHeaderPointerDown={!preview && !mobile ? (e) => startGroupDrag(e) : undefined} />
              {canResize && (<>
                <Handle style={{ top: 24, bottom: 24, [aR ? "left" : "right"]: -7, width: 14 }} onDown={(e) => startResize(e, aR ? -1 : 1, 0)} cursor="ew-resize" bar={{ width: 4, height: 44 }} />
                <Handle style={{ left: 24, right: 24, [aB ? "top" : "bottom"]: -7, height: 14 }} onDown={(e) => startResize(e, 0, aB ? -1 : 1)} cursor="ns-resize" bar={{ width: 44, height: 4 }} />
                <Dot style={{ [aR ? "left" : "right"]: -7, [aB ? "top" : "bottom"]: -7 }} onDown={(e) => startResize(e, aR ? -1 : 1, aB ? -1 : 1)} cursor={aR === aB ? "nwse-resize" : "nesw-resize"} />
              </>)}
              {badge && <div style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", padding: "4px 10px", borderRadius: 7, background: "#111", color: "#fff", font: "500 12px var(--mono)", whiteSpace: "nowrap", zIndex: 4 }}>{badge}</div>}
            </div>
          )}
          {!open && cfg.teaser && !hide && <Teaser cfg={cfg} onClick={() => setMode("open")} />}
          <Launcher cfg={cfg} open={open} buttonRef={launcherRef}
            title={preview ? undefined : "Click to open · drag to move"}
            onPointerDown={(e) => startGroupDrag(e, toggleOpen)}
            onClick={(e) => { if (e.detail === 0) toggleOpen(); }} />
        </div>
      )}

      {T === "bar" && (
        <div style={{ position: "absolute", left: "50%", bottom: oy, transform: "translateX(-50%)", width: mobile ? "calc(100% - 24px)" : `min(${cfg.barWidth}px, calc(100% - 40px))`, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "auto" }}>
          {open ? (
            <div style={{ height: mobile ? 440 : Math.min(cfg.height - 80, 460), animation: anim, transformOrigin: "bottom center" }}>
              <ChatWindow {...windowProps} variant="bar" onClose={preview ? () => setMode("closed") : undefined} />
            </div>
          ) : (
            <div onClick={toggleOpen} style={{ cursor: "pointer", position: "relative" }}>
              {canResize && (<>
                <Dot style={{ left: -9, top: "50%", width: 14, height: 34, borderRadius: 7, transform: "translateY(-50%)" }} onDown={(e) => startResize(e, -1, 0, "barWidth", 2)} cursor={"ew-resize"} />
                <Dot style={{ right: -9, top: "50%", width: 14, height: 34, borderRadius: 7, transform: "translateY(-50%)" }} onDown={(e) => startResize(e, 1, 0, "barWidth", 2)} cursor={"ew-resize"} />
              </>)}
              <ChatWindow cfg={cfg} variant="pill" onActivate={() => setMode("open")} />
              {badge && <div style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", padding: "4px 10px", borderRadius: 7, background: "#111", color: "#fff", font: "500 12px var(--mono)", whiteSpace: "nowrap" }}>{badge}</div>}
            </div>
          )}
        </div>
      )}

      {T === "search" && (open ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", paddingTop: mobile ? 56 : "8%", boxSizing: "border-box" }}>
          <div style={{ pointerEvents: "auto", width: mobile ? "calc(100% - 20px)" : "min(640px, 90%)", height: mobile ? "70%" : "min(470px, 78%)", animation: anim, transformOrigin: "top center" }}>
            <ChatWindow {...windowProps} variant="search" onClose={preview ? () => setMode("closed") : undefined} />
          </div>
        </div>
      ) : (
        <button type="button" onClick={toggleOpen}
          style={{ pointerEvents: "auto", position: "absolute", top: mobile ? 56 : 14, right: 16, display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 10px 0 14px", borderRadius: 999, border: "1px solid rgba(0,0,0,.1)", background: cfg.bg, color: cfg.text, fontFamily: font, fontSize: 14, cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,.18)", animation: "c4up .3s ease both" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: avatarFill(cfg), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{cfg.avatarImg ? "" : cfg.avatar}</span>
          {cfg.searchLabel}
          {cfg.showKbd && <span style={{ display: "flex", gap: 2, padding: "1px 6px", borderRadius: 5, border: "1px solid rgba(0,0,0,.12)", fontSize: 11, opacity: 0.7 }}>⌘ K</span>}
        </button>
      ))}

      {T === "sidebar" && (open ? (
        <div style={{ pointerEvents: "auto", position: "absolute", top: 0, right: 0, bottom: 0, width: mobile ? "100%" : Math.max(340, cfg.width - 20), boxShadow: "-8px 0 30px rgba(0,0,0,.18)", animation: "c4slide .35s cubic-bezier(.2,.8,.2,1) both" }}>
          {canResize && <Handle style={{ left: -7, top: 0, bottom: 0, width: 14 }} onDown={(e) => startResize(e, -1, 0)} cursor="ew-resize" bar={{ width: 4, height: 48, opacity: 1 }} />}
          <ChatWindow {...windowProps} variant="chat" flat onClose={preview ? () => setMode("closed") : undefined} />
        </div>
      ) : (
        <button type="button" onClick={toggleOpen}
          style={{ pointerEvents: "auto", position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", writingMode: "vertical-rl", padding: "14px 9px", border: "none", borderRadius: "10px 0 0 10px", background: gradient(cfg), color: "#fff", fontFamily: font, fontSize: 12.5, fontWeight: 600, letterSpacing: ".04em", cursor: "pointer", boxShadow: "-4px 0 18px rgba(0,0,0,.2)" }}>
          {cfg.launcherText || `Ask ${cfg.botName || "us"}`}
        </button>
      ))}

      {T === "inline" && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: "28%", background: "linear-gradient(180deg,rgba(255,255,255,0) 0%,#fff 22%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "40px 24px 24px", boxSizing: "border-box", pointerEvents: "auto", fontFamily: "system-ui,-apple-system,sans-serif" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: cfg.primary }}>Help center</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px", color: "#0f0d2a", marginTop: 4 }}>Questions? Ask {cfg.botName}.</div>
          </div>
          <div style={{ width: "min(680px,100%)", flex: 1, minHeight: 0, animation: anim }}><ChatWindow {...windowProps} variant="chat" /></div>
        </div>
      )}

      {T === "fullpage" && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "auto", animation: "c4fade .3s ease both" }}>
          <ChatWindow {...windowProps} variant="chat" flat />
        </div>
      )}
    </>
  );

  const overlay = (
    <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "relative", width: frame.w / sc || "100%", height: frame.h / sc || "100%", transform: `scale(${sc})`, transformOrigin: "0 0" }}>
        {widget}
      </div>
    </div>
  );
  const dim = open && T === "search" && (
    <div onClick={preview ? () => setMode("closed") : undefined}
      style={{ position: "absolute", inset: 0, zIndex: 2, background: "rgba(10,10,14,.45)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", animation: "c4fade .25s ease both" }} />
  );
  const siteContent = (mobileSite: boolean) =>
    site === "live" ? (
      <iframe src={liveUrl} title="Your website" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, background: "#fff", ...(mobileSite ? { paddingTop: 40, boxSizing: "border-box" } : {}) }} />
    ) : (
      <div style={{ position: "absolute", top: 0, left: 0, width: siteW, transform: `scale(${siteScale})`, transformOrigin: "0 0", pointerEvents: "none", background: "#fff", ...(mobileSite ? { paddingTop: 40 } : {}) }}>
        <BackdropSite site={site} mobile={mobileSite} />
      </div>
    );
  const commitLive = () => {
    let u = liveDraft.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    setLiveUrl(u);
    setLiveDraft(u);
  };

  return (
    <div onMouseMove={onTilt} onMouseLeave={tiltEnd}
      style={{ position: "relative", minWidth: 0, height: "100%", overflow: "hidden", ["--edit-ol" as string]: preview ? "transparent" : "var(--accent)", backgroundColor: "var(--canvas)", backgroundImage: "radial-gradient(var(--dot) 1px,transparent 1px)", backgroundSize: "20px 20px" }}>
      <div style={{ position: "absolute", width: 620, height: 620, left: "8%", top: "12%", borderRadius: "50%", background: `radial-gradient(circle,color-mix(in srgb, ${cfg.primary} 38%, transparent) 0%,transparent 65%)`, filter: "blur(40px)", animation: "c4drift 22s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 520, height: 520, right: "4%", bottom: "-6%", borderRadius: "50%", background: "radial-gradient(circle,color-mix(in oklch, var(--accent) 30%, transparent) 0%,transparent 65%)", filter: "blur(40px)", animation: "c4drift 28s ease-in-out infinite reverse", pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 5, display: "flex", alignItems: "center", gap: 6, padding: 5, borderRadius: 14, background: "var(--glass)", backdropFilter: "blur(14px) saturate(1.4)", WebkitBackdropFilter: "blur(14px) saturate(1.4)", border: "1px solid var(--line)", boxShadow: "0 8px 24px -10px rgba(0,0,0,.3)", whiteSpace: "nowrap", maxWidth: "calc(100% - 24px)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {SITES.map((s) => <button key={s.id} type="button" onClick={() => setSite(s.id)} aria-pressed={site === s.id} style={flatBtn(site === s.id)}>{s.label}</button>)}
        </div>
        {divider}
        <div style={{ display: "flex", gap: 2 }}>
          <button type="button" title="Desktop" aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setDevice("desktop")} style={{ ...flatBtn(!mobile), width: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Monitor size={15} /></button>
          <button type="button" title="Mobile" aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setDevice("mobile")} style={{ ...flatBtn(mobile), width: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Smartphone size={15} /></button>
        </div>
        {divider}
        <div style={{ display: "flex", gap: 2, opacity: always ? 0.45 : 1 }}>
          <button type="button" onClick={() => !always && setMode("closed")} aria-pressed={!always && mode === "closed"} style={flatBtn(!always && mode === "closed")}>Closed</button>
          <button type="button" onClick={() => !always && setMode("open")} aria-pressed={always || mode === "open"} style={flatBtn(always || mode === "open")}>Open</button>
        </div>
        {preview && (<>
          {divider}
          <button type="button" onClick={p.exitPreview} style={{ height: 28, padding: "0 12px", border: "none", borderRadius: 9, background: "var(--accent)", color: "var(--accent-ink)", font: "600 12.5px var(--font)", cursor: "pointer" }}>Exit preview</button>
        </>)}
      </div>

      <div style={{ position: "absolute", inset: "66px 36px 30px", perspective: 1800, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div ref={tiltRef} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", transformStyle: "preserve-3d", transition: "transform .35s cubic-bezier(.2,.8,.2,1)", willChange: "transform" }}>
          {!mobile ? (
            <div style={{ width: "100%", maxWidth: 1240, height: "100%", display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "var(--shadow-lg),0 0 0 1px var(--line)", animation: "c4up .4s ease both" }}>
              <div style={{ height: 36, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                </div>
                <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, height: 24, padding: "0 14px", minWidth: 260, maxWidth: "100%", justifyContent: "center", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 12, color: "var(--text-2)", boxSizing: "border-box" }}>
                    <Lock size={11} />
                    {site === "live" ? (
                      <input value={liveDraft} onChange={(e) => setLiveDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitLive(); }} onBlur={commitLive}
                        placeholder="https://your-site.com" spellCheck={false} aria-label="Website URL"
                        style={{ width: 300, maxWidth: "100%", border: "none", outline: "none", background: "transparent", color: "var(--text)", font: "400 12px var(--font)" }} />
                    ) : SITE_URL[site]}
                  </span>
                </div>
                <span style={{ width: 52 }} />
              </div>
              <div ref={frameRef} style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden", background: "#fff", borderRadius: "0 0 14px 14px" }}>
                {siteContent(false)}
                {dim}
                {overlay}
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", height: "min(760px,100%)", aspectRatio: "372/760", width: "auto", borderRadius: 48, padding: 10, background: "linear-gradient(145deg,#2a2b30,#0d0d10)", boxShadow: "var(--shadow-lg),inset 0 0 0 1px rgba(255,255,255,.08)", boxSizing: "border-box", animation: "c4up .4s ease both" }}>
              <div ref={frameRef} style={{ position: "relative", width: "100%", height: "100%", borderRadius: 38, overflow: "hidden", background: "#fff" }}>
                {siteContent(true)}
                <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 96, height: 26, borderRadius: 999, background: "#0d0d10", zIndex: 4 }} />
                {dim}
                {overlay}
              </div>
            </div>
          )}
        </div>
      </div>

      {!preview && (
        <div style={{ position: "absolute", left: 20, bottom: 7, zIndex: 4, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-3)", pointerEvents: "none" }}>
          <MousePointerClick size={13} />Click any part of the widget to edit it · drag the launcher or header to move · drag edges to resize
        </div>
      )}
      {site === "live" && (
        <div style={{ position: "absolute", right: 20, bottom: 12, zIndex: 4, maxWidth: 460, display: "flex", alignItems: "center", gap: 12, padding: "10px 10px 10px 14px", borderRadius: 12, background: "var(--glass)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--line)", fontSize: 12, lineHeight: 1.45, color: "var(--text-2)", boxShadow: "0 8px 24px -10px rgba(0,0,0,.3)" }}>
          {p.published ? (<>
            <span style={{ flex: 1 }}>Page blank? Some sites block embedding. Drag this button to your bookmarks bar, then click it on your site.</span>
            <a ref={(el) => { el?.setAttribute("href", bookmarklet(p.origin, p.published!.botId)); }} onClick={(e) => e.preventDefault()} draggable
              style={{ flexShrink: 0, display: "flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, background: "var(--text)", color: "var(--surface)", fontWeight: 600, textDecoration: "none", cursor: "grab", whiteSpace: "nowrap" }}>
              Preview {cfg.botName} on my site
            </a>
          </>) : (
            <span>Page blank? Some sites block embedding. Publish once and you&apos;ll get a bookmark button that shows {cfg.botName} on your real site.</span>
          )}
        </div>
      )}
      {p.children}
    </div>
  );
}
