# Chatty4Everyone

Put an AI assistant on any website with one line of code.

1. **Set up** — enter your website, pick what the assistant does, paste an [OpenRouter](https://openrouter.ai/keys) key (and optionally a [Supermemory](https://console.supermemory.ai) key so it answers from your pages).
2. **Design** — pick a layout (floating bubble, support desk, chat bar, ⌘K search, side panel, inline, full page) and style it live on a preview of your site. Drag the launcher or window header to move it, drag the edges to resize, click any part of the widget to edit it.
3. **Publish** — copy one line into your site:

```html
<script src="https://YOUR-HOST/widget.js" data-bot="bot_xxxxxxxx" async></script>
```

Install guides for WordPress, Shopify, Wix/Squarespace/Webflow, Google Tag Manager and React/Next.js are built into the editor.

## Run it locally

```bash
npm install
cp .env.example .env.local   # set CHATTY_SECRET
npm run dev                  # http://localhost:3000 → "Get started"
```

The editor is at `/editor`. Without a key the preview uses demo replies; add an OpenRouter key to get real answers.

## How it works

- **Editor** (`/editor`) — everything you design is saved in your browser until you publish.
- **API** (`/api/*`) — publishing stores the bot's design and settings. API keys are encrypted with AES-256-GCM (`CHATTY_SECRET`) and are never sent to visitors.
- **Widget** (`/widget.js` → `/embed/[botId]`) — the script tag adds a transparent, auto-sized iframe that renders the chat. Only the sites listed under **AI → Allowed websites** can load it.
- **Answers** — the chat route calls OpenRouter with your key, adding relevant snippets from your Supermemory knowledge base, and streams the reply.

Control it from your own buttons with `window.Chatty.open()`, `.close()` and `.toggle()`.

## Configuration

| Variable | Purpose |
|---|---|
| `CHATTY_SECRET` | **Required in production.** 16+ random characters; encrypts stored API keys and signs visitor sessions. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Store bots in Upstash Redis. Without them bots are saved to `.data/bots.json`, which works for local and single-server installs but **not** on serverless hosts like Vercel. |
| `NEXT_PUBLIC_APP_URL` | Public URL used in the generated install code (defaults to the editor's origin). |
| `OPENROUTER_BASE_URL` | Optional OpenRouter-compatible endpoint (defaults to `https://openrouter.ai/api/v1`). |

## Scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run lint    # ESLint
```
