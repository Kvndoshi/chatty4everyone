"use client";

import { motion } from "framer-motion";
import { ChatbotConfig, LLMModel, USE_CASE_PROMPTS } from "@/lib/types";
import { Sparkles, RefreshCw, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Step2Props {
  config: ChatbotConfig;
  onChange: (updates: Partial<ChatbotConfig>) => void;
}

const MODELS: { id: LLMModel; label: string; provider: string; badge?: string }[] = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", badge: "Best" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", badge: "Fast" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic", badge: "Smart" },
  { id: "claude-3-haiku", label: "Claude 3 Haiku", provider: "Anthropic", badge: "Fast" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "Google", badge: "Free" },
  { id: "llama-3-70b", label: "Llama 3 70B", provider: "Meta", badge: "OSS" },
  { id: "mistral-large", label: "Mistral Large", provider: "Mistral", badge: "OSS" },
];

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "text-green-400 bg-green-400/10",
  Anthropic: "text-orange-400 bg-orange-400/10",
  Google: "text-blue-400 bg-blue-400/10",
  Meta: "text-purple-400 bg-purple-400/10",
  Mistral: "text-pink-400 bg-pink-400/10",
};

function generatePrompt(config: ChatbotConfig): string {
  const base = USE_CASE_PROMPTS[config.useCase] || USE_CASE_PROMPTS["custom"];
  const name = config.name || "the assistant";
  const description = config.useCaseDescription;

  let prompt = base.replace("{COMPANY_NAME}", name);

  if (description) {
    prompt += `\n\nAdditional context: ${description}`;
  }

  return prompt;
}

export function Step2({ config, onChange }: Step2Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(config.systemPrompt.length);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const prompt = generatePrompt(config);
      onChange({ systemPrompt: prompt });
      setCharCount(prompt.length);
      setIsGenerating(false);
    }, 800);
  };

  const handlePromptChange = (value: string) => {
    onChange({ systemPrompt: value });
    setCharCount(value.length);
  };

  return (
    <div className="space-y-8">
      {/* LLM Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
          Choose AI Model
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {MODELS.map((model, i) => (
            <motion.button
              key={model.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              onClick={() => onChange({ model: model.id })}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                "glass glass-hover",
                config.model === model.id
                  ? "ring-2 ring-purple-500/60 bg-white/[0.08]"
                  : "opacity-60 hover:opacity-90"
              )}
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium flex items-center gap-2">
                  {model.label}
                  {model.badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-normal">
                      {model.badge}
                    </span>
                  )}
                </div>
                <div className={cn("text-xs mt-0.5 px-1.5 py-0.5 rounded-md w-fit", PROVIDER_COLORS[model.provider])}>
                  {model.provider}
                </div>
              </div>
              {config.model === model.id && (
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* API Key */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
          API Key
        </label>
        <div className="relative">
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => onChange({ apiKey: e.target.value })}
            placeholder="sk-... or your provider's API key"
            className="w-full px-5 py-4 rounded-2xl glass text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all pr-12"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Info className="w-4 h-4 text-white/30" />
          </div>
        </div>
        <p className="text-xs text-white/30">
          Your API key is stored locally and never sent to our servers. It&apos;s embedded in your generated code.
        </p>
      </motion.div>

      {/* System Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
            System Prompt
          </label>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-sm text-purple-300 hover:text-purple-200 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? "Generating..." : "Auto-generate"}
          </button>
        </div>

        <div className="relative">
          <textarea
            value={config.systemPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Click 'Auto-generate' to create a prompt based on your use case, or write your own..."
            rows={12}
            className="w-full px-5 py-4 rounded-2xl glass text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
          />
          <div className="absolute bottom-3 right-4 text-xs text-white/20">
            {charCount} chars
          </div>
        </div>

        <div className="glass rounded-xl p-4 flex gap-3">
          <div className="text-yellow-400 text-lg">💡</div>
          <div className="text-xs text-white/50 leading-relaxed">
            The system prompt defines your chatbot&apos;s personality, knowledge scope, and behavior rules.
            Be specific about what it should and shouldn&apos;t do. The more detailed, the better.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
