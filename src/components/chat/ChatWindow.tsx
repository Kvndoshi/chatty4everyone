"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronRight, HelpCircle, Home, MessageCircle, Search, X } from "lucide-react";
import { chatStyle, type WindowVariant } from "@/lib/chat-style";
import type { WidgetConfig } from "@/lib/widget";
import type { ChatController } from "./useChat";
import { RichText } from "./RichText";

/** Editor tabs a click on part of the widget can jump to. */
export type PickTarget = "colours" | "bot" | "bubbles" | "window";

interface Props {
  cfg: WidgetConfig;
  variant: WindowVariant;
  /** Edge-to-edge (side panel / full page): no radius, border or shadow. */
  flat?: boolean;
  /** Real input + live conversation. */
  interactive?: boolean;
  /** Static example exchange so bubble styles are visible while designing. */
  showSample?: boolean;
  chat?: ChatController;
  /** Editor click-to-edit. When set, hoverable regions get an edit outline. */
  onPick?: (tab: PickTarget) => void;
  /** Support home "Send us a message" / closed chat bar → open the conversation. */
  onActivate?: (question?: string) => void;
  /** Header close / minimise buttons (embed). */
  onClose?: () => void;
  /** Editor: drag the window by its header. */
  onHeaderPointerDown?: (e: ReactPointerEvent) => void;
  style?: CSSProperties;
}

const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
    <path d="M4 14h16" />
  </svg>
);

const round = (bg: string, size: number, fs: number): CSSProperties => ({
  width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "flex",
  alignItems: "center", justifyContent: "center", fontSize: fs, fontWeight: 700, flexShrink: 0,
});

