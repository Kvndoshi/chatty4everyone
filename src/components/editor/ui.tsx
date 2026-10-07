"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Info, Upload } from "lucide-react";
import { avatarFill, hexOr, type WidgetConfig } from "@/lib/widget";

// Small building blocks for the editor panels, styled after the Claude Design mockup.

export const sel = (on: boolean) => ({
  borderColor: on ? "var(--accent)" : "var(--line)",
  boxShadow: on ? "0 0 0 1px var(--accent), 0 6px 18px -8px var(--accent)" : "none",
  background: on ? "var(--accent-soft)" : "var(--surface)",
});

export const fieldStyle: CSSProperties = {
  height: 38, padding: "0 12px", border: "1px solid var(--line-strong)", borderRadius: 10, background: "var(--surface)",
  color: "var(--text)", font: "400 14px var(--font)", outline: "none", boxSizing: "border-box", width: "100%",
};

export function Stack({ gap = 22, children, style }: { gap?: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-3)" }}>{children}</span>;
}

export function FieldLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{children}</span>
      {right}
    </div>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent-text)", fontSize: 12.5, lineHeight: 1.45 }}>
      <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

export function Seg<T extends string>({ label, options, value, onChange }: {
  label?: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>}
      <div role="radiogroup" aria-label={label} style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "1fr", gap: 2, padding: 3, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.id)}
              style={{ height: 28, border: "none", borderRadius: 7, background: on ? "var(--surface)" : "transparent", boxShadow: on ? "0 1px 2px rgba(0,0,0,.12), 0 0 0 1px var(--line)" : "none", color: on ? "var(--text)" : "var(--text-3)", font: "500 12px var(--font)", cursor: "pointer", whiteSpace: "nowrap" }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({ title, desc, on, onToggle, divider }: { title: string; desc?: string; on: boolean; onToggle: () => void; divider?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, ...(divider ? { padding: "11px 0", borderTop: "1px solid var(--line)" } : {}) }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-3)" }}>{desc}</div>}
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={title} onClick={onToggle}
        style={{ width: 36, height: 20, borderRadius: 999, border: "none", padding: 2, background: on ? "var(--accent)" : "var(--line-strong)", display: "flex", cursor: "pointer", transition: "background .15s", flexShrink: 0 }}>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.25)", transform: on ? "translateX(16px)" : "translateX(0px)", transition: "transform .2s cubic-bezier(.3,1.4,.5,1)" }} />
      </button>
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, unit = "px", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
        <span style={{ font: "400 12px var(--mono)", color: "var(--text)" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}

function Swatch({ fill, hex, onChange, label }: { fill: string; hex: string; onChange: (v: string) => void; label: string }) {
  return (
    <label title={label} style={{ position: "relative", width: 30, height: 30, borderRadius: 9, background: fill, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)", cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
      <input type="color" aria-label={label} value={hex} onChange={(e) => onChange(e.target.value)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", border: "none", padding: 0 }} />
    </label>
  );
}

function HexInput({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <input
      value={draft}
      spellCheck={false}
      aria-label="Hex colour"
      onChange={(e) => {
        setDraft(e.target.value);
        if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onCommit(e.target.value.toLowerCase());
      }}
      onBlur={() => setDraft(value)}
      className="c4-field"
      style={{ width: 84, height: 30, padding: "0 8px", border: "1px solid var(--line-strong)", borderRadius: 8, background: "var(--surface-2)", color: "var(--text)", font: "400 12px var(--mono)", outline: "none", boxSizing: "border-box" }}
    />
  );
}

export function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>{label}</span>
      <Swatch fill={value} hex={hexOr(value, "#000000")} onChange={onChange} label={label} />
      <HexInput key={value} value={value} onCommit={onChange} />
    </div>
  );
}

/** Colour with an "Auto" fallback (derived from the palette) that can be reset. */
export function AutoColorRow({ label, value, auto, autoFill, onChange }: {
  label: string; value: string; auto: string; autoFill?: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>{label}</span>
      {value && (
        <button type="button" className="c4-ghost" onClick={() => onChange("")}
          style={{ height: 24, padding: "0 8px", border: "none", borderRadius: 6, background: "transparent", color: "var(--text-3)", font: "500 11.5px var(--font)", cursor: "pointer" }}>
          Auto
        </button>
      )}
      <Swatch fill={value || autoFill || auto} hex={hexOr(value || auto, "#888888")} onChange={onChange} label={label} />
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, rows, maxLength }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} maxLength={maxLength} className="c4-field"
          style={{ ...fieldStyle, height: "auto", padding: "10px 12px", font: "400 14px/1.5 var(--font)", resize: "vertical" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className="c4-field" style={fieldStyle} />
      )}
    </label>
  );
}

export function AvatarUpload({ cfg, onImage }: { cfg: WidgetConfig; onImage: (dataUrl: string) => void }) {
  const has = !!cfg.avatarImg;
  const onFile = (file: File | undefined) => {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Square-crop and downscale to 160px PNG so it stays small in the config.
        const S = 160, m = Math.min(img.width, img.height) || S, cv = document.createElement("canvas");
        cv.width = S; cv.height = S;
        cv.getContext("2d")?.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
        try { onImage(cv.toDataURL("image/png")); } catch { /* tainted canvas: ignore */ }
      };
      img.src = rd.result as string;
    };
    rd.readAsDataURL(file);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="c4-dash" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px dashed var(--line-strong)", borderRadius: 12, cursor: "pointer", background: "var(--surface-2)", transition: "border-color .15s" }}>
        <span style={{ width: 38, height: 38, borderRadius: "50%", background: avatarFill(cfg), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 17, fontWeight: 700, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }}>
          {has ? "" : cfg.avatar}
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{has ? "Replace image" : "Upload your own image"}</span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>PNG, JPG or WebP · square works best</span>
        </span>
        <Upload size={16} style={{ color: "var(--text-3)" }} />
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} style={{ display: "none" }} />
      </label>
      {has && (
        <button type="button" className="c4-ghost" onClick={() => onImage("")}
          style={{ alignSelf: "flex-start", height: 26, padding: "0 8px", border: "none", background: "transparent", color: "var(--text-3)", font: "500 12px var(--font)", cursor: "pointer", borderRadius: 7 }}>
          Remove image
        </button>
      )}
    </div>
  );
}
