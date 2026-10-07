/**
 * Widget appearance config — the single source of truth shared by the editor,
 * the live preview, the embed page and the server-side validator.
 */

export type Template = "bubble" | "support" | "bar" | "search" | "sidebar" | "inline" | "fullpage";
export type Preset = "sleek" | "round" | "sharp" | "soft" | "glass" | "outline";
export type HeaderStyle = "gradient" | "solid" | "tint" | "plain";
export type ShadowSize = "none" | "small" | "medium" | "large";
export type InputStyle = "box" | "pill" | "line";
export type Position = "br" | "bl" | "tr" | "tl";
export type TriggerShape = "circle" | "rounded" | "rectangle";
export type TriggerIcon = "orb" | "avatar" | "chat" | "label";
export type Animation = "spring" | "fade" | "slide" | "none";
export type IdleMotion = "pulse" | "bounce" | "none";
export type SizePreset = "s" | "m" | "l" | "custom";
export type FontId = "system" | "geist" | "bricolage" | "helvetica" | "georgia" | "jetbrains";

export interface WidgetConfig {
  template: Template;
  preset: Preset;
  palette: string;
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  headerStyle: HeaderStyle;
  glass: boolean;
  borderWidth: number;
  borderColor: string;
  shadow: ShadowSize;
  radius: number;
  bubbleR: number;
  padV: number;
  padH: number;
  msgGap: number;
  inputStyle: InputStyle;
  userBg: string;
  userText: string;
  botBg: string;
  botText: string;
  font: FontId;
  fontSize: number;
  headerFontSize: number;
  msgFontSize: number;
  size: SizePreset;
  width: number;
  height: number;
  position: Position;
  offsetX: number;
  offsetY: number;
  triggerShape: TriggerShape;
  triggerSize: number;
  triggerIcon: TriggerIcon;
  headerHeight: number;
  inputHeight: number;
  botName: string;
  avatar: string;
  welcome: string;
  placeholder: string;
  suggestions: string[];
  showStatus: boolean;
  showBranding: boolean;
  autoOpen: boolean;
  animation: Animation;
  barWidth: number;
  teaser: boolean;
  teaserText: string;
  idle: IdleMotion;
  launcherText: string;
  searchLabel: string;
  showKbd: boolean;
  avatarImg: string;
}

export const DEFAULT_WIDGET: WidgetConfig = {
  template: "bubble", preset: "round", palette: "Flowbase",
  primary: "#4f46e5", secondary: "#9333ea", bg: "#ffffff", text: "#1a1a2e",
  headerStyle: "gradient", glass: false, borderWidth: 0, borderColor: "", shadow: "large",
  radius: 24, bubbleR: 20, padV: 10, padH: 16, msgGap: 12, inputStyle: "pill",
  userBg: "", userText: "", botBg: "", botText: "",
  font: "system", fontSize: 14, headerFontSize: 15, msgFontSize: 14,
  size: "m", width: 380, height: 580, position: "br", offsetX: 24, offsetY: 24,
  triggerShape: "circle", triggerSize: 60, triggerIcon: "orb", headerHeight: 64, inputHeight: 48,
  botName: "Aria", avatar: "F",
  welcome: "Hi! I'm Aria from Flowbase. Ask me about pricing, integrations or booking a demo.",
  placeholder: "Ask Aria anything…",
  suggestions: ["How much is Pro?", "Do you integrate with Slack?", "Book a demo"],
  showStatus: true, showBranding: true, autoOpen: true, animation: "spring",
  barWidth: 540, teaser: true, teaserText: "Hi! Need help choosing a plan?", idle: "pulse",
  launcherText: "", searchLabel: "Ask AI", showKbd: true, avatarImg: "",
};

export const PRESETS: Record<Preset, Partial<WidgetConfig>> = {
  sleek: { radius: 12, bubbleR: 10, shadow: "medium", borderWidth: 1, headerStyle: "solid", headerHeight: 54, triggerShape: "rounded", triggerSize: 54, padV: 9, padH: 13, inputStyle: "box", glass: false },
  round: { radius: 24, bubbleR: 20, shadow: "large", borderWidth: 0, headerStyle: "gradient", headerHeight: 64, triggerShape: "circle", triggerSize: 60, padV: 10, padH: 16, inputStyle: "pill", glass: false },
  sharp: { radius: 0, bubbleR: 2, shadow: "none", borderWidth: 2, headerStyle: "solid", headerHeight: 52, triggerShape: "rectangle", triggerSize: 52, padV: 10, padH: 14, inputStyle: "box", glass: false },
  soft: { radius: 18, bubbleR: 16, shadow: "small", borderWidth: 1, headerStyle: "tint", headerHeight: 60, triggerShape: "circle", triggerSize: 56, padV: 10, padH: 14, inputStyle: "pill", glass: false },
  glass: { radius: 22, bubbleR: 16, shadow: "large", borderWidth: 1, headerStyle: "plain", headerHeight: 58, triggerShape: "circle", triggerSize: 58, padV: 10, padH: 14, inputStyle: "pill", glass: true },
  outline: { radius: 8, bubbleR: 6, shadow: "none", borderWidth: 1, headerStyle: "plain", headerHeight: 52, triggerShape: "rounded", triggerSize: 52, padV: 9, padH: 13, inputStyle: "line", glass: false },
};

