"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { fieldStyle } from "./ui";

type Status = { state: "idle" } | { state: "checking" } | { state: "ok"; note?: string } | { state: "error"; error: string };

/** Masked API key input with a "Verify" button that checks the key server-side. */
export function KeyField({ label, provider, value, onChange, placeholder, help, stored }: {
  label: string;
  provider: "openrouter" | "supermemory";
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  help?: React.ReactNode;
  /** The server already holds a key for this provider. */
  stored?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const verify = async () => {
    if (!value.trim()) return;
    setStatus({ state: "checking" });
    try {
      const res = await fetch("/api/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key: value.trim() }),
      });
      const data = await res.json();
      setStatus(data.ok ? { state: "ok", note: data.label } : { state: "error", error: data.error || "That key didn't work." });
    } catch {
      setStatus({ state: "error", error: "Couldn't reach the server." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        {stored && !value && <span style={{ fontSize: 11.5, color: "var(--ok)", display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Saved on server</span>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => { onChange(e.target.value); setStatus({ state: "idle" }); }}
            placeholder={stored ? "Paste a new key to replace it" : placeholder}
            autoComplete="off"
            spellCheck={false}
            aria-label={label}
            className="c4-field"
            style={{ ...fieldStyle, paddingRight: 36, fontFamily: value && !show ? "var(--mono)" : "var(--font)", fontSize: 13 }}
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide key" : "Show key"}
            style={{ position: "absolute", right: 6, top: 7, width: 24, height: 24, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button type="button" onClick={verify} disabled={!value.trim() || status.state === "checking"} className="c4-btn"
          style={{ height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid var(--line-strong)", background: status.state === "ok" ? "var(--accent-soft)" : "var(--surface)", color: status.state === "ok" ? "var(--accent-text)" : "var(--text)", font: "500 13px var(--font)", cursor: value.trim() ? "pointer" : "not-allowed", opacity: value.trim() ? 1 : 0.55, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {status.state === "checking" ? <Loader2 size={14} style={{ animation: "c4spin 1s linear infinite" }} /> : status.state === "ok" ? <Check size={14} /> : null}
          {status.state === "ok" ? "Verified" : "Verify"}
        </button>
      </div>
      {status.state === "error" && <span role="alert" style={{ fontSize: 12, color: "var(--danger)" }}>{status.error}</span>}
      {status.state === "ok" && status.note && <span style={{ fontSize: 12, color: "var(--ok)" }}>Connected · {status.note}</span>}
      {help && status.state !== "error" && <span style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.45 }}>{help}</span>}
    </div>
  );
}
