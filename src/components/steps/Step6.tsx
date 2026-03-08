"use client";

import { motion } from "framer-motion";
import { ChatbotConfig } from "@/lib/types";
import { useState, useEffect } from "react";
import { Copy, Check, Code2, Terminal, Package, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

function highlightCode(line: string): string {
  return line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"]*)":/g, '<span style="color:#79c0ff">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span style="color:#a5d6ff">"$1"</span>')
    .replace(/(src|data-bot-id|defer|allow|loading|style)=/g, '<span style="color:#f8c471">$1</span>=')
    .replace(/(&lt;\/?[\w-]+)/g, '<span style="color:#7ee787">$1</span>')
    .replace(/\b(import|from|export|default|const|return)\b/g, '<span style="color:#ff7b72">$1</span>')
    .replace(/\b(true|false)\b/g, '<span style="color:#79c0ff">$1</span>');
}

interface Step6Props {
  config: ChatbotConfig;
}

type EmbedType = "script" | "react" | "npm" | "iframe";

function generateBotId(config: ChatbotConfig): string {
  const name = config.name.toLowerCase().replace(/\s+/g, "-") || "my-bot";
  return `${name}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateEmbedCode(config: ChatbotConfig, type: EmbedType, botId: string): string {
  const configJson = {
    name: config.botName || config.name,
    model: config.model,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    bgColor: config.bgColor,
    textColor: config.textColor,
    borderRadius: config.borderRadius,
    fontFamily: config.fontFamily,
    botAvatar: config.botAvatar,
    welcomeMessage: config.welcomeMessage,
    placeholder: config.placeholder,
    position: config.position,
    size: config.size,
    template: config.template,
    tools: {
      webSearch: config.tools.webSearch,
      calendly: config.tools.calendly,
      ...(config.tools.calendlyUrl ? { calendlyUrl: config.tools.calendlyUrl } : {}),
    },
    showBranding: config.showBranding,
  };

  if (type === "script") {
    // 1-3 line script tag approach
    const hasCustomConfig =
      config.primaryColor !== "#7c3aed" ||
      config.template !== "bubble" ||
      config.tools.webSearch ||
      config.tools.calendly;

    if (!hasCustomConfig) {
      return `<script src="https://cdn.chatty4everyone.dev/v1/widget.js" data-bot-id="${botId}" defer></script>`;
    }

    return `<script>
  window.__C4E_CONFIG__ = ${JSON.stringify(configJson, null, 2)};
</script>
<script src="https://cdn.chatty4everyone.dev/v1/widget.js" data-bot-id="${botId}" defer></script>`;
  }

  if (type === "iframe") {
    const params = new URLSearchParams({
      botId,
      primaryColor: config.primaryColor,
      template: config.template,
    });
    return `<iframe
  src="https://chatty4everyone.dev/embed/${botId}?${params.toString()}"
  style="position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;z-index:9999"
  allow="clipboard-write"
  loading="lazy"
></iframe>`;
  }

  if (type === "react") {
    return `import { ChatWidget } from '@chatty4everyone/react';

export default function App() {
  return (
    <>
      {/* Your app content */}
      <ChatWidget
        botId="${botId}"
        primaryColor="${config.primaryColor}"
        template="${config.template}"
        position="${config.position}"
        welcomeMessage="${config.welcomeMessage}"
      />
    </>
  );
}`;
  }

  if (type === "npm") {
    return `# Install the package
npm install @chatty4everyone/widget

# Initialize in your JS/TS entry file
import ChatWidget from '@chatty4everyone/widget';

ChatWidget.init({
  botId: "${botId}",
  ...${JSON.stringify(configJson, null, 2).split("\n").slice(1).join("\n  ")}
});`;
  }

  return "";
}

export function Step6({ config }: Step6Props) {
  const [copiedType, setCopiedType] = useState<EmbedType | null>(null);
  const [activeType, setActiveType] = useState<EmbedType>("script");
  const [botId, setBotId] = useState("my-bot-xxxxxx");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBotId(generateBotId(config));
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (type: EmbedType) => {
    const code = generateEmbedCode(config, type, botId);
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const EMBED_TYPES: { id: EmbedType; label: string; icon: React.ReactNode; desc: string; badge?: string }[] = [
    {
      id: "script",
      label: "Script Tag",
      icon: <Globe className="w-4 h-4" />,
      desc: "1-3 lines of HTML. Works with any website.",
      badge: "Easiest",
    },
    {
      id: "react",
      label: "React Component",
      icon: <Code2 className="w-4 h-4" />,
      desc: "Import as a React component.",
    },
    {
      id: "npm",
      label: "NPM Package",
      icon: <Package className="w-4 h-4" />,
      desc: "Full control via JavaScript API.",
    },
    {
      id: "iframe",
      label: "iFrame",
      icon: <Terminal className="w-4 h-4" />,
      desc: "Fully isolated. Maximum compatibility.",
    },
  ];

  const currentCode = generateEmbedCode(config, activeType, botId);
  const lineCount = currentCode.split("\n").length;

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎉</div>
          <div>
            <div className="text-white font-semibold">Your chatbot is ready!</div>
            <div className="text-white/50 text-sm mt-0.5">
              {config.name || "Your bot"} is configured and ready to embed on any website.
            </div>
          </div>
        </div>

        {/* Config summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Model", value: config.model },
            { label: "Memory", value: config.memoryProvider === "none" ? "None" : config.memoryProvider },
            { label: "Tools", value: [config.tools.webSearch && "Search", config.tools.calendly && "Calendly"].filter(Boolean).join(", ") || "None" },
            { label: "Template", value: config.template },
          ].map(({ label, value }) => (
            <div key={label} className="glass rounded-xl p-3">
              <div className="text-xs text-white/40">{label}</div>
              <div className="text-sm text-white font-medium capitalize mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bot ID */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label className="text-xs text-white/50 uppercase tracking-wider">Your Bot ID</label>
        <div className="flex items-center gap-3 p-4 rounded-xl glass">
          <code className="flex-1 text-purple-300 font-mono text-sm">{botId}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(botId); }}
            className="p-2 rounded-lg glass glass-hover text-white/40 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Embed Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <label className="text-xs text-white/50 uppercase tracking-wider">Integration Method</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EMBED_TYPES.map((et) => (
            <button
              key={et.id}
              onClick={() => setActiveType(et.id)}
              className={cn(
                "p-3 rounded-xl text-left transition-all glass glass-hover",
                activeType === et.id
                  ? "ring-2 ring-purple-500/60 bg-white/[0.07]"
                  : "opacity-60 hover:opacity-90"
              )}
            >
              <div className="flex items-center gap-2 text-white">
                {et.icon}
                <span className="text-sm font-medium">{et.label}</span>
                {et.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-500/20 text-green-300">
                    {et.badge}
                  </span>
                )}
              </div>
              <div className="text-xs text-white/30 mt-1.5 leading-tight">{et.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Code Block */}
      <motion.div
        key={activeType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/50 uppercase tracking-wider">
              Embed Code
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </span>
          </div>
          <button
            onClick={() => handleCopy(activeType)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              copiedType === activeType
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-purple-600/50 hover:bg-purple-600/70 text-purple-200"
            )}
          >
            {copiedType === activeType ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Code
              </>
            )}
          </button>
        </div>

          <div className="relative rounded-2xl overflow-hidden code-block">
            {/* Dots */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-2 text-xs text-white/20">{
                activeType === "script" ? "index.html" :
                activeType === "react" ? "App.tsx" :
                activeType === "npm" ? "main.ts" :
                "index.html"
              }</span>
            </div>
            <pre className="p-5 overflow-x-auto text-sm text-white/80 leading-relaxed font-mono">
              {currentCode.split("\n").map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-white/15 select-none w-8 flex-shrink-0 text-right mr-4">
                    {i + 1}
                  </span>
                  {mounted ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: highlightCode(line) }}
                    />
                  ) : (
                    <span>{line}</span>
                  )}
                </div>
              ))}
            </pre>
          </div>
      </motion.div>

      {/* Installation Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5 space-y-4"
      >
        <div className="font-semibold text-white flex items-center gap-2">
          <span className="text-lg">📖</span> Quick Start
        </div>
        <ol className="space-y-3">
          {[
            "Copy the embed code above",
            activeType === "script"
              ? "Paste it before the closing </body> tag in your HTML"
              : activeType === "react"
              ? "Import the component and add it to your root layout"
              : activeType === "npm"
              ? "Run npm install and add the init code to your entry file"
              : "Paste the iframe snippet anywhere in your HTML",
            "Your chatbot will appear on the page automatically",
            "Customize further using our dashboard anytime",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/60">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                {i + 1}
              </div>
              {step}
            </li>
          ))}
        </ol>
      </motion.div>

      {/* Share / Export */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {[
          { label: "Download Config", icon: "⬇️", desc: "Save as JSON" },
          { label: "Share Link", icon: "🔗", desc: "Get shareable URL" },
          { label: "Open Source", icon: "⭐", desc: "Star on GitHub" },
        ].map(({ label, icon, desc }) => (
          <button
            key={label}
            className="flex items-center gap-3 p-4 rounded-2xl glass glass-hover text-left transition-all hover:bg-white/5"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="text-white text-sm font-medium">{label}</div>
              <div className="text-white/30 text-xs">{desc}</div>
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