export interface Palette { name: string; primary: string; secondary: string; bg: string; text: string }

export const PALETTES: Palette[] = [
  { name: "Flowbase", primary: "#4f46e5", secondary: "#9333ea", bg: "#ffffff", text: "#1a1a2e" },
  { name: "Teal", primary: "#0f8b80", secondary: "#0891b2", bg: "#ffffff", text: "#0f172a" },
  { name: "Violet", primary: "#7c3aed", secondary: "#2563eb", bg: "#0f0a1e", text: "#ffffff" },
  { name: "Ocean", primary: "#0891b2", secondary: "#0284c7", bg: "#0a1628", text: "#ffffff" },
  { name: "Emerald", primary: "#059669", secondary: "#0d9488", bg: "#051a13", text: "#ffffff" },
  { name: "Rose", primary: "#e11d48", secondary: "#db2777", bg: "#1a0510", text: "#ffffff" },
  { name: "Sunset", primary: "#ea580c", secondary: "#d97706", bg: "#1a0a00", text: "#ffffff" },
  { name: "Light", primary: "#6366f1", secondary: "#8b5cf6", bg: "#ffffff", text: "#1a1a2e" },
  { name: "Midnight", primary: "#3b82f6", secondary: "#1d4ed8", bg: "#0a0f1e", text: "#ffffff" },
  { name: "Forest", primary: "#16a34a", secondary: "#15803d", bg: "#061008", text: "#ffffff" },
  { name: "Sand", primary: "#b45309", secondary: "#c2410c", bg: "#fdf8f0", text: "#292524" },
  { name: "Mono", primary: "#18181b", secondary: "#52525b", bg: "#ffffff", text: "#18181b" },
];

// Font families come from next/font CSS variables set on <html> in the root layout.
export const FONTS: { id: FontId; label: string; css: string }[] = [
  { id: "system", label: "System UI", css: "system-ui, -apple-system, sans-serif" },
  { id: "geist", label: "Geist", css: "var(--font-geist), system-ui, sans-serif" },
  { id: "bricolage", label: "Bricolage", css: "var(--font-bricolage), system-ui, sans-serif" },
  { id: "helvetica", label: "Helvetica", css: "Helvetica, Arial, sans-serif" },
  { id: "georgia", label: "Georgia", css: "Georgia, serif" },
  { id: "jetbrains", label: "JetBrains Mono", css: "var(--font-jetbrains), Menlo, monospace" },
];

export const SIZES: Record<"s" | "m" | "l", [number, number]> = { s: [320, 480], m: [380, 580], l: [440, 680] };

export const TEMPLATES: { id: Template; name: string; d: string }[] = [
  { id: "bubble", name: "Floating bubble", d: "Classic launcher in a corner" },
  { id: "support", name: "Support desk", d: "Home screen, team & articles" },
  { id: "bar", name: "Chat bar", d: "Slim input pinned to the bottom" },
  { id: "search", name: "Ask AI search", d: "⌘K modal, instant answers" },
  { id: "sidebar", name: "Side panel", d: "Docked to the right edge" },
  { id: "inline", name: "Inline", d: "Embedded in a page section" },
  { id: "fullpage", name: "Full page", d: "A dedicated chat page" },
];

export const AVATARS = ["F", "🤖", "💫", "🧠", "✨", "🎯", "🦊", "🦉", "🌟", "💡", "🚀", "👾"];

export const isCornerTemplate = (t: Template) => t === "bubble" || t === "support";
export const isAlwaysOpen = (t: Template) => t === "inline" || t === "fullpage";

export function fontCss(id: FontId): string {
  return (FONTS.find((f) => f.id === id) ?? FONTS[0]).css;
}

export const HEX = /^#[0-9a-f]{6}$/i;
export const hexOr = (v: string | undefined, fallback: string) => (HEX.test(v || "") ? (v as string) : fallback);

export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function gradient(cfg: Pick<WidgetConfig, "primary" | "secondary">): string {
  return `linear-gradient(135deg, ${cfg.primary}, ${cfg.secondary})`;
}

export function avatarFill(cfg: Pick<WidgetConfig, "avatarImg" | "primary" | "secondary">): string {
  return cfg.avatarImg ? `center / cover no-repeat url("${cfg.avatarImg}")` : gradient(cfg);
}

