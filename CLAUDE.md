# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Chatty4Everyone** is a purely frontend, client-side chatbot builder. There is no backend or API — all state is ephemeral in React. The app generates embed code snippets that reference a hypothetical `chatty4everyone.dev` CDN/service.

### Page flow

`src/app/page.tsx` toggles between two views via a single boolean state:
1. `LandingPage` — marketing page with a "Get Started" CTA
2. `ChatbotWizard` — the 6-step configuration wizard

### Wizard state

`ChatbotWizard` (`src/components/ChatbotWizard.tsx`) holds the entire `ChatbotConfig` object in a single `useState`. Each step receives `config` and an `onChange: (updates: Partial<ChatbotConfig>) => void` callback. Steps are animated with framer-motion slide transitions.

**Steps:**
| # | Label | Component | Configures |
|---|-------|-----------|------------|
| 1 | Identity | `Step1` | `name`, `useCase`, `useCaseDescription` |
| 2 | Intelligence | `Step2` | `systemPrompt`, `model`, `apiKey` |
| 3 | Memory | `Step3` | `memoryProvider`, `ragUrls`, `ragFiles` |
| 4 | Tools | `Step4` | `tools.webSearch`, `tools.calendly` |
| 5 | Design | `Step5` | All UI/style fields; renders `ChatPreview` live |
| 6 | Deploy | `Step6` | Read-only; generates embed code in 4 formats |

### Key types

`src/lib/types.ts` is the single source of truth for:
- `ChatbotConfig` — the full config interface (all step fields)
- `DEFAULT_CONFIG` — initial wizard state
- `USE_CASE_PROMPTS` — pre-written system prompts keyed by `UseCase`
- Union types: `UseCase`, `MemoryProvider`, `LLMModel`, `ChatTemplate`

### Styling conventions

- Tailwind CSS v4 with `@tailwindcss/postcss`
- Custom utility classes defined in `globals.css`: `glass`, `glass-hover`, `grid-bg`, `code-block`
- Dark-only theme (`bg-[#0a0a0f]` base, set in `layout.tsx`)
- `cn()` from `src/lib/utils.ts` wraps `clsx` + `tailwind-merge` for conditional classes
- Purple/blue gradient brand palette (`purple-500`/`blue-500`)

### Step 5 (Design) layout

Split into left controls + right sticky live preview (`ChatPreview`). Controls are tabbed: Template, Style, Content, Behavior. `ChatPreview` (`src/components/ChatPreview.tsx`) renders a mock chat UI driven by the current config.

### Step 6 (Deploy) code generation

`generateEmbedCode()` in `Step6.tsx` produces four embed formats: Script Tag, React Component, NPM Package, iFrame. The bot ID is randomly generated client-side on mount (`useEffect`) and is for demonstration only.