export function ChatWindow({
  cfg, variant, flat = false, interactive = false, showSample = false, chat, onPick, onActivate, onClose, onHeaderPointerDown, style,
}: Props) {
  const c = chatStyle(cfg, variant, flat);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const live = interactive && chat ? chat.messages : [];
  const typing = interactive && chat ? chat.typing : false;
  const lastLen = live.length ? live[live.length - 1].text.length : 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [live.length, lastLen, typing]);

  const editable = (kind: "in" | "out" | "card") => (onPick ? `c4-edit c4-edit-${kind}` : undefined);
  const pick = (t: PickTarget) => (e: React.MouseEvent) => {
    if (!onPick) return;
    e.stopPropagation();
    onPick(t);
  };
  const send = (text: string) => {
    if (!interactive || !chat || !text.trim()) return;
    chat.send(text);
    setDraft("");
  };
  const sugg = cfg.suggestions.filter(Boolean);
  const isPill = variant === "pill";
  const showMsgs = variant === "chat" || variant === "bar";
  const showInput = showMsgs || isPill;
  const brand = cfg.showBranding && (variant === "chat" || variant === "bar" || variant === "support");
  const avatar = (size: number, fs: number, extra?: CSSProperties) => (
    <div style={{ ...round(c.avatarBg, size, fs), ...extra }}>{c.avatar}</div>
  );
  const botBubble: CSSProperties = {
    maxWidth: "85%", padding: c.pad, fontSize: c.mfs, lineHeight: 1.6, background: c.botBg, color: c.botFg,
    border: `1px solid ${c.botLine}`, borderRadius: c.botR, overflowWrap: "anywhere",
  };
  const userBubble: CSSProperties = {
    maxWidth: "85%", padding: c.pad, fontSize: c.mfs, lineHeight: 1.6, background: c.userBg, color: c.userFg,
    borderRadius: c.userR, overflowWrap: "anywhere", whiteSpace: "pre-wrap",
  };
  const headerBtn = (icon: React.ReactNode, label: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClose ? (e) => { e.stopPropagation(); onClose(); } : undefined}
      tabIndex={onClose ? 0 : -1}
      style={{ width: 28, height: 28, borderRadius: 6, background: c.hBtn, color: "inherit", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: onClose ? "pointer" : "inherit", padding: 0 }}
    >
      {icon}
    </button>
  );

  // Latest exchange for the search variant.
  const lastUser = [...live].reverse().find((m) => m.role === "user");
  const lastBot = lastUser ? live.slice(live.indexOf(lastUser) + 1).find((m) => m.role === "assistant") : undefined;

  return (
    <div
      style={{
        width: "100%", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden",
        background: c.bg, color: c.text, border: c.border, borderRadius: c.winR, boxShadow: c.shadow,
        backdropFilter: c.blur, WebkitBackdropFilter: c.blur, fontFamily: c.font, fontSize: c.fs, lineHeight: 1.5,
        ...style,
      }}
    >
      {variant === "chat" && (
        <div
          className={editable("in")}
          onClick={pick("colours")}
          onPointerDown={onHeaderPointerDown}
          title={onPick ? "Header — edit in Colours · drag to move" : undefined}
          style={{
            height: c.headerH, flexShrink: 0, background: c.headerBg, color: c.headerFg, borderBottom: c.headerLine,
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
            cursor: onHeaderPointerDown ? "grab" : onPick ? "pointer" : "default", touchAction: onHeaderPointerDown ? "none" : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {avatar(30, 16, { boxShadow: "0 0 0 1px rgba(255,255,255,0.15)" })}
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: c.hfs, fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.botName}</span>
              {cfg.showStatus && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, opacity: 0.8, lineHeight: 1.3 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />Online
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {headerBtn(<MinusIcon />, "Minimise chat")}
            {headerBtn(<X size={14} strokeWidth={2.5} />, "Close chat")}
          </div>
        </div>
      )}

      {variant === "bar" && (
        <div
          className={editable("in")}
          onClick={pick("bot")}
          style={{ height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: `1px solid ${c.divider}`, cursor: onPick ? "pointer" : "default" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>{avatar(22, 12)}{c.botName}</span>
          <button type="button" aria-label="Close chat" onClick={onClose ? (e) => { e.stopPropagation(); onClose(); } : undefined}
            style={{ border: "none", background: "transparent", color: "inherit", padding: 4, display: "flex", cursor: onClose ? "pointer" : "inherit", opacity: 0.6 }}>
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {showMsgs && (
        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: interactive ? "auto" : "hidden", padding: 16, display: "flex", flexDirection: "column", gap: c.gap }}>
          <div style={{ flex: "1 0 0px" }} />
          <div className={editable("out")} onClick={pick("bot")} title={onPick ? "Welcome — edit in Bot" : undefined}
            style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: onPick ? "pointer" : "default", borderRadius: 8 }}>
            {avatar(28, 14, { marginTop: 2 })}
            <div style={{ ...botBubble, textWrap: "pretty" } as CSSProperties}>{cfg.welcome}</div>
          </div>
          {sugg.length > 0 && live.length === 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 36 }}>
              {sugg.map((q, i) => (
                <button key={i} type="button" onClick={(e) => { if (interactive) { e.stopPropagation(); send(q); } }}
                  style={{ padding: "5px 11px", borderRadius: c.chipR, border: `1px solid ${c.chipLine}`, color: c.chipFg, background: "transparent", fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, cursor: interactive ? "pointer" : "inherit", fontFamily: "inherit" }}>
                  {q}
                </button>
              ))}
            </div>
          )}
          {showSample && (
            <div className={editable("out")} onClick={pick("bubbles")} title={onPick ? "Bubbles — edit in Bubbles" : undefined}
              style={{ display: "flex", flexDirection: "column", gap: c.gap, cursor: onPick ? "pointer" : "default", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={userBubble}>Do you integrate with Slack?</div></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                {avatar(28, 14, { marginTop: 2 })}
                <div style={botBubble}>Yes — Slack is one of 200+ integrations. Want me to open the setup guide?</div>
              </div>
            </div>
          )}
          {live.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", justifyContent: "flex-end", animation: "c4up .25s ease both" }}><div style={userBubble}>{m.text}</div></div>
            ) : (
              <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, animation: "c4up .25s ease both" }}>
                {avatar(28, 14, { marginTop: 2 })}
                <div style={botBubble}><RichText text={m.text} /></div>
              </div>
            ),
          )}
          {typing && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} aria-label={`${c.botName} is typing`}>
              {avatar(28, 14)}
              <div style={{ display: "flex", gap: 4, padding: "13px 14px", background: c.botBg, borderRadius: c.botR }}>
                {[0, 0.15, 0.3].map((d) => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: c.chipFg, animation: `c4dot 1.2s ${d}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showInput && (
        <div className={editable("in")} onClick={isPill && onActivate ? () => onActivate() : pick("window")} title={onPick ? "Input — edit in Window" : undefined}
          style={{ padding: c.inputWrapPad, borderTop: c.inputTop, flexShrink: 0, cursor: onPick || (isPill && onActivate) ? "pointer" : "default" }}>
          <form
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, minHeight: c.inputH, boxSizing: "border-box",
              borderTop: c.inputBorder, borderLeft: c.inputBorder, borderRight: c.inputBorder, borderBottom: c.inputBottom,
              borderRadius: c.inputR, background: c.inputBg, padding: "4px 4px 4px 14px", margin: 0,
            }}
          >
            {isPill && avatar(26, 13, { marginLeft: -6 })}
            {interactive && !isPill ? (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={cfg.placeholder}
                aria-label="Message"
                maxLength={2000}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: c.text, fontFamily: "inherit", fontSize: c.fs, padding: "6px 0" }}
              />
            ) : (
              <span style={{ flex: 1, minWidth: 0, color: c.muted, fontSize: c.fs, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cfg.placeholder}</span>
            )}
            <button
              type={interactive && !isPill ? "submit" : "button"}
              aria-label="Send"
              disabled={interactive && !isPill && chat?.busy}
              onClick={(e) => { if (interactive && !isPill) e.stopPropagation(); }}
              style={{ cursor: "pointer", width: 36, height: 36, border: "none", padding: 0, borderRadius: c.sendR, background: c.userBg, color: c.userFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <SendIcon size={15} />
            </button>
          </form>
        </div>
      )}

      {variant === "support" && (
        <>
          <div className={editable("in")} onClick={pick("colours")}
            style={{ flexShrink: 0, background: c.headerBg, color: c.headerFg, padding: "18px 20px 34px", cursor: onPick ? "pointer" : "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex" }}>
                {avatar(32, 16, { boxShadow: `0 0 0 2px ${c.ring}`, position: "relative", zIndex: 3, fontWeight: 400 })}
                <span style={{ ...round("#fde68a", 32, 12), color: "#78350f", boxShadow: `0 0 0 2px ${c.ring}`, marginLeft: -8, position: "relative", zIndex: 2 }}>MK</span>
                <span style={{ ...round("#bbf7d0", 32, 12), color: "#14532d", boxShadow: `0 0 0 2px ${c.ring}`, marginLeft: -8, position: "relative", zIndex: 1 }}>JS</span>
              </div>
              {headerBtn(<X size={14} strokeWidth={2.5} />, "Close")}
            </div>
            <div style={{ marginTop: 18, fontSize: 15, opacity: 0.85 }}>Hi there,</div>
            <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-.01em" }}>How can we help?</div>
            {cfg.showStatus && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />{c.botName} replies instantly · team in ~2 min
              </div>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "0 14px 14px", marginTop: -18, display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" className={editable("card")} onClick={onActivate ? () => onActivate() : pick("bot")}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: c.cardR, background: c.cardBg, border: `1px solid ${c.divider}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", color: "inherit", fontFamily: "inherit", textAlign: "left" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Send us a message</div>
                <div style={{ fontSize: 12.5, color: c.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cfg.welcome}</div>
              </div>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: c.userBg, color: c.userFg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SendIcon size={15} /></span>
            </button>
            <div style={{ borderRadius: c.cardR, background: c.cardBg, border: `1px solid ${c.divider}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <button type="button" onClick={onActivate ? () => onActivate() : undefined}
                style={{ margin: 10, width: "calc(100% - 20px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 38, padding: "0 12px", borderRadius: c.inputR, background: c.botBg, color: c.muted, fontSize: 13, border: "none", fontFamily: "inherit", cursor: onActivate ? "pointer" : "inherit", boxSizing: "border-box" }}>
                Search for help<Search size={15} />
              </button>
              {sugg.map((q, i) => (
                <button key={i} type="button" onClick={onActivate ? () => onActivate(q) : undefined}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", fontSize: 13, borderLeft: "none", borderRight: "none", borderBottom: "none", borderTop: `1px solid ${c.divider}`, background: "transparent", color: "inherit", fontFamily: "inherit", cursor: onActivate ? "pointer" : "inherit", textAlign: "left" }}>
                  {q}<ChevronRight size={13} />
                </button>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: `1px solid ${c.divider}`, height: 54 }}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 11, fontWeight: 600, color: c.chipFg }}><Home size={17} />Home</span>
            <button type="button" onClick={onActivate ? () => onActivate() : undefined}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 11, color: c.muted, border: "none", background: "transparent", fontFamily: "inherit", cursor: onActivate ? "pointer" : "inherit" }}>
              <MessageCircle size={17} />Messages
            </button>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 11, color: c.muted }}><HelpCircle size={17} />Help</span>
          </div>
        </>
      )}

      {variant === "search" && (
        <>
          <form
            className={editable("in")}
            onClick={pick("window")}
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
            style={{ height: 58, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", borderBottom: `1px solid ${c.divider}`, cursor: onPick ? "pointer" : "default", margin: 0 }}
          >
            <Search size={18} style={{ flexShrink: 0, opacity: 0.7 }} />
            {interactive ? (
              <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={cfg.placeholder} aria-label="Ask a question" maxLength={2000}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: c.text, fontFamily: "inherit", fontSize: 16 }} />
            ) : (
              <span style={{ flex: 1, fontSize: 16 }}>How do I connect Slack?</span>
            )}
            <button type="button" onClick={onClose ? (e) => { e.stopPropagation(); onClose(); } : undefined}
              style={{ font: "500 11px ui-monospace,Menlo,monospace", padding: "2px 6px", borderRadius: 4, border: `1px solid ${c.divider}`, color: c.muted, background: "transparent", cursor: onClose ? "pointer" : "inherit" }}>
              esc
            </button>
          </form>
          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: interactive ? "auto" : "hidden", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className={editable("out")} onClick={pick("bot")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: onPick ? "pointer" : "default" }}>
              {avatar(26, 13, { fontWeight: 400 })}
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.botName}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: c.botBg, color: c.chipFg }}>AI answer</span>
            </div>
            {interactive ? (
              lastUser ? (
                <>
                  <div style={{ fontSize: 13, color: c.muted }}>{lastUser.text}</div>
                  {lastBot ? (
                    <div style={{ fontSize: c.mfs, lineHeight: 1.65, padding: c.pad, background: c.botBg, color: c.botFg, borderRadius: c.botR }}><RichText text={lastBot.text} /></div>
                  ) : (
                    <div style={{ display: "flex", gap: 4, padding: "13px 14px", background: c.botBg, borderRadius: c.botR, alignSelf: "flex-start" }}>
                      {[0, 0.15, 0.3].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: c.chipFg, animation: `c4dot 1.2s ${d}s ease-in-out infinite` }} />)}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: c.mfs, lineHeight: 1.65, color: c.muted }}>{cfg.welcome}</div>
              )
            ) : (
              <>
                <div className={editable("out")} onClick={pick("bubbles")} style={{ fontSize: c.mfs, lineHeight: 1.65, padding: c.pad, background: c.botBg, color: c.botFg, borderRadius: c.botR, cursor: onPick ? "pointer" : "default" }}>
                  Open <strong>Integrations → Slack</strong> and click Connect. Flowbase asks you to pick a workspace and a channel; after that any workflow can post to Slack.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["/integrations/slack", "/docs/getting-started"].map((p) => (
                    <span key={p} style={{ fontSize: 12, padding: "4px 10px", borderRadius: c.chipR, border: `1px solid ${c.divider}`, color: c.muted }}>{p}</span>
                  ))}
                </div>
              </>
            )}
            {sugg.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: c.muted, marginTop: 4 }}>{interactive && lastUser ? "Related" : "Try asking"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {sugg.map((q, i) => (
                    <button key={i} type="button" onClick={(e) => { if (interactive) { e.stopPropagation(); send(q); } }}
                      style={{ padding: "5px 11px", borderRadius: c.chipR, border: `1px solid ${c.chipLine}`, color: c.chipFg, background: "transparent", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", cursor: interactive ? "pointer" : "inherit" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", padding: "10px 18px", borderTop: `1px solid ${c.divider}`, fontSize: 11, color: c.muted }}>
            <span>{cfg.showBranding ? "Powered by Chatty4Everyone" : ""}</span><span>↵ to ask · esc to close</span>
          </div>
        </>
      )}

      {brand && (
        <div className={editable("in")} onClick={pick("bot")} style={{ textAlign: "center", padding: "0 0 8px", fontSize: 10, color: c.muted, flexShrink: 0, cursor: onPick ? "pointer" : "default" }}>
          Powered by Chatty4Everyone
        </div>
      )}
    </div>
  );
}
