"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatbotConfig,
  DEFAULT_CONFIG,
  MemoryProvider,
  LLMModel,
  UseCase,
  ChatTemplate,
  USE_CASE_PROMPTS,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChatPreview } from "@/components/ChatPreview";
import {
  Sparkles, RefreshCw, Search, Calendar, Check, Copy,
  Globe, Plus, X, Loader2, CheckCircle2, Code2, ChevronDown,
  Eye, EyeOff, Headphones, TrendingUp, HelpCircle, ShoppingBag,
  User, Users, GraduationCap, Wrench,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const USE_CASES: { id: UseCase; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "customer-support",   label: "Support",   icon: <Headphones className="w-4 h-4" />,    color: "from-blue-500 to-cyan-500" },
  { id: "lead-generation",    label: "Leads",     icon: <TrendingUp className="w-4 h-4" />,    color: "from-green-500 to-emerald-500" },
  { id: "faq-bot",            label: "FAQ",       icon: <HelpCircle className="w-4 h-4" />,    color: "from-yellow-500 to-orange-500" },
  { id: "appointment-booking",label: "Booking",   icon: <Calendar className="w-4 h-4" />,      color: "from-purple-500 to-violet-500" },
  { id: "e-commerce",         label: "E-Commerce",icon: <ShoppingBag className="w-4 h-4" />,   color: "from-pink-500 to-rose-500" },
  { id: "personal-assistant", label: "Assistant", icon: <User className="w-4 h-4" />,          color: "from-indigo-500 to-blue-500" },
  { id: "hr-onboarding",      label: "HR",        icon: <Users className="w-4 h-4" />,         color: "from-teal-500 to-cyan-500" },
  { id: "education",          label: "Education", icon: <GraduationCap className="w-4 h-4" />, color: "from-amber-500 to-yellow-500" },
  { id: "custom",             label: "Custom",    icon: <Wrench className="w-4 h-4" />,        color: "from-gray-500 to-slate-500" },
];

const MODELS: { id: LLMModel; label: string; provider: string; badge?: string; color: string }[] = [
  { id: "gpt-4o",            label: "GPT-4o",            provider: "OpenAI",    badge: "Best",  color: "text-green-400" },
  { id: "gpt-4o-mini",       label: "GPT-4o Mini",       provider: "OpenAI",    badge: "Fast",  color: "text-green-400" },
  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic", badge: "Smart", color: "text-orange-400" },
  { id: "claude-3-haiku",    label: "Claude 3 Haiku",    provider: "Anthropic", badge: "Fast",  color: "text-orange-400" },
  { id: "gemini-1.5-pro",    label: "Gemini 1.5 Pro",    provider: "Google",                    color: "text-blue-400" },
  { id: "gemini-1.5-flash",  label: "Gemini 1.5 Flash",  provider: "Google",    badge: "Free",  color: "text-blue-400" },
  { id: "llama-3-70b",       label: "Llama 3 70B",       provider: "Meta",      badge: "OSS",   color: "text-purple-400" },
  { id: "mistral-large",     label: "Mistral Large",     provider: "Mistral",   badge: "OSS",   color: "text-pink-400" },
];

const MEMORY_PROVIDERS: { id: MemoryProvider; label: string; logo: string; color: string }[] = [
  { id: "none",     label: "No Memory", logo: "🚫", color: "from-gray-600 to-gray-700" },
  { id: "pinecone", label: "Pinecone",  logo: "🌲", color: "from-green-600 to-teal-600" },
  { id: "weaviate", label: "Weaviate",  logo: "⚡", color: "from-purple-600 to-violet-600" },
  { id: "chroma",   label: "ChromaDB",  logo: "🎨", color: "from-orange-600 to-amber-600" },
  { id: "qdrant",   label: "Qdrant",    logo: "🔷", color: "from-pink-600 to-rose-600" },
  { id: "supabase", label: "Supabase",  logo: "🦸", color: "from-emerald-600 to-green-600" },
  { id: "redis",    label: "Redis",     logo: "🔴", color: "from-red-600 to-orange-600" },
];

