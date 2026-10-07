/**
 * "Brain" settings for a bot: what it does, which model answers, and where its
 * knowledge lives. Shared by the editor, setup flow and API routes.
 */

export type UseCase = "support" | "sales" | "docs" | "booking" | "shop" | "custom";

export interface AISettings {
  useCase: UseCase;
  website: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  /** Hostnames allowed to embed the widget. Empty = any site. */
  allowedDomains: string[];
  /** Supermemory namespace this bot searches. */
  knowledgeNamespace: string;
}

export interface UseCaseDef {
  id: UseCase;
  label: string;
  emoji: string;
  blurb: string;
  prompt: string;
  welcome: (name: string, company: string) => string;
  suggestions: string[];
  teaser: string;
}

export const USE_CASES: UseCaseDef[] = [
  {
    id: "support", label: "Customer support", emoji: "🎧", blurb: "Answer questions, fix problems, hand off to a human",
    prompt: `You are {BOT}, the customer support assistant for {COMPANY}.
- Answer questions clearly, kindly and accurately.
- Help visitors resolve problems step by step.
- If you are unsure, say so and offer to connect them with the team.
Keep answers short and friendly.`,
    welcome: (n, c) => `Hi! I'm ${n} from ${c}. How can I help you today?`,
    suggestions: ["I have a problem with my order", "How do I reset my password?", "Talk to a human"],
    teaser: "Hi! Need a hand with anything?",
  },
  {
    id: "sales", label: "Sales & leads", emoji: "📈", blurb: "Explain pricing, qualify leads, book demos",
    prompt: `You are {BOT}, a friendly sales assistant for {COMPANY}.
- Understand what the visitor needs and recommend the right product or plan.
- Answer pricing and feature questions honestly.
- When there is interest, ask for their name and email so the team can follow up, or suggest booking a demo.
Be consultative, never pushy.`,
    welcome: (n, c) => `Hi! I'm ${n}. Ask me about ${c}'s pricing, features or booking a demo.`,
    suggestions: ["How much does it cost?", "Which plan is right for me?", "Book a demo"],
    teaser: "Hi! Need help choosing a plan?",
  },
  {
    id: "docs", label: "Docs & FAQ", emoji: "📚", blurb: "Instant answers from your docs and help pages",
    prompt: `You are {BOT}, the documentation assistant for {COMPANY}.
- Answer using the provided knowledge whenever possible and mention the relevant page.
- Give step-by-step instructions with short code examples when helpful.
- If the docs don't cover it, say so instead of guessing.`,
    welcome: (n, c) => `Hi! I'm ${n}. Ask me anything about ${c}'s docs.`,
    suggestions: ["How do I get started?", "How does authentication work?", "Show me an example"],
    teaser: "Stuck? Ask me anything about the docs.",
  },
  {
    id: "booking", label: "Bookings", emoji: "📅", blurb: "Help visitors pick a service and book a time",
    prompt: `You are {BOT}, the booking assistant for {COMPANY}.
- Help visitors choose the right service and explain what to expect.
- Collect the details needed for a booking (name, email, preferred time).
- Be efficient and confirm details back clearly.`,
    welcome: (n, c) => `Hi! I'm ${n}. I can help you book with ${c}.`,
    suggestions: ["What services do you offer?", "When are you available?", "Book an appointment"],
    teaser: "Want to book a time? I can help.",
  },
  {
    id: "shop", label: "Store assistant", emoji: "🛍️", blurb: "Find products, sizing, shipping and returns",
    prompt: `You are {BOT}, the shopping assistant for {COMPANY}.
- Help shoppers find the right product and answer sizing, shipping and returns questions.
- Suggest relevant products when it helps.
- Keep a warm, upbeat tone.`,
    welcome: (n, c) => `Hi! I'm ${n}, ${c}'s shopping assistant. What are you looking for?`,
    suggestions: ["What's your return policy?", "Help me find a gift", "When will my order arrive?"],
    teaser: "Looking for something? Ask me!",
  },
  {
    id: "custom", label: "Something else", emoji: "✨", blurb: "Write your own instructions",
    prompt: `You are {BOT}, a helpful assistant on {COMPANY}'s website.
Answer visitors' questions clearly and concisely.`,
    welcome: (n) => `Hi! I'm ${n}. How can I help?`,
    suggestions: ["What do you do?", "How can you help me?"],
    teaser: "Hi! Questions? Ask me.",
  },
];

export const getUseCase = (id: UseCase) => USE_CASES.find((u) => u.id === id) ?? USE_CASES[USE_CASES.length - 1];

export function promptFor(useCase: UseCase, botName: string, company: string): string {
  return getUseCase(useCase).prompt.replaceAll("{BOT}", botName || "Assistant").replaceAll("{COMPANY}", company || "our company");
}

/** "https://www.flowbase.io/pricing" → "flowbase.io" */
export function hostOf(url: string): string {
  const raw = url.trim();
  if (!raw) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** "flowbase.io" → "Flowbase" */
export function companyFromHost(host: string): string {
  const base = host.split(".")[0] || "";
  return base ? base[0].toUpperCase() + base.slice(1) : "";
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

/** Fresh Supermemory namespace for a bot, e.g. "c4e-flowbase-k3x9q2". Client-side only. */
export function newNamespace(seed: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `c4e-${slug(seed).slice(0, 30) || "bot"}-${rand}`;
}

export const DEFAULT_MODEL = "openrouter/auto";

export const MODEL_SUGGESTIONS = [
  { id: "openrouter/auto", label: "Auto (OpenRouter picks the best model)" },
  { id: "openai/gpt-4o-mini", label: "OpenAI GPT-4o mini" },
  { id: "anthropic/claude-3.5-haiku", label: "Anthropic Claude Haiku" },
  { id: "google/gemini-2.0-flash-001", label: "Google Gemini Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Meta Llama 3.3 70B" },
];

export const DEFAULT_AI: AISettings = {
  useCase: "sales",
  website: "",
  model: DEFAULT_MODEL,
  systemPrompt: promptFor("sales", "Aria", "Flowbase"),
  temperature: 0.5,
  allowedDomains: [],
  knowledgeNamespace: "",
};

const MODEL_RE = /^[a-z0-9][a-z0-9._:/-]{0,99}$/i;
const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9-]+\.)*[a-z0-9-]+$/i;
const NS_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export function sanitizeAI(input: unknown): AISettings {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_AI;
  const useCase = USE_CASES.some((u) => u.id === o.useCase) ? (o.useCase as UseCase) : d.useCase;
  const temp = typeof o.temperature === "number" && Number.isFinite(o.temperature) ? Math.min(1.5, Math.max(0, o.temperature)) : d.temperature;
  return {
    useCase,
    website: typeof o.website === "string" ? o.website.trim().slice(0, 200) : "",
    model: typeof o.model === "string" && MODEL_RE.test(o.model.trim()) ? o.model.trim() : d.model,
    systemPrompt: typeof o.systemPrompt === "string" ? o.systemPrompt.slice(0, 8000) : d.systemPrompt,
    temperature: Math.round(temp * 100) / 100,
    allowedDomains: Array.isArray(o.allowedDomains)
      ? [...new Set(o.allowedDomains.map((x) => (typeof x === "string" ? hostOf(x) : "")).filter((x) => DOMAIN_RE.test(x)))].slice(0, 20)
      : [],
    knowledgeNamespace: typeof o.knowledgeNamespace === "string" && NS_RE.test(o.knowledgeNamespace) ? o.knowledgeNamespace : "",
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
