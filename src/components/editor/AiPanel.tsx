"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { MODEL_SUGGESTIONS, USE_CASES, companyFromHost, hostOf, newNamespace, promptFor, type AISettings } from "@/lib/bot";
import type { WidgetConfig } from "@/lib/widget";
import { KeyField } from "./KeyField";
import { SectionLabel, Slider, Stack, Tip, fieldStyle, sel } from "./ui";
import type { Keys, Published } from "./types";

interface Props {
  ai: AISettings;
  setAI: (patch: Partial<AISettings>) => void;
  cfg: WidgetConfig;
  keys: Keys;
  setKeys: (patch: Partial<Keys>) => void;
  published: Published | null;
}

let modelCache: { id: string; name: string }[] | null = null;

export function AiPanel({ ai, setAI, cfg, keys, setKeys, published }: Props) {
  const [models, setModels] = useState(modelCache ?? []);
  const [urls, setUrls] = useState(ai.website ? (/^https?:\/\//.test(ai.website) ? ai.website : `https://${ai.website}`) : "");
  const [kState, setKState] = useState<{ busy: boolean; msg?: string; err?: string }>({ busy: false });
  const [domains, setDomains] = useState(ai.allowedDomains.join(", "));

  useEffect(() => {
    if (modelCache) return;
    let alive = true;
    fetch("/api/models")
      .then((r) => r.json())
      .then((d: { models?: { id: string; name: string }[] }) => {
        modelCache = d.models ?? [];
        if (alive) setModels(modelCache);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const live = !!keys.openrouter.trim() || !!published?.hasOpenRouter;
  const hasMemory = !!keys.supermemory.trim() || !!published?.hasSupermemory;
  const company = companyFromHost(hostOf(ai.website)) || "our company";

  const addKnowledge = async () => {
    const list = urls.split(/\s+/).map((u) => u.trim()).filter(Boolean).map((u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`));
    if (!list.length) return;
    setKState({ busy: true });
    // Published bots keep their server-side namespace; drafts get one on first use.
    const namespace = ai.knowledgeNamespace || newNamespace(hostOf(ai.website) || cfg.botName);
    if (!ai.knowledgeNamespace && !published) setAI({ knowledgeNamespace: namespace });
    try {
      const body = keys.supermemory.trim()
        ? { supermemoryKey: keys.supermemory.trim(), namespace, urls: list }
        : { botId: published?.botId, editToken: published?.editToken, urls: list };
      const res = await fetch("/api/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't add those pages.");
      setKState({ busy: false, msg: `Added ${data.added} source${data.added === 1 ? "" : "s"}. Supermemory indexes them in the background — give it a minute.${data.failed?.length ? ` Failed: ${data.failed.join(", ")}` : ""}` });
    } catch (e) {
      setKState({ busy: false, err: e instanceof Error ? e.message : "Couldn't add those pages." });
    }
  };

  return (
    <Stack>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface-2)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: live ? "var(--ok)" : "var(--line-strong)", flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--text-2)" }}>
          {live ? <>Live answers via OpenRouter{hasMemory ? " + your knowledge base" : ""}. Try it in <strong>Preview</strong>.</> : <>Demo replies only. Add an OpenRouter key below to get real answers.</>}
        </span>
      </div>

      <Stack gap={10}>
        <SectionLabel>What it does</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6 }}>
          {USE_CASES.map((u) => (
            <button key={u.id} type="button" aria-pressed={ai.useCase === u.id} onClick={() => setAI({ useCase: u.id, systemPrompt: promptFor(u.id, cfg.botName, company) })}
              style={{ ...sel(ai.useCase === u.id), borderWidth: 1, borderStyle: "solid", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, color: "var(--text)", cursor: "pointer", font: "500 12.5px var(--font)", textAlign: "left" }}>
              <span aria-hidden>{u.emoji}</span>{u.label}
            </button>
          ))}
        </div>
      </Stack>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Instructions</span>
        <textarea value={ai.systemPrompt} onChange={(e) => setAI({ systemPrompt: e.target.value })} rows={9} maxLength={8000} className="c4-field"
          style={{ ...fieldStyle, height: "auto", padding: "10px 12px", font: "400 12.5px/1.55 var(--mono)", resize: "vertical" }} />
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>How the assistant should behave. Picking a use case above rewrites this.</span>
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Model</span>
        <input list="c4e-models" value={ai.model} onChange={(e) => setAI({ model: e.target.value })} spellCheck={false} className="c4-field" style={{ ...fieldStyle, fontFamily: "var(--mono)", fontSize: 12.5 }} />
        <datalist id="c4e-models">
          {MODEL_SUGGESTIONS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          {models.filter((m) => !MODEL_SUGGESTIONS.some((s) => s.id === m.id)).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </datalist>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>Any OpenRouter model id. <code>openrouter/auto</code> picks a good one for each question.</span>
      </label>

      <Slider label="Creativity" value={ai.temperature} min={0} max={1} step={0.1} unit="" onChange={(v) => setAI({ temperature: v })} />

      <Stack gap={10} style={{ paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <SectionLabel>Knowledge</SectionLabel>
        {hasMemory ? (
          <>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Pages to learn from</span>
              <textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={3} placeholder={"https://your-site.com\nhttps://your-site.com/pricing"} className="c4-field"
                style={{ ...fieldStyle, height: "auto", padding: "10px 12px", font: "400 12.5px/1.55 var(--mono)", resize: "vertical" }} />
            </label>
            <button type="button" onClick={addKnowledge} disabled={kState.busy || !urls.trim() || (!keys.supermemory.trim() && !published)} className="c4-btn"
              style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--line-strong)", background: "var(--surface)", color: "var(--text)", font: "500 13px var(--font)", cursor: "pointer" }}>
              {kState.busy ? <Loader2 size={14} style={{ animation: "c4spin 1s linear infinite" }} /> : <BookOpen size={14} />}Add to knowledge
            </button>
            {kState.msg && <span style={{ fontSize: 12, color: "var(--ok)", lineHeight: 1.45 }}>{kState.msg}</span>}
            {kState.err && <span role="alert" style={{ fontSize: 12, color: "var(--danger)" }}>{kState.err}</span>}
          </>
        ) : (
          <Tip>Add a Supermemory key below and the assistant will answer from your website and docs (RAG).</Tip>
        )}
      </Stack>

      <Stack gap={10} style={{ paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <SectionLabel>Keys</SectionLabel>
        <KeyField label="OpenRouter API key" provider="openrouter" value={keys.openrouter} onChange={(v) => setKeys({ openrouter: v })} placeholder="sk-or-v1-…" stored={published?.hasOpenRouter}
          help={<>One key for GPT, Claude, Gemini, Llama… Get one at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a> and set a spending limit on it.</>} />
        <KeyField label="Supermemory API key (optional)" provider="supermemory" value={keys.supermemory} onChange={(v) => setKeys({ supermemory: v })} placeholder="sm_…" stored={published?.hasSupermemory}
          help={<>Powers the knowledge base. Get one at <a href="https://console.supermemory.ai" target="_blank" rel="noopener noreferrer">console.supermemory.ai</a>.</>} />
        <span style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.45 }}>Keys stay in this browser tab until you publish. Then they&apos;re encrypted on the server and never sent to your visitors.</span>
      </Stack>

      <Stack gap={6} style={{ paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <SectionLabel>Allowed websites</SectionLabel>
        <input value={domains} onChange={(e) => setDomains(e.target.value)}
          onBlur={() => setAI({ allowedDomains: domains.split(/[\s,]+/).map(hostOf).filter(Boolean) })}
          placeholder="your-site.com, shop.your-site.com" className="c4-field" style={fieldStyle} />
        <span style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.45 }}>Only these sites (and their subdomains) can show the widget. Leave empty to allow any site.</span>
      </Stack>
    </Stack>
  );
}