const TEMPLATES: { id: ChatTemplate; label: string; icon: string }[] = [
  { id: "bubble",   label: "Bubble",    icon: "💬" },
  { id: "fullpage", label: "Full Page", icon: "🖥️" },
  { id: "sidebar",  label: "Sidebar",   icon: "📋" },
  { id: "inline",   label: "Inline",    icon: "📌" },
  { id: "minimal",  label: "Minimal",   icon: "➡️" },
];

const PALETTES = [
  { name: "Violet",   primary: "#7c3aed", secondary: "#2563eb", bg: "#0f0a1e", text: "#ffffff" },
  { name: "Ocean",    primary: "#0891b2", secondary: "#0284c7", bg: "#0a1628", text: "#ffffff" },
  { name: "Emerald",  primary: "#059669", secondary: "#0d9488", bg: "#051a13", text: "#ffffff" },
  { name: "Rose",     primary: "#e11d48", secondary: "#db2777", bg: "#1a0510", text: "#ffffff" },
  { name: "Sunset",   primary: "#ea580c", secondary: "#d97706", bg: "#1a0a00", text: "#ffffff" },
  { name: "Light",    primary: "#6366f1", secondary: "#8b5cf6", bg: "#ffffff",  text: "#1a1a2e" },
  { name: "Midnight", primary: "#3b82f6", secondary: "#1d4ed8", bg: "#0a0f1e", text: "#ffffff" },
  { name: "Forest",   primary: "#16a34a", secondary: "#15803d", bg: "#061008", text: "#ffffff" },
];

