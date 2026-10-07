# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured. Verify UI changes in a browser (the editor at `/editor`, the widget via a host page that loads `/widget.js`).

## Architecture

**Chatty4Everyone** lets anyone add an AI assistant to their website with one script tag. Next.js 16 App Router, React 19, Tailwind v4 (landing page only — the editor and widget use inline styles + CSS variables).

### Routes

| Route | What |
|---|---|
| `/` | `LandingPage` (marketing); CTA → `/editor` |
| `/editor` | The builder. Client-only (`EditorLoader` → `dynamic(..., { ssr: false })`) because it reads browser storage on first render |
| `/embed/[botId]` | Rendered inside the iframe on customer sites. Checks the Referer against the bot's allowed domains, mints a visitor session token |
| `public/widget.js` | Plain-JS loader: creates the iframe, sizes/positions it from `box` postMessages, exposes `window.Chatty.open/close/toggle` |
| `/api/chat` | Streams answers (plain text). Three auth modes: draft (owner's key in body), owner (edit token), visitor (session token) |
| `/api/bots`, `/api/bots/[id]` | Publish (POST) and update/read (PUT/GET with `Authorization: Bearer <editToken>`) |
| `/api/verify-key`, `/api/knowledge`, `/api/models` | Key check, add URLs to Supermemory, OpenRouter model list |

### Key modules

- `src/lib/widget.ts` — `WidgetConfig` (all appearance settings), `DEFAULT_WIDGET`, presets, palettes, fonts, `sanitizeWidget()` (validates untrusted config; output is rendered into inline styles on third-party sites).
- `src/lib/bot.ts` — `AISettings` (use case, model, system prompt, allowed domains, knowledge namespace), use-case templates, `sanitizeAI()`.
- `src/lib/chat-style.ts` — derives every colour/size the chat window needs from a `WidgetConfig`.
- `src/components/chat/` — `ChatWindow` (variants `chat | support | search | bar | pill`), `Launcher`, `Teaser`, `ChattyOrb` (three.js, lazy-loaded), `useChat` (streaming hook), `RichText` (safe mini-markdown). Shared by the editor preview and the embed so they always match.
- `src/components/editor/` — `Editor` (state, undo/redo, publish, floating/docked panel), `Stage` (preview canvas with drag-to-move/resize), `Panels` (design tabs), `AiPanel`, `Setup` (3-step onboarding), `CodeDrawer` (install guides from `src/lib/embed-code.ts`).
- `src/lib/server/` — `store` (Upstash Redis REST or `.data/bots.json`), `crypto` (AES-GCM for API keys, HMAC session tokens, derived from `CHATTY_SECRET`), `llm` (OpenRouter streaming), `knowledge` (Supermemory v5 SDK: `search`/`add` by namespace), `rate-limit` (in-memory).

### Editor state

`Editor` keeps the widget config in an undo history (`update(patch)`; changes within 450ms merge into one step), plus AI settings and UI prefs, all persisted to `localStorage`. API keys live only in `sessionStorage` until publish, after which they're cleared from the browser and the preview chats through the owner mode. The editor UI is themeable (`data-theme` light/dark + `--accent`) via the `.c4-app` tokens in `globals.css`.

### Embed sizing protocol

The iframe is always exactly as large as what's visible so the host page stays clickable. `EmbedClient` measures its content and posts `{ type: "box", box }` (`corner | bottom | edge | side | fill | inline`); the loader applies fixed positioning. The loader sends `{ type: "env", mobile, vw, vh }` after the embed posts `ready`.
