"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Globe, X } from "lucide-react";
import { USE_CASES, companyFromHost, hostOf, type UseCase } from "@/lib/bot";
import { KeyField } from "./KeyField";
import { fieldStyle, sel } from "./ui";
import type { Keys } from "./types";

export interface SetupResult {
  website: string;
  botName: string;
  useCase: UseCase;
  notes: string;
  keys: Keys;
  learnFromSite: boolean;
}

const STEPS = ["Your website", "What it does", "Connect AI"];

/** Three short questions that turn the demo bot into the owner's assistant. */
export function Setup({ initial, onDone, onSkip }: {
  initial: { website: string; botName: string; useCase: UseCase; keys: Keys };
  onDone: (r: SetupResult) => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(0);
  const [website, setWebsite] = useState(initial.website);
  const [botName, setBotName] = useState(initial.botName);
  const [useCase, setUseCase] = useState<UseCase>(initial.useCase);
  const [notes, setNotes] = useState("");
  const [keys, setKeys] = useState<Keys>(initial.keys);
  const [learn, setLearn] = useState(true);

  const host = hostOf(website);
  const company = companyFromHost(host);
  const finish = () => onDone({ website: website.trim(), botName: botName.trim() || "Assistant", useCase, notes: notes.trim(), keys, learnFromSite: learn && !!host && !!keys.supermemory.trim() });
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());

  const primaryBtn = (label: React.ReactNode, onClick: () => void, disabled = false) => (
    <button type="button" onClick={onClick} disabled={disabled} className="c4-primary"
      style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 18px", border: "none", borderRadius: 11, background: "var(--accent)", color: "var(--accent-ink)", font: "600 14px var(--font)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, boxShadow: "inset 0 1px 0 rgba(255,255,255,.25),0 6px 18px -6px var(--accent)" }}>
      {label}
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "color-mix(in srgb, var(--bg) 55%, transparent)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "c4fade .2s ease both" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="c4-setup-title"
        style={{ width: "min(560px, 100%)", maxHeight: "calc(100vh - 32px)", overflow: "auto", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)", padding: "22px 24px 20px", animation: "c4spring .45s cubic-bezier(.2,.9,.3,1.15) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: i <= step ? "var(--accent)" : "var(--surface-2)", color: i <= step ? "var(--accent-ink)" : "var(--text-3)", border: i <= step ? "none" : "1px solid var(--line)" }}>
                  {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                {i < STEPS.length - 1 && <span style={{ width: 22, height: 2, borderRadius: 1, background: i < step ? "var(--accent)" : "var(--line)" }} />}
              </div>
            ))}
            <span style={{ marginLeft: 6, fontSize: 12.5, color: "var(--text-3)" }}>{STEPS[step]}</span>
          </div>
          <button type="button" onClick={onSkip} className="c4-ghost" aria-label="Skip setup" title="Skip setup — just design for now"
            style={{ width: 30, height: 30, border: "none", borderRadius: 8, background: "transparent", color: "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20, animation: "c4up .3s ease both" }}>
            <div>
              <h2 id="c4-setup-title" style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 400, fontSize: 32, lineHeight: 1.05 }}>Let&apos;s put an assistant on your site</h2>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>Three quick questions, then you can style it however you like. Nothing to install yet.</p>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Your website</span>
              <div style={{ position: "relative" }}>
                <Globe size={15} style={{ position: "absolute", left: 12, top: 11, color: "var(--text-3)" }} />
                <input autoFocus value={website} onChange={(e) => setWebsite(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                  placeholder="your-site.com" spellCheck={false} className="c4-field" style={{ ...fieldStyle, paddingLeft: 34 }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Used to name things, lock the widget to your domain, and learn from your pages.</span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Assistant&apos;s name</span>
              <input value={botName} onChange={(e) => setBotName(e.target.value)} maxLength={40} onKeyDown={(e) => { if (e.key === "Enter") next(); }} className="c4-field" style={fieldStyle} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20, animation: "c4up .3s ease both" }}>
            <div>
              <h2 id="c4-setup-title" style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 400, fontSize: 32, lineHeight: 1.05 }}>What should {botName || "it"} do?</h2>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-2)" }}>We&apos;ll write its instructions, welcome message and suggested questions{company ? ` for ${company}` : ""}.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
              {USE_CASES.map((u) => (
                <button key={u.id} type="button" aria-pressed={useCase === u.id} onClick={() => setUseCase(u.id)} className="c4-lift"
                  style={{ ...sel(useCase === u.id), borderWidth: 1, borderStyle: "solid", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "12px 12px 11px", borderRadius: 12, color: "var(--text)", cursor: "pointer", textAlign: "left", transition: "transform .15s" }}>
                  <span style={{ fontSize: 20 }} aria-hidden>{u.emoji}</span>
                  <span style={{ font: "600 13px var(--font)" }}>{u.label}</span>
                  <span style={{ font: "400 11.5px/1.35 var(--font)", color: "var(--text-3)" }}>{u.blurb}</span>
                </button>
              ))}
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Anything it should always know? <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} className="c4-field"
                placeholder="e.g. We're open Mon–Fri 9–6. Free shipping over $50. Never promise refunds — hand off to support@…"
                style={{ ...fieldStyle, height: "auto", padding: "10px 12px", font: "400 13.5px/1.5 var(--font)", resize: "vertical" }} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20, animation: "c4up .3s ease both" }}>
            <div>
              <h2 id="c4-setup-title" style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 400, fontSize: 32, lineHeight: 1.05 }}>Connect a brain</h2>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>Paste your API keys — that&apos;s the whole backend. They stay in this tab until you publish, then they&apos;re stored encrypted and never shown to visitors.</p>
            </div>
            <KeyField label="OpenRouter API key" provider="openrouter" value={keys.openrouter} onChange={(v) => setKeys((k) => ({ ...k, openrouter: v }))} placeholder="sk-or-v1-…"
              help={<>One key for GPT, Claude, Gemini and more. Create one at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a> (set a spending limit).</>} />
            <KeyField label="Supermemory API key (optional)" provider="supermemory" value={keys.supermemory} onChange={(v) => setKeys((k) => ({ ...k, supermemory: v }))} placeholder="sm_…"
              help={<>Lets it answer from your website and docs. Get one at <a href="https://console.supermemory.ai" target="_blank" rel="noopener noreferrer">console.supermemory.ai</a>.</>} />
            {host && keys.supermemory.trim() && (
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={learn} onChange={(e) => setLearn(e.target.checked)} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
                Learn from {host} now
              </label>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 22 }}>
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="c4-ghost"
              style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", border: "none", borderRadius: 9, background: "transparent", color: "var(--text-2)", font: "500 13px var(--font)", cursor: "pointer" }}>
              <ArrowLeft size={15} />Back
            </button>
          ) : (
            <button type="button" onClick={onSkip} className="c4-ghost"
              style={{ height: 36, padding: "0 12px", border: "none", borderRadius: 9, background: "transparent", color: "var(--text-3)", font: "500 13px var(--font)", cursor: "pointer" }}>
              Skip — just design
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {step === 2 && !keys.openrouter.trim() && (
              <button type="button" onClick={finish} className="c4-ghost"
                style={{ height: 36, padding: "0 12px", border: "none", borderRadius: 9, background: "transparent", color: "var(--text-2)", font: "500 13px var(--font)", cursor: "pointer" }}>
                Use demo replies for now
              </button>
            )}
            {primaryBtn(step < 2 ? <>Next<ArrowRight size={15} /></> : <>Open the editor<ArrowRight size={15} /></>, next, step === 2 && !keys.openrouter.trim())}
          </div>
        </div>
      </div>
    </div>
  );
}
