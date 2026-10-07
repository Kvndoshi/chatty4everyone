"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/bot";

export interface UiMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  error?: boolean;
}

export interface ChatController {
  messages: UiMessage[];
  typing: boolean;
  busy: boolean;
  send: (text: string) => void;
  reset: () => void;
}

/**
 * Returns the request to send for a conversation, or null to answer with
 * canned demo replies (used in the editor before an AI key is connected).
 */
export type BuildRequest = (history: ChatMessage[]) => { url: string; body: Record<string, unknown> } | null;

function demoReply(t: string) {
  const x = t.toLowerCase();
  if (/price|cost|pro\b|plan|much/.test(x)) return "Pro is $29/month with unlimited workflows and priority support. Want me to open the pricing page?";
  if (/slack|integrat/.test(x)) return "Slack is one of 200+ integrations — connect it from **Integrations → Slack** in about a minute.";
  if (/demo|book|call|meet/.test(x)) return "Happy to set that up. Thursday has 10:00 and 14:30 free — which works for you?";
  return "Good question! This is a demo reply — connect an AI key in the **AI** tab and I'll answer from your own pages and docs.";
}

let nextId = 1;

export function useChat(buildRequest: BuildRequest): ChatController {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const msgsRef = useRef<UiMessage[]>([]);
  const buildRef = useRef(buildRequest);

  useEffect(() => { buildRef.current = buildRequest; }, [buildRequest]);
  useEffect(() => { msgsRef.current = messages; }, [messages]);
  useEffect(() => () => { abortRef.current?.abort(); clearTimeout(timerRef.current); }, []);

  const append = (m: Omit<UiMessage, "id">) => {
    const msg = { ...m, id: nextId++ };
    setMessages((cur) => [...cur, msg]);
    return msg.id;
  };
  const patch = (id: number, fn: (m: UiMessage) => UiMessage) => setMessages((cur) => cur.map((m) => (m.id === id ? fn(m) : m)));

  const send = useCallback((raw: string) => {
    const text = raw.trim().slice(0, 2000);
    if (!text || abortRef.current) return;
    const history: ChatMessage[] = [
      ...msgsRef.current.filter((m) => !m.error && m.text).map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: text },
    ].slice(-20) as ChatMessage[];
    append({ role: "user", text });
    setTyping(true);

    const req = buildRef.current(history);
    if (!req) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setTyping(false);
        append({ role: "assistant", text: demoReply(text) });
      }, 900);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(true);
    (async () => {
      let id = -1;
      try {
        const res = await fetch(req.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Something went wrong (${res.status}).`);
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          if (!chunk) continue;
          if (id < 0) {
            setTyping(false);
            id = append({ role: "assistant", text: chunk });
          } else {
            patch(id, (m) => ({ ...m, text: m.text + chunk }));
          }
        }
        if (id < 0) append({ role: "assistant", text: "Sorry — I couldn't come up with an answer. Please try again.", error: true });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Network error.";
        if (id < 0) append({ role: "assistant", text: `⚠️ ${msg}`, error: true });
        else patch(id, (m) => ({ ...m, text: `${m.text}\n\n⚠️ ${msg}` }));
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setTyping(false);
        setBusy(false);
      }
    })();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearTimeout(timerRef.current);
    setMessages([]);
    setTyping(false);
    setBusy(false);
  }, []);

  return { messages, typing, busy, send, reset };
}
