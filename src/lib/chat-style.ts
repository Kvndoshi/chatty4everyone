import { fontCss, luminance, type WidgetConfig } from "./widget";

export type WindowVariant = "chat" | "support" | "search" | "bar" | "pill";

function rgba(hex: string, a: number) {
  const h = (hex || "#000").replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

const SHADOWS = {
  none: "none",
  small: "0 4px 12px rgba(0,0,0,0.15)",
  medium: "0 8px 30px rgba(0,0,0,0.2)",
  large: "0 16px 50px rgba(0,0,0,0.3)",
};

/** Derives every colour/size the chat window needs from the widget config. */
export function chatStyle(k: WidgetConfig, variant: WindowVariant, flat = false) {
  const p = k.primary, s2 = k.secondary, bg = k.bg, text = k.text;
  const light = luminance(bg) > 0.5;
  const grad = `linear-gradient(135deg, ${p}, ${s2})`;
  const hs = k.headerStyle;
  const headerBg = hs === "gradient" ? grad : hs === "solid" ? p : hs === "tint" ? `color-mix(in srgb, ${p} 12%, ${bg})` : "transparent";
  const headerFg = hs === "gradient" || hs === "solid" ? "#ffffff" : text;
  const divider = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)";
  const r = k.radius, br = k.bubbleR, tail = Math.min(4, br);
  const inStyle = k.inputStyle;
  const isPill = variant === "pill";
  const glass = k.glass;
  const userBg = k.userBg || (hs === "gradient" ? grad : p);
  return {
    light,
    bg: glass ? rgba(bg, light ? 0.88 : 0.82) : bg,
    blur: glass ? "blur(24px) saturate(1.6)" : "none",
    text,
    muted: `color-mix(in srgb, ${text} 52%, transparent)`,
    divider,
    border: k.borderWidth > 0 && !flat ? `${k.borderWidth}px solid ${k.borderColor || (light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)")}` : "none",
    winR: flat ? "0px" : isPill ? (inStyle === "box" ? r + "px" : "999px") : r + "px",
    shadow: flat ? "none" : SHADOWS[k.shadow],
    font: fontCss(k.font),
    fs: k.fontSize + "px",
    hfs: k.headerFontSize + "px",
    mfs: k.msgFontSize + "px",
    headerH: k.headerHeight + "px",
    headerBg,
    headerFg,
    headerLine: hs === "plain" ? `1px solid ${divider}` : "none",
    hBtn: headerFg === "#ffffff" ? "rgba(255,255,255,0.14)" : light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)",
    ring: hs === "gradient" || hs === "solid" ? p : bg,
    avatarBg: k.avatarImg ? `center / cover no-repeat url("${k.avatarImg}")` : grad,
    avatar: k.avatarImg ? "" : k.avatar || "🤖",
    botName: k.botName || "Assistant",
    gap: k.msgGap + "px",
    pad: `${k.padV}px ${k.padH}px`,
    userBg,
    userFg: k.userText || "#ffffff",
    botBg: k.botBg || (glass ? (light ? "#f1f2f5" : `color-mix(in srgb, ${bg} 80%, white)`) : light ? "#f3f4f6" : "rgba(255,255,255,0.08)"),
    botFg: k.botText || text,
    botLine: light ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    userR: `${br}px ${tail}px ${br}px ${br}px`,
    botR: `${tail}px ${br}px ${br}px ${br}px`,
    chipR: br <= 4 ? "4px" : "999px",
    chipLine: `color-mix(in srgb, ${p} 40%, transparent)`,
    chipFg: light ? p : `color-mix(in srgb, ${p} 45%, white)`,
    cardBg: light ? "#ffffff" : `color-mix(in srgb, ${bg} 88%, white)`,
    cardR: Math.min(r, 16) + "px",
    inputH: k.inputHeight + "px",
    inputR: inStyle === "pill" || isPill ? "999px" : inStyle === "line" ? "0px" : Math.round(r * 0.75) + "px",
    inputBorder: isPill || inStyle === "line" ? "none" : `1px solid ${light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
    inputBottom: inStyle === "line" && !isPill ? `2px solid ${p}` : isPill ? "none" : `1px solid ${light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
    inputBg: glass || isPill ? bg : "transparent",
    inputTop: isPill || inStyle === "line" ? "none" : `1px solid ${divider}`,
    inputWrapPad: isPill ? "4px" : "12px 16px",
    sendR: inStyle === "box" && r <= 6 ? Math.max(2, r) + "px" : "50%",
  };
}

export type ChatStyle = ReturnType<typeof chatStyle>;