const clampNum = (v: unknown, min: number, max: number, fb: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fb;
};
const oneOf = <T extends string>(v: unknown, list: readonly T[], fb: T): T =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fb;
const str = (v: unknown, max: number, fb: string) => (typeof v === "string" ? v.slice(0, max) : fb);
const color = (v: unknown, fb: string) => (typeof v === "string" && HEX.test(v) ? v : fb);
const optColor = (v: unknown) => (typeof v === "string" && HEX.test(v) ? v : "");
const bool = (v: unknown, fb: boolean) => (typeof v === "boolean" ? v : fb);
const AVATAR_IMG = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

/**
 * Coerces untrusted input (localStorage, request bodies) into a valid config.
 * Unknown keys are dropped and every value is range/format checked, because the
 * result is rendered into inline styles on third-party sites.
 */
export function sanitizeWidget(input: unknown): WidgetConfig {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_WIDGET;
  const img = typeof o.avatarImg === "string" && o.avatarImg.length < 300_000 && AVATAR_IMG.test(o.avatarImg) ? o.avatarImg : "";
  return {
    template: oneOf(o.template, ["bubble", "support", "bar", "search", "sidebar", "inline", "fullpage"] as const, d.template),
    preset: oneOf(o.preset, ["sleek", "round", "sharp", "soft", "glass", "outline"] as const, d.preset),
    palette: str(o.palette, 40, d.palette),
    primary: color(o.primary, d.primary),
    secondary: color(o.secondary, d.secondary),
    bg: color(o.bg, d.bg),
    text: color(o.text, d.text),
    headerStyle: oneOf(o.headerStyle, ["gradient", "solid", "tint", "plain"] as const, d.headerStyle),
    glass: bool(o.glass, d.glass),
    borderWidth: clampNum(o.borderWidth, 0, 6, d.borderWidth),
    borderColor: optColor(o.borderColor),
    shadow: oneOf(o.shadow, ["none", "small", "medium", "large"] as const, d.shadow),
    radius: clampNum(o.radius, 0, 32, d.radius),
    bubbleR: clampNum(o.bubbleR, 0, 24, d.bubbleR),
    padV: clampNum(o.padV, 4, 24, d.padV),
    padH: clampNum(o.padH, 6, 32, d.padH),
    msgGap: clampNum(o.msgGap, 2, 32, d.msgGap),
    inputStyle: oneOf(o.inputStyle, ["box", "pill", "line"] as const, d.inputStyle),
    userBg: optColor(o.userBg),
    userText: optColor(o.userText),
    botBg: optColor(o.botBg),
    botText: optColor(o.botText),
    font: oneOf(o.font, ["system", "geist", "bricolage", "helvetica", "georgia", "jetbrains"] as const, d.font),
    fontSize: clampNum(o.fontSize, 11, 20, d.fontSize),
    headerFontSize: clampNum(o.headerFontSize, 11, 22, d.headerFontSize),
    msgFontSize: clampNum(o.msgFontSize, 11, 20, d.msgFontSize),
    size: oneOf(o.size, ["s", "m", "l", "custom"] as const, d.size),
    width: clampNum(o.width, 280, 560, d.width),
    height: clampNum(o.height, 360, 780, d.height),
    position: oneOf(o.position, ["br", "bl", "tr", "tl"] as const, d.position),
    offsetX: clampNum(o.offsetX, 0, 200, d.offsetX),
    offsetY: clampNum(o.offsetY, 0, 200, d.offsetY),
    triggerShape: oneOf(o.triggerShape, ["circle", "rounded", "rectangle"] as const, d.triggerShape),
    triggerSize: clampNum(o.triggerSize, 40, 80, d.triggerSize),
    triggerIcon: oneOf(o.triggerIcon, ["orb", "avatar", "chat", "label"] as const, d.triggerIcon),
    headerHeight: clampNum(o.headerHeight, 40, 96, d.headerHeight),
    inputHeight: clampNum(o.inputHeight, 36, 72, d.inputHeight),
    botName: str(o.botName, 40, d.botName),
    avatar: str(o.avatar, 8, d.avatar),
    welcome: str(o.welcome, 600, d.welcome),
    placeholder: str(o.placeholder, 80, d.placeholder),
    suggestions: Array.isArray(o.suggestions)
      ? o.suggestions.filter((s): s is string => typeof s === "string").slice(0, 6).map((s) => s.slice(0, 80))
      : d.suggestions,
    showStatus: bool(o.showStatus, d.showStatus),
    showBranding: bool(o.showBranding, d.showBranding),
    autoOpen: bool(o.autoOpen, d.autoOpen),
    animation: oneOf(o.animation, ["spring", "fade", "slide", "none"] as const, d.animation),
    barWidth: clampNum(o.barWidth, 320, 820, d.barWidth),
    teaser: bool(o.teaser, d.teaser),
    teaserText: str(o.teaserText, 160, d.teaserText),
    idle: oneOf(o.idle, ["pulse", "bounce", "none"] as const, d.idle),
    launcherText: str(o.launcherText, 40, d.launcherText),
    searchLabel: str(o.searchLabel, 30, d.searchLabel),
    showKbd: bool(o.showKbd, d.showKbd),
    avatarImg: img,
  };
}
