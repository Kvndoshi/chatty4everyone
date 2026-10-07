"use client";

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, Ref } from "react";
import { MessageCircle, X } from "lucide-react";
import { avatarFill, fontCss, gradient, type WidgetConfig } from "@/lib/widget";
import { ChattyOrb } from "./ChattyOrb";

const SHAPE_R = { circle: "50%", rounded: "30%", rectangle: "8px" } as const;

interface LauncherProps {
  cfg: WidgetConfig;
  open: boolean;
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  buttonRef?: Ref<HTMLButtonElement>;
  title?: string;
}

export function Launcher({ cfg, open, onClick, onPointerDown, buttonRef, title }: LauncherProps) {
  const isOrb = cfg.triggerIcon === "orb";
  const isLabel = cfg.triggerIcon === "label" && !open;
  const size = cfg.triggerSize;
  const grad = gradient(cfg);
  const radius = isOrb || isLabel ? "999px" : SHAPE_R[cfg.triggerShape];
  const bg = isOrb ? "transparent" : cfg.triggerIcon === "avatar" && cfg.avatarImg && !open ? avatarFill(cfg) : grad;
  const label = cfg.launcherText || `Ask ${cfg.botName || "us"}`;

  return (
    <div style={{ pointerEvents: "auto", position: "relative", flexShrink: 0, animation: !open && cfg.idle === "bounce" ? "c4bounce 2.6s ease-in-out infinite" : "none" }}>
      <span
        style={{
          position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none",
          ["--ring" as string]: `color-mix(in srgb, ${cfg.primary} 60%, transparent)`,
          animation: !open && cfg.idle === "pulse" ? "c4pulse 2.2s ease-out infinite" : "none",
        }}
      />
      <button
        ref={buttonRef}
        type="button"
        className="c4-launch"
        onClick={onClick}
        onPointerDown={onPointerDown}
        title={title}
        aria-label={open ? "Close chat" : `Open chat with ${cfg.botName || "us"}`}
        aria-expanded={open}
        style={{
          touchAction: onPointerDown ? "none" : undefined,
          position: "relative", flexShrink: 0,
          width: isLabel ? "auto" : size, height: isLabel ? 52 : size, padding: isLabel ? "0 20px 0 16px" : 0,
          border: "none", borderRadius: radius, background: bg, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
          boxShadow: isOrb ? `0 14px 34px -8px ${cfg.primary}, 0 0 0 1px rgba(255,255,255,.06)` : "0 8px 24px rgba(0,0,0,0.28)",
          fontFamily: fontCss(cfg.font), fontSize: 14, fontWeight: 600, overflow: "visible",
        }}
      >
        {isOrb && (
          <ChattyOrb color={cfg.primary} color2={cfg.secondary} state={open ? "thinking" : "idle"}
            style={{ position: "absolute", inset: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)" }} />
        )}
        {open && (
          <span style={{ position: "relative", zIndex: 1, width: 28, height: 28, borderRadius: "50%", background: isOrb ? "rgba(10,10,20,.35)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} strokeWidth={2.5} />
          </span>
        )}
        {!open && cfg.triggerIcon === "avatar" && !cfg.avatarImg && (
          <span style={{ fontSize: Math.round(size * 0.42), lineHeight: 1 }}>{cfg.avatar}</span>
        )}
        {!open && cfg.triggerIcon === "chat" && <MessageCircle size={Math.round(size * 0.42)} fill="currentColor" strokeWidth={1.5} />}
        {isLabel && (<><MessageCircle size={18} strokeWidth={2} /><span>{label}</span></>)}
      </button>
    </div>
  );
}

export function Teaser({ cfg, onClick }: { cfg: WidgetConfig; onClick?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      style={{
        pointerEvents: "auto", maxWidth: 250, display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px 11px 14px",
        borderRadius: 14, background: cfg.bg, color: cfg.text, fontFamily: fontCss(cfg.font), fontSize: 13.5, lineHeight: 1.45,
        boxShadow: "0 12px 30px -8px rgba(0,0,0,.35)", border: "1px solid rgba(0,0,0,.06)",
        animation: "c4spring .5s .3s cubic-bezier(.2,.9,.3,1.15) both", cursor: "pointer", boxSizing: "border-box",
      }}
    >
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: avatarFill(cfg), color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {cfg.avatarImg ? "" : cfg.avatar}
      </span>
      <span style={{ flex: 1 }}>{cfg.teaserText}</span>
    </div>
  );
}

export const OPEN_ANIMATIONS = {
  spring: "c4spring .55s cubic-bezier(.2,.9,.3,1.15) both",
  fade: "c4fade .3s ease both",
  slide: "c4slide .4s cubic-bezier(.2,.8,.2,1) both",
  none: "none",
} as const;