const AVATARS = ["🤖", "💫", "🧠", "✨", "🎯", "🦊", "🦉", "🌟", "💡", "🚀", "👾", "🎭"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generatePrompt(config: ChatbotConfig) {
  return (USE_CASE_PROMPTS[config.useCase] ?? USE_CASE_PROMPTS["custom"])
    .replace("{COMPANY_NAME}", config.name || "the assistant");
}

function makeBotId(name: string) {
  const slug = (name || "my-bot").toLowerCase().replace(/\s+/g, "-");
  return `${slug}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** 2-row horizontal scroll grid */
function ScrollRow({ children, colWidth = "140px" }: { children: React.ReactNode; colWidth?: string }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <div
        className="grid grid-rows-2 grid-flow-col gap-2 w-max"
        style={{ gridAutoColumns: colWidth }}
      >
        {children}
      </div>
    </div>
  );
}

/** Section card */
function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** Animated toggle switch */
function Toggle({ on, onToggle, color = "bg-purple-500" }: { on: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      className={cn("relative w-11 h-6 rounded-full transition-all flex-shrink-0", on ? color : "bg-white/10")}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatbotWizard() {
  const [config, setConfig] = useState<ChatbotConfig>({ ...DEFAULT_CONFIG });
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [crawls, setCrawls] = useState<{ url: string; status: "crawling" | "done"; pages?: number }[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [codeTab, setCodeTab] = useState<"script" | "react" | "npm" | "iframe">("script");
  const [copied, setCopied] = useState(false);
  const [botId] = useState(() => makeBotId("my-bot"));
  const codeRef = useRef<HTMLDivElement>(null);

  const updateConfig = (updates: Partial<ChatbotConfig>) =>
    setConfig((p) => ({ ...p, ...updates }));

  const handleGeneratePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      updateConfig({ systemPrompt: generatePrompt(config) });
      setIsGenerating(false);
      setPromptExpanded(true);
    }, 700);
  };

  const addCrawlUrl = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    if (crawls.find((c) => c.url === url)) return;
    setCrawls((p) => [...p, { url, status: "crawling" }]);
    updateConfig({ ragUrls: [...config.ragUrls, url] });
    setUrlInput("");
    setTimeout(() => {
      setCrawls((p) =>
        p.map((c) => c.url === url ? { ...c, status: "done", pages: Math.floor(Math.random() * 60) + 5 } : c)
      );
    }, 1500 + Math.random() * 1500);
  };

  const removeCrawlUrl = (url: string) => {
    setCrawls((p) => p.filter((c) => c.url !== url));
    updateConfig({ ragUrls: config.ragUrls.filter((u) => u !== url) });
  };

  const embedCode = (() => {
    if (codeTab === "script")
      return `<script\n  src="https://cdn.chatty4everyone.dev/v1/widget.js"\n  data-bot-id="${botId}"\n  defer\n></script>`;
    if (codeTab === "react")
      return `import { ChatWidget } from '@chatty4everyone/react';\n\n<ChatWidget\n  botId="${botId}"\n  primaryColor="${config.primaryColor}"\n  template="${config.template}"\n  position="${config.position}"\n/>`;
    if (codeTab === "npm")
      return `npm install @chatty4everyone/widget\n\nimport ChatWidget from '@chatty4everyone/widget';\nChatWidget.init({\n  botId: "${botId}",\n  primaryColor: "${config.primaryColor}",\n  template: "${config.template}",\n});`;
    return `<iframe\n  src="https://chatty4everyone.dev/embed/${botId}"\n  style="position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;z-index:9999"\n  loading="lazy"\n></iframe>`;
  })();

  const handleGetCode = () => {
    setShowCode(true);
    setTimeout(() => codeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full" />
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
              C4
            </div>
            <span className="font-semibold text-white">Chatty4Everyone</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetCode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20"
          >
            <Code2 className="w-4 h-4" />
            Get Code
          </motion.button>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">

            {/* ── Form ── */}
            <div className="space-y-4">

              {/* 1. Identity */}
              <Section emoji="👤" title="Identity">
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Name your chatbot..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl glass text-white text-base placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
                <div>
                  <p className="text-xs text-white/40 mb-2">What's it for?</p>
                  <ScrollRow colWidth="128px">
                    {USE_CASES.map((uc) => (
                      <button
                        key={uc.id}
                        onClick={() => updateConfig({ useCase: uc.id })}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all glass text-xs font-medium",
                          config.useCase === uc.id
                            ? "ring-2 ring-purple-500/60 bg-white/[0.08] text-white"
                            : "text-white/50 hover:text-white/80"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-lg bg-gradient-to-br text-white flex-shrink-0", uc.color)}>
                          {uc.icon}
                        </div>
                        {uc.label}
                      </button>
                    ))}
                  </ScrollRow>
                </div>
              </Section>

              {/* 2. AI Model */}
              <Section emoji="🧠" title="AI Model">
                <div>
                  <p className="text-xs text-white/40 mb-2">Model</p>
                  <ScrollRow colWidth="158px">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => updateConfig({ model: m.id })}
                        className={cn(
                          "flex flex-col gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all glass",
                          config.model === m.id
                            ? "ring-2 ring-purple-500/60 bg-white/[0.08]"
                            : "opacity-60 hover:opacity-90"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-xs font-medium truncate">{m.label}</span>
                          {m.badge && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 flex-shrink-0 leading-none">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <span className={cn("text-[11px]", m.color)}>{m.provider}</span>
                      </button>
                    ))}
                  </ScrollRow>
                </div>

                {/* API Key */}
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    placeholder="API Key  (sk-...)"
                    className="w-full px-4 py-3 pr-10 rounded-xl glass text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <button
                    onClick={() => setShowApiKey((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* System Prompt — expands on focus */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">System prompt</p>
                    <button
                      onClick={handleGeneratePrompt}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 transition-colors disabled:opacity-50"
                    >
                      {isGenerating
                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                        : <Sparkles className="w-3 h-3" />}
                      Auto-generate
                    </button>
                  </div>
                  <textarea
                    value={config.systemPrompt}
                    onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                    onFocus={() => setPromptExpanded(true)}
                    onBlur={() => { if (!config.systemPrompt.trim()) setPromptExpanded(false); }}
                    placeholder="Click Auto-generate or describe how your bot should behave..."
                    className="w-full px-4 py-3 rounded-xl glass text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono leading-relaxed"
                    style={{
                      height: promptExpanded || config.systemPrompt ? "216px" : "84px",
                      transition: "height 0.3s ease-in-out",
                    }}
                  />
                </div>
              </Section>

              {/* 3. Memory */}
              <Section emoji="💾" title="Memory">
                <div>
                  <p className="text-xs text-white/40 mb-2">Vector store</p>
                  <ScrollRow colWidth="122px">
                    {MEMORY_PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => updateConfig({ memoryProvider: p.id, memoryConnected: false })}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all glass",
                          config.memoryProvider === p.id
                            ? "ring-2 ring-purple-500/60 bg-white/[0.08]"
                            : "opacity-60 hover:opacity-90"
                        )}
                      >
                        <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm flex-shrink-0", p.color)}>
                          {p.logo}
                        </div>
                        <span className="text-xs text-white font-medium truncate">{p.label}</span>
                      </button>
                    ))}
                  </ScrollRow>
                </div>

                <AnimatePresence>
                  {config.memoryProvider !== "none" && (
                    <motion.div
                      key="crawler"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-white/40">Knowledge sources — paste a URL to crawl</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCrawlUrl()}
                            placeholder="https://docs.yoursite.com"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                        <button
                          onClick={addCrawlUrl}
                          disabled={!urlInput.trim()}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium disabled:opacity-40 hover:from-blue-500 hover:to-cyan-500 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {crawls.length > 0 && (
                        <div className="space-y-1.5">
                          {crawls.map((item) => (
                            <div
                              key={item.url}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs",
                                item.status === "done"
                                  ? "bg-green-500/5 border border-green-500/15"
                                  : "glass"
                              )}
                            >
                              {item.status === "crawling"
                                ? <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" />
                                : <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                              <span className="text-white/60 font-mono truncate flex-1">{item.url}</span>
                              {item.status === "done" && (
                                <span className="text-green-400 flex-shrink-0">{item.pages}p</span>
                              )}
                              <button
                                onClick={() => removeCrawlUrl(item.url)}
                                className="text-white/20 hover:text-white/60 flex-shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Section>

              {/* 4. Tools */}
              <Section emoji="🔧" title="Tools">
                {/* Web Search */}
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  config.tools.webSearch ? "bg-blue-500/8 border-blue-500/25" : "glass border-white/5"
                )}>
                  <div className="flex items-center gap-3">
                    <Search className={cn("w-4 h-4", config.tools.webSearch ? "text-blue-400" : "text-white/30")} />
                    <div>
                      <div className="text-white text-sm font-medium">Web Search</div>
                      <div className="text-white/40 text-xs">Real-time internet access via Tavily</div>
                    </div>
                  </div>
                  <Toggle
                    on={config.tools.webSearch}
                    onToggle={() => updateConfig({ tools: { ...config.tools, webSearch: !config.tools.webSearch } })}
                    color="bg-blue-500"
                  />
                </div>

                {/* Calendly */}
                <div className={cn(
                  "rounded-xl border transition-all overflow-hidden",
                  config.tools.calendly ? "bg-purple-500/8 border-purple-500/25" : "glass border-white/5"
                )}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className={cn("w-4 h-4", config.tools.calendly ? "text-purple-400" : "text-white/30")} />
                      <div>
                        <div className="text-white text-sm font-medium">Calendly</div>
                        <div className="text-white/40 text-xs">In-chat appointment booking</div>
                      </div>
                    </div>
                    <Toggle
                      on={config.tools.calendly}
                      onToggle={() => updateConfig({ tools: { ...config.tools, calendly: !config.tools.calendly } })}
                    />
                  </div>
                  <AnimatePresence>
                    {config.tools.calendly && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                        className="px-4 pb-4"
                      >
                        <input
                          type="url"
                          value={config.tools.calendlyUrl}
                          onChange={(e) => updateConfig({ tools: { ...config.tools, calendlyUrl: e.target.value } })}
                          placeholder="https://calendly.com/yourname"
                          className="w-full px-3 py-2.5 rounded-xl glass text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>

              {/* 5. Design */}
              <Section emoji="🎨" title="Design">
                {/* Color palettes */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Color palette</p>
                  <div className="flex flex-wrap gap-2">
                    {PALETTES.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => updateConfig({ primaryColor: p.primary, secondaryColor: p.secondary, bgColor: p.bg, textColor: p.text })}
                        title={p.name}
                        className={cn(
                          "w-9 h-9 rounded-xl border-2 transition-all hover:scale-110",
                          config.primaryColor === p.primary ? "border-white/60 scale-110" : "border-transparent"
                        )}
                        style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Template */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Template</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateConfig({ template: t.id })}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all glass",
                          config.template === t.id
                            ? "ring-2 ring-purple-500/60 text-white bg-white/[0.08]"
                            : "text-white/50 hover:text-white/80"
                        )}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <p className="text-xs text-white/40 mb-2">Avatar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => updateConfig({ botAvatar: a })}
                        className={cn(
                          "w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all glass",
                          config.botAvatar === a ? "ring-2 ring-purple-500/60 bg-white/10 scale-110" : "hover:bg-white/5"
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/40">Display name</p>
                    <input
                      type="text"
                      value={config.botName}
                      onChange={(e) => updateConfig({ botName: e.target.value })}
                      placeholder="Assistant"
                      className="w-full px-3 py-2.5 rounded-xl glass text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-white/40">Position</p>
                    <select
                      value={config.position}
                      onChange={(e) => updateConfig({ position: e.target.value as typeof config.position })}
                      className="w-full px-3 py-2.5 rounded-xl glass text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-transparent cursor-pointer"
                    >
                      <option value="bottom-right" className="bg-[#0a0a0f]">Bottom Right</option>
                      <option value="bottom-left"  className="bg-[#0a0a0f]">Bottom Left</option>
                      <option value="top-right"    className="bg-[#0a0a0f]">Top Right</option>
                      <option value="top-left"     className="bg-[#0a0a0f]">Top Left</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-white/40">Welcome message</p>
                  <input
                    type="text"
                    value={config.welcomeMessage}
                    onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                    placeholder="Hi! How can I help you today?"
                    className="w-full px-3 py-2.5 rounded-xl glass text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </Section>

              {/* 6. Deploy */}
              <div ref={codeRef} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowCode((s) => !s)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🚀</span>
                    <span className="text-white font-semibold text-sm">Get your embed code</span>
                    {config.name && <span className="text-xs text-white/30">· {config.name}</span>}
                  </div>
                  <ChevronDown
                    className={cn("w-4 h-4 text-white/40 transition-transform duration-300", showCode && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {showCode && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-5 pb-5 pt-4 space-y-4 border-t border-white/5">
                        {/* Format tabs */}
                        <div className="flex gap-1 p-1 rounded-xl glass w-fit">
                          {(["script", "react", "npm", "iframe"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setCodeTab(tab)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                codeTab === tab ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                              )}
                            >
                              {tab === "script" ? "Script" : tab === "react" ? "React" : tab === "npm" ? "NPM" : "iFrame"}
                            </button>
                          ))}
                        </div>

                        {/* Code block */}
                        <div className="relative rounded-xl code-block overflow-hidden">
                          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
                            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                            ))}
                            <span className="ml-2 text-xs text-white/20">
                              {codeTab === "react" ? "App.tsx" : codeTab === "npm" ? "main.ts" : "index.html"}
                            </span>
                          </div>
                          <pre className="p-4 text-xs text-white/70 font-mono leading-relaxed overflow-x-auto whitespace-pre">
                            {embedCode}
                          </pre>
                        </div>

                        <button
                          onClick={handleCopy}
                          className={cn(
                            "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all",
                            copied
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20"
                          )}
                        >
                          {copied
                            ? <><Check className="w-4 h-4" /> Copied!</>
                            : <><Copy className="w-4 h-4" /> Copy Code</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* ── Sticky live preview (desktop only) ── */}
            <div className="hidden lg:block sticky top-[72px]">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Live Preview</p>
              <div className="rounded-2xl overflow-hidden glass border border-white/10" style={{ height: "520px" }}>
                <ChatPreview config={config} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
