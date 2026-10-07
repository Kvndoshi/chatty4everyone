"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Rocket, X } from "lucide-react";
import { INSTALL_TARGETS, installGuide, type InstallTarget } from "@/lib/embed-code";
import type { Template } from "@/lib/widget";
import type { Published } from "./types";

export function CodeDrawer({ origin, published, template, onClose, onPublish, publishing, dirty }: {
  origin: string;
  published: Published | null;
  template: Template;
  onClose: () => void;
  onPublish: () => void;
  publishing: boolean;
  /** There are unpublished changes. */
  dirty: boolean;
}) {
  const [target, setTarget] = useState<InstallTarget>("script");
  const [copied, setCopied] = useState(false);
  const guide = installGuide(target, origin, published?.botId ?? null, template);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(guide.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the code is still selectable */
    }
  };

  return (
    <div role="dialog" aria-label="Install code"
      style={{ position: "absolute", left: 24, right: 24, bottom: 20, zIndex: 6, maxHeight: "58%", display: "flex", flexDirection: "column", borderRadius: 16, background: "#0e0f12", color: "#e8e8ea", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 30px 80px -20px rgba(0,0,0,.6)", overflow: "hidden", animation: "c4sheet .35s cubic-bezier(.2,.8,.2,1) both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 10px 10px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 10, background: "rgba(255,255,255,.06)", overflowX: "auto", minWidth: 0 }}>
          {INSTALL_TARGETS.map((o) => (
            <button key={o.id} type="button" onClick={() => setTarget(o.id)} aria-pressed={target === o.id}
              style={{ height: 26, padding: "0 12px", border: "none", borderRadius: 7, background: target === o.id ? "rgba(255,255,255,.12)" : "transparent", color: target === o.id ? "#fff" : "#9a9aa2", font: "500 12.5px var(--font)", cursor: "pointer", whiteSpace: "nowrap" }}>
              {o.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button type="button" onClick={copy}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", border: "none", borderRadius: 8, background: copied ? "#15803d" : "var(--accent)", color: "#fff", font: "600 12.5px var(--font)", cursor: "pointer", transition: "background .15s" }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={onClose} title="Close" aria-label="Close"
            style={{ width: 30, height: 30, border: "none", borderRadius: 8, background: "rgba(255,255,255,.06)", color: "#e8e8ea", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
            <X size={15} />
          </button>
        </div>
      </div>
      <div style={{ overflow: "auto" }}>
        {(!published || dirty) && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 18px 0", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.06)", fontSize: 12.5, lineHeight: 1.45, color: "#cfcfd4" }}>
            <span style={{ flex: 1 }}>
              {published ? "You have unpublished changes. Publish to update the live assistant — the code stays the same." : "Publish to get your real bot ID. Until then the code uses a placeholder."}
            </span>
            <button type="button" onClick={onPublish} disabled={publishing}
              style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", font: "600 12.5px var(--font)", cursor: "pointer", flexShrink: 0 }}>
              {publishing ? <Loader2 size={14} style={{ animation: "c4spin 1s linear infinite" }} /> : <Rocket size={14} />}Publish
            </button>
          </div>
        )}
        <ol style={{ margin: "14px 0 0", padding: "0 18px 0 38px", fontSize: 13, lineHeight: 1.6, color: "#cfcfd4" }}>
          {guide.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <pre style={{ margin: "12px 18px 18px", padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,.04)", overflow: "auto", font: "400 12.5px/1.65 var(--mono)", color: "#e8e8ea", whiteSpace: "pre" }}>{guide.code}</pre>
      </div>
    </div>
  );
}
