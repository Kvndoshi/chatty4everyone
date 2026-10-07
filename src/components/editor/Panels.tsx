"use client";

import { MessageCircle, RotateCcw, X } from "lucide-react";
import {
  AVATARS, FONTS, PALETTES, PRESETS, SIZES, TEMPLATES, avatarFill, gradient, isCornerTemplate, luminance, hexOr,
  type Position, type Preset, type Template, type WidgetConfig,
} from "@/lib/widget";
import { AutoColorRow, AvatarUpload, ColorRow, SectionLabel, Seg, Slider, Stack, TextField, Tip, Toggle, fieldStyle, sel } from "./ui";
import type { Tab } from "./types";

export interface PanelProps {
  tab: Tab;
  cfg: WidgetConfig;
  update: (patch: Partial<WidgetConfig>) => void;
  /** Switch preview to open/closed (picking a launcher style shows it closed). */
  setMode: (m: "open" | "closed") => void;
  replay: () => void;
}

const card = (on: boolean) => ({ ...sel(on), borderWidth: 1, borderStyle: "solid" as const });

function TemplateThumb({ id, prim }: { id: Template; prim: string }) {
  const box = { position: "absolute" as const, boxSizing: "border-box" as const };
  return (
    <span style={{ position: "relative", display: "block", height: 62, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)", overflow: "hidden", boxSizing: "border-box" }}>
      <span style={{ ...box, left: 8, top: 8, width: "40%", height: 4, borderRadius: 2, background: "var(--line-strong)" }} />
      <span style={{ ...box, left: 8, top: 16, width: "58%", height: 4, borderRadius: 2, background: "var(--line)" }} />
      {id === "bubble" && (<>
        <span style={{ ...box, right: 7, bottom: 17, width: 30, height: 34, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--line-strong)", overflow: "hidden" }}><span style={{ display: "block", height: 7, background: prim }} /></span>
        <span style={{ ...box, right: 7, bottom: 5, width: 9, height: 9, borderRadius: "50%", background: prim }} />
      </>)}
      {id === "support" && (<>
        <span style={{ ...box, right: 7, bottom: 17, width: 32, height: 40, borderRadius: 6, background: "var(--surface)", border: "1px solid var(--line-strong)", overflow: "hidden" }}>
          <span style={{ display: "block", height: 16, background: prim }} />
          <span style={{ display: "block", margin: "-4px 3px 0", height: 8, borderRadius: 2, background: "var(--surface)", border: "1px solid var(--line-strong)" }} />
        </span>
        <span style={{ ...box, right: 7, bottom: 5, width: 9, height: 9, borderRadius: "50%", background: prim }} />
      </>)}
      {id === "bar" && <span style={{ ...box, left: "22%", right: "22%", bottom: 7, height: 10, borderRadius: 999, background: "var(--surface)", border: `1px solid ${prim}` }} />}
      {id === "search" && (<>
        <span style={{ ...box, inset: 0, background: "rgba(0,0,0,.18)" }} />
        <span style={{ ...box, left: "20%", right: "20%", top: 12, height: 34, borderRadius: 5, background: "var(--surface)", overflow: "hidden" }}>
          <span style={{ display: "block", height: 8, borderBottom: "1px solid var(--line-strong)" }} />
          <span style={{ display: "block", margin: "5px 5px 0", height: 4, width: "60%", borderRadius: 2, background: prim }} />
        </span>
      </>)}
      {id === "sidebar" && <span style={{ ...box, right: 0, top: 0, bottom: 0, width: "34%", background: "var(--surface)", borderLeft: "1px solid var(--line-strong)" }}><span style={{ display: "block", height: 7, background: prim }} /></span>}
      {id === "inline" && (
        <span style={{ ...box, left: "16%", right: "16%", top: 27, height: 28, borderRadius: 5, background: "var(--surface)", border: "1px solid var(--line-strong)" }}>
          <span style={{ ...box, right: 4, top: 4, width: "30%", height: 5, borderRadius: 3, background: prim }} />
          <span style={{ ...box, left: 4, top: 12, width: "40%", height: 5, borderRadius: 3, background: "var(--line-strong)" }} />
        </span>
      )}
      {id === "fullpage" && (
        <span style={{ ...box, inset: 0, background: "var(--surface)" }}>
          <span style={{ display: "block", height: 9, background: prim }} />
          <span style={{ ...box, right: 8, top: 16, width: "36%", height: 6, borderRadius: 3, background: prim }} />
          <span style={{ ...box, left: 8, top: 26, width: "46%", height: 6, borderRadius: 3, background: "var(--line-strong)" }} />
          <span style={{ ...box, left: 8, right: 8, bottom: 6, height: 8, borderRadius: 999, border: "1px solid var(--line-strong)" }} />
        </span>
      )}
    </span>
  );
}

function TypePanel({ cfg, update, replay }: PanelProps) {
  const grad = gradient(cfg);
  return (
    <Stack>
      <Stack gap={10}>
        <SectionLabel>Chatbot type</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          {TEMPLATES.map((tp) => (
            <button key={tp.id} type="button" className="c4-lift" onClick={() => update({ template: tp.id })} aria-pressed={cfg.template === tp.id}
              style={{ ...card(cfg.template === tp.id), display: "flex", flexDirection: "column", gap: 8, padding: "8px 8px 10px", borderRadius: 12, color: "var(--text)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font)", transition: "border-color .15s,transform .15s" }}>
              <TemplateThumb id={tp.id} prim={cfg.primary} />
              <span style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 2px" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{tp.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.35 }}>{tp.d}</span>
              </span>
            </button>
          ))}
        </div>
      </Stack>
      <Stack gap={10}>
        <SectionLabel>Style</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {(Object.keys(PRESETS) as Preset[]).map((id) => {
            const p = PRESETS[id];
            const head = p.headerStyle === "gradient" ? grad : p.headerStyle === "solid" ? cfg.primary : p.headerStyle === "tint" ? `color-mix(in srgb, ${cfg.primary} 18%, white)` : "transparent";
            return (
              <button key={id} type="button" aria-pressed={cfg.preset === id} onClick={() => { update({ preset: id, ...p }); replay(); }}
                style={{ ...card(cfg.preset === id), display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "10px 6px 9px", borderRadius: 12, color: "var(--text)", cursor: "pointer", font: "500 12px var(--font)" }}>
                <span style={{ width: 46, height: 54, borderRadius: Math.round((p.radius ?? 0) / 2.2), background: p.glass ? "color-mix(in srgb, var(--surface) 55%, transparent)" : "var(--surface)", border: p.borderWidth ? `${Math.min(p.borderWidth, 2)}px solid var(--line-strong)` : "1px solid transparent", boxShadow: p.shadow === "none" ? "none" : p.shadow === "small" ? "0 2px 6px rgba(0,0,0,.12)" : "0 6px 16px rgba(0,0,0,.22)", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
                  <span style={{ height: 12, background: head, borderBottom: p.headerStyle === "plain" ? "1px solid var(--line-strong)" : "none" }} />
                  <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: 5 }}>
                    <span style={{ alignSelf: "flex-end", width: "60%", height: 7, borderRadius: Math.max(1, Math.round((p.bubbleR ?? 0) / 3)), background: cfg.primary }} />
                    <span style={{ width: "70%", height: 7, borderRadius: Math.max(1, Math.round((p.bubbleR ?? 0) / 3)), background: "var(--line-strong)" }} />
                  </span>
                </span>
                {id[0].toUpperCase() + id.slice(1)}
              </button>
            );
          })}
        </div>
      </Stack>
    </Stack>
  );
}

function ColoursPanel({ cfg, update }: PanelProps) {
  return (
    <Stack>
      <Stack gap={10}>
        <SectionLabel>Palettes</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {PALETTES.map((p) => {
            const on = cfg.palette === p.name && cfg.primary === p.primary;
            return (
              <button key={p.name} type="button" title={p.name} aria-pressed={on}
                onClick={() => update({ palette: p.name, primary: p.primary, secondary: p.secondary, bg: p.bg, text: p.text, userBg: "", botBg: "", userText: "", botText: "" })}
                style={{ ...card(on), background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 4px 7px", borderRadius: 12, cursor: "pointer", color: "var(--text-2)", font: "500 11px var(--font)" }}>
                <span style={{ position: "relative", width: 44, height: 30, borderRadius: 8, background: p.bg, border: "1px solid var(--line)", boxSizing: "border-box", overflow: "hidden" }}>
                  <span style={{ position: "absolute", left: 6, top: 6, width: 18, height: 18, borderRadius: "50%", background: gradient(p) }} />
                  <span style={{ position: "absolute", right: 6, top: 11, width: 12, height: 8, borderRadius: 3, background: p.text, opacity: 0.7 }} />
                </span>
                {p.name}
              </button>
            );
          })}
        </div>
      </Stack>
      <Stack gap={10}>
        <SectionLabel>Brand colours</SectionLabel>
        <ColorRow label="Primary" value={cfg.primary} onChange={(v) => update({ primary: v })} />
        <ColorRow label="Secondary" value={cfg.secondary} onChange={(v) => update({ secondary: v })} />
        <ColorRow label="Background" value={cfg.bg} onChange={(v) => update({ bg: v })} />
        <ColorRow label="Text" value={cfg.text} onChange={(v) => update({ text: v })} />
      </Stack>
      <Seg label="Header" value={cfg.headerStyle} onChange={(v) => update({ headerStyle: v })}
        options={[{ id: "gradient", label: "Gradient" }, { id: "solid", label: "Solid" }, { id: "tint", label: "Tint" }, { id: "plain", label: "Plain" }]} />
      <Seg label="Shadow" value={cfg.shadow} onChange={(v) => update({ shadow: v })}
        options={[{ id: "none", label: "Off" }, { id: "small", label: "Soft" }, { id: "medium", label: "Med" }, { id: "large", label: "Strong" }]} />
      <Toggle title="Frosted glass" desc="Translucent window with background blur" on={cfg.glass} onToggle={() => update({ glass: !cfg.glass })} />
      <Slider label="Border width" value={cfg.borderWidth} min={0} max={6} onChange={(v) => update({ borderWidth: v })} />
    </Stack>
  );
}

function BubblesPanel({ cfg, update }: PanelProps) {
  const light = luminance(hexOr(cfg.bg, "#ffffff")) > 0.5;
  const auto = { userBg: cfg.primary, userText: "#ffffff", botBg: light ? "#f3f4f6" : "#262633", botText: cfg.text };
  return (
    <Stack>
      <Stack gap={10}>
        <SectionLabel>Message colours</SectionLabel>
        <AutoColorRow label="Visitor bubble" value={cfg.userBg} auto={auto.userBg} autoFill={gradient(cfg)} onChange={(v) => update({ userBg: v })} />
        <AutoColorRow label="Visitor text" value={cfg.userText} auto={auto.userText} onChange={(v) => update({ userText: v })} />
        <AutoColorRow label="Bot bubble" value={cfg.botBg} auto={auto.botBg} onChange={(v) => update({ botBg: v })} />
        <AutoColorRow label="Bot text" value={cfg.botText} auto={auto.botText} onChange={(v) => update({ botText: v })} />
      </Stack>
      <Seg label="Input style" value={cfg.inputStyle} onChange={(v) => update({ inputStyle: v })}
        options={[{ id: "box", label: "Box" }, { id: "pill", label: "Pill" }, { id: "line", label: "Underline" }]} />
      <Stack gap={16}>
        <SectionLabel>Shape &amp; spacing</SectionLabel>
        <Slider label="Bubble roundness" value={cfg.bubbleR} min={0} max={24} onChange={(v) => update({ bubbleR: v })} />
        <Slider label="Padding — vertical" value={cfg.padV} min={4} max={24} onChange={(v) => update({ padV: v })} />
        <Slider label="Padding — horizontal" value={cfg.padH} min={6} max={32} onChange={(v) => update({ padH: v })} />
        <Slider label="Gap between messages" value={cfg.msgGap} min={2} max={32} onChange={(v) => update({ msgGap: v })} />
      </Stack>
    </Stack>
  );
}

function TextPanel({ cfg, update }: PanelProps) {
  return (
    <Stack>
      <Stack gap={10}>
        <SectionLabel>Typeface</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          {FONTS.map((f) => (
            <button key={f.id} type="button" aria-pressed={cfg.font === f.id} onClick={() => update({ font: f.id })}
              style={{ ...card(cfg.font === f.id), display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "10px 12px", borderRadius: 12, color: "var(--text)", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: f.css, fontSize: 24, lineHeight: 1 }}>Aa</span>
              <span style={{ font: "500 11.5px var(--font)", color: "var(--text-2)" }}>{f.label}</span>
            </button>
          ))}
        </div>
      </Stack>
      <Stack gap={16}>
        <SectionLabel>Sizes</SectionLabel>
        <Slider label="Body & input" value={cfg.fontSize} min={11} max={20} onChange={(v) => update({ fontSize: v })} />
        <Slider label="Header" value={cfg.headerFontSize} min={11} max={22} onChange={(v) => update({ headerFontSize: v })} />
        <Slider label="Messages" value={cfg.msgFontSize} min={11} max={20} onChange={(v) => update({ msgFontSize: v })} />
      </Stack>
    </Stack>
  );
}

function LauncherPanel({ cfg, update, setMode }: PanelProps) {
  const T = cfg.template;
  const grad = gradient(cfg);
  const icons = [{ id: "orb", name: "3D orb" }, { id: "avatar", name: "Avatar" }, { id: "chat", name: "Chat" }, { id: "label", name: "Label" }] as const;
  const upload = <AvatarUpload cfg={cfg} onImage={(v) => update({ avatarImg: v })} />;
  if (isCornerTemplate(T)) {
    return (
      <Stack>
        <Stack gap={10}>
          <SectionLabel>Launcher style</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {icons.map((i) => (
              <button key={i.id} type="button" aria-pressed={cfg.triggerIcon === i.id} onClick={() => { update({ triggerIcon: i.id }); setMode("closed"); }}
                style={{ ...card(cfg.triggerIcon === i.id), display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "10px 4px 8px", borderRadius: 12, color: "var(--text)", cursor: "pointer", font: "500 11px var(--font)" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: i.id === "avatar" && cfg.avatarImg ? avatarFill(cfg) : grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, overflow: "hidden", position: "relative" }}>
                  {i.id === "orb" && <span style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 32% 28%,rgba(255,255,255,.9),rgba(255,255,255,0) 42%),radial-gradient(circle at 70% 80%,rgba(0,0,0,.35),transparent 60%)" }} />}
                  {i.id === "avatar" && !cfg.avatarImg && cfg.avatar}
                  {i.id === "chat" && <MessageCircle size={16} fill="currentColor" />}
                  {i.id === "label" && <span style={{ fontSize: 9, fontWeight: 700 }}>Ask</span>}
                </span>
                {i.name}
              </button>
            ))}
          </div>
        </Stack>
        {upload}
        {cfg.triggerIcon === "label" && (
          <TextField label="Label text" value={cfg.launcherText} placeholder={`Ask ${cfg.botName || "us"}`} maxLength={40} onChange={(v) => update({ launcherText: v })} />
        )}
        <Seg label="Shape" value={cfg.triggerShape} onChange={(v) => update({ triggerShape: v })}
          options={[{ id: "circle", label: "Circle" }, { id: "rounded", label: "Rounded" }, { id: "rectangle", label: "Square" }]} />
        <Slider label="Launcher size" value={cfg.triggerSize} min={40} max={80} onChange={(v) => update({ triggerSize: v })} />
        <Seg label="Idle motion" value={cfg.idle} onChange={(v) => update({ idle: v })}
          options={[{ id: "pulse", label: "Pulse" }, { id: "bounce", label: "Bounce" }, { id: "none", label: "Still" }]} />
        <Stack gap={10} style={{ paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <Toggle title="Proactive message" desc="A short nudge beside the launcher" on={cfg.teaser} onToggle={() => update({ teaser: !cfg.teaser })} />
          <textarea value={cfg.teaserText} onChange={(e) => update({ teaserText: e.target.value })} rows={2} maxLength={160} aria-label="Proactive message" className="c4-field"
            style={{ ...fieldStyle, height: "auto", padding: "10px 12px", font: "400 13.5px/1.5 var(--font)", resize: "none" }} />
        </Stack>
      </Stack>
    );
  }
  if (T === "bar") {
    return (
      <Stack>
        <Tip>Drag the ends of the bar on the page to change its width.</Tip>
        <Slider label="Bar width" value={cfg.barWidth} min={320} max={820} onChange={(v) => update({ barWidth: v })} />
        <Slider label="Bar height" value={cfg.inputHeight} min={36} max={72} onChange={(v) => update({ inputHeight: v })} />
        <TextField label="Placeholder" value={cfg.placeholder} maxLength={80} onChange={(v) => update({ placeholder: v })} />
        <Seg label="Bar style" value={cfg.inputStyle} onChange={(v) => update({ inputStyle: v })}
          options={[{ id: "box", label: "Box" }, { id: "pill", label: "Pill" }, { id: "line", label: "Underline" }]} />
        {upload}
      </Stack>
    );
  }
  if (T === "search") {
    return (
      <Stack>
        <TextField label="Button label" value={cfg.searchLabel} placeholder="Ask AI" maxLength={30} onChange={(v) => update({ searchLabel: v })} />
        <Toggle title="Show ⌘K shortcut" desc="Keyboard hint on the button — the shortcut opens it too" on={cfg.showKbd} onToggle={() => update({ showKbd: !cfg.showKbd })} />
        {upload}
      </Stack>
    );
  }
  if (T === "sidebar") {
    return (
      <Stack>
        <TextField label="Tab label" value={cfg.launcherText} placeholder={`Ask ${cfg.botName || "us"}`} maxLength={40} onChange={(v) => update({ launcherText: v })} />
      </Stack>
    );
  }
  return <Tip>This chatbot type is always open, so it has no launcher.</Tip>;
}

function PositionPanel({ cfg, update }: PanelProps) {
  const T = cfg.template;
  const corner = isCornerTemplate(T);
  const spots: { id: Position; label: string; pos: React.CSSProperties }[] = [
    { id: "tl", label: "Top left", pos: { top: 8, left: 8 } },
    { id: "tr", label: "Top right", pos: { top: 8, right: 8 } },
    { id: "bl", label: "Bottom left", pos: { bottom: 8, left: 8 } },
    { id: "br", label: "Bottom right", pos: { bottom: 8, right: 8 } },
  ];
  return (
    <Stack>
      {corner && (<>
        <Tip>Drag the launcher (or the chat window&apos;s header) on the page — it snaps to the nearest corner.</Tip>
        <Stack gap={8}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Corner</span>
          <div style={{ position: "relative", width: "100%", height: 118, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)", boxSizing: "border-box", backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px)", backgroundSize: "100% 16px", backgroundPosition: "0 30px", backgroundRepeat: "repeat-y" }}>
            {spots.map((p) => (
              <button key={p.id} type="button" title={p.label} aria-label={p.label} aria-pressed={cfg.position === p.id} onClick={() => update({ position: p.id })}
                style={{ position: "absolute", ...p.pos, width: 22, height: 22, borderRadius: "50%", border: `2px solid ${cfg.position === p.id ? "var(--accent)" : "var(--line-strong)"}`, background: cfg.position === p.id ? "var(--accent)" : "var(--surface)", cursor: "pointer", padding: 0, boxSizing: "border-box", transition: "background .15s" }} />
            ))}
          </div>
        </Stack>
        <Slider label="Offset X" value={cfg.offsetX} min={0} max={200} onChange={(v) => update({ offsetX: v })} />
        <Slider label="Offset Y" value={cfg.offsetY} min={0} max={200} onChange={(v) => update({ offsetY: v })} />
      </>)}
      {T === "bar" && <Slider label="Bottom offset" value={cfg.offsetY} min={0} max={200} onChange={(v) => update({ offsetY: v })} />}
      {!corner && T !== "bar" && <Tip>This chatbot type has a fixed spot on the page. Switch to Floating bubble, Support desk or Chat bar to move it.</Tip>}
    </Stack>
  );
}

function WindowPanel({ cfg, update }: PanelProps) {
  return (
    <Stack>
      <Tip>Drag the edges or the corner dot of the chat window on the page to resize it, or drag its header to move it.</Tip>
      <Seg label="Preset size" value={cfg.size === "custom" ? ("" as "s") : (cfg.size as "s" | "m" | "l")}
        onChange={(v) => update({ size: v, width: SIZES[v][0], height: SIZES[v][1] })}
        options={[{ id: "s", label: "S" }, { id: "m", label: "M" }, { id: "l", label: "L" }]} />
      <Slider label="Width" value={cfg.width} min={280} max={560} onChange={(v) => update({ width: v, size: "custom" })} />
      <Slider label="Height" value={cfg.height} min={360} max={780} onChange={(v) => update({ height: v, size: "custom" })} />
      <Slider label="Corner radius" value={cfg.radius} min={0} max={32} onChange={(v) => update({ radius: v })} />
      <Slider label="Header height" value={cfg.headerHeight} min={40} max={96} onChange={(v) => update({ headerHeight: v })} />
      <Slider label="Input height" value={cfg.inputHeight} min={36} max={72} onChange={(v) => update({ inputHeight: v })} />
      <Seg label="Input style" value={cfg.inputStyle} onChange={(v) => update({ inputStyle: v })}
        options={[{ id: "box", label: "Box" }, { id: "pill", label: "Pill" }, { id: "line", label: "Underline" }]} />
    </Stack>
  );
}

function BotPanel({ cfg, update, replay }: PanelProps) {
  return (
    <Stack gap={20}>
      <TextField label="Bot name" value={cfg.botName} maxLength={40} onChange={(v) => update({ botName: v })} />
      <Stack gap={8}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Avatar</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
          {AVATARS.map((v) => {
            const on = !cfg.avatarImg && cfg.avatar === v;
            return (
              <button key={v} type="button" className="c4-grow" aria-pressed={on} onClick={() => update({ avatar: v, avatarImg: "" })}
                style={{ ...card(on), aspectRatio: "1", borderRadius: 10, fontSize: 18, fontWeight: 700, color: "var(--text)", cursor: "pointer", padding: 0, transition: "transform .15s" }}>
                {v}
              </button>
            );
          })}
        </div>
        <AvatarUpload cfg={cfg} onImage={(v) => update({ avatarImg: v })} />
      </Stack>
      <TextField label="Welcome message" value={cfg.welcome} rows={3} maxLength={600} onChange={(v) => update({ welcome: v })} />
      <Stack gap={8}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Suggested questions</span>
        {cfg.suggestions.map((q, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 4px 0 12px", border: "1px solid var(--line-strong)", borderRadius: 10, boxSizing: "border-box", background: "var(--surface)" }}>
            <input value={q} maxLength={80} aria-label={`Suggested question ${i + 1}`}
              onChange={(e) => { const a = [...cfg.suggestions]; a[i] = e.target.value; update({ suggestions: a }); }}
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "var(--text)", font: "400 13.5px var(--font)" }} />
            <button type="button" title="Remove" aria-label="Remove question" className="c4-ghost" onClick={() => update({ suggestions: cfg.suggestions.filter((_, j) => j !== i) })}
              style={{ width: 26, height: 26, border: "none", background: "transparent", color: "var(--text-3)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        ))}
        {cfg.suggestions.length < 6 && (
          <button type="button" className="c4-accent-ghost" onClick={() => update({ suggestions: [...cfg.suggestions, "New question"] })}
            style={{ alignSelf: "flex-start", height: 30, padding: "0 10px", border: "none", background: "transparent", color: "var(--accent-text)", font: "500 13px var(--font)", cursor: "pointer", borderRadius: 8 }}>
            + Add question
          </button>
        )}
      </Stack>
      <TextField label="Input placeholder" value={cfg.placeholder} maxLength={80} onChange={(v) => update({ placeholder: v })} />
      <Stack gap={8}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Open animation</span>
          <button type="button" className="c4-accent-ghost" onClick={replay}
            style={{ display: "flex", alignItems: "center", gap: 5, height: 24, padding: "0 8px", border: "none", borderRadius: 6, background: "transparent", color: "var(--accent-text)", font: "500 12px var(--font)", cursor: "pointer" }}>
            <RotateCcw size={12} />Replay
          </button>
        </div>
        <Seg value={cfg.animation} onChange={(v) => { update({ animation: v }); replay(); }}
          options={[{ id: "spring", label: "Spring" }, { id: "fade", label: "Fade" }, { id: "slide", label: "Slide" }, { id: "none", label: "None" }]} />
      </Stack>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Toggle divider title="Online status" desc="Green dot under the bot name" on={cfg.showStatus} onToggle={() => update({ showStatus: !cfg.showStatus })} />
        <Toggle divider title="Open automatically" desc="After 8 seconds on the page" on={cfg.autoOpen} onToggle={() => update({ autoOpen: !cfg.autoOpen })} />
        <Toggle divider title="“Powered by” footer" desc="Small credit under the input" on={cfg.showBranding} onToggle={() => update({ showBranding: !cfg.showBranding })} />
      </div>
    </Stack>
  );
}

export function DesignPanel(props: PanelProps) {
  switch (props.tab) {
    case "type": return <TypePanel {...props} />;
    case "colours": return <ColoursPanel {...props} />;
    case "bubbles": return <BubblesPanel {...props} />;
    case "text": return <TextPanel {...props} />;
    case "launcher": return <LauncherPanel {...props} />;
    case "position": return <PositionPanel {...props} />;
    case "window": return <WindowPanel {...props} />;
    case "bot": return <BotPanel {...props} />;
    default: return null;
  }
}
