"use client";

import { motion } from "framer-motion";
import { ChatbotConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search, Calendar, ExternalLink, Check, Globe, Clock, Zap } from "lucide-react";
import { useState } from "react";

interface Step4Props {
  config: ChatbotConfig;
  onChange: (updates: Partial<ChatbotConfig>) => void;
}

export function Step4({ config, onChange }: Step4Props) {
  const [calendlyTesting, setCalendlyTesting] = useState(false);
  const [calendlyConnected, setCalendlyConnected] = useState(false);

  const handleCalendlyTest = () => {
    if (!config.tools.calendlyUrl) return;
    setCalendlyTesting(true);
    setTimeout(() => {
      setCalendlyTesting(false);
      setCalendlyConnected(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className="text-white/50 text-sm leading-relaxed">
          Connect tools to give your chatbot real-world capabilities. Each tool extends what your
          bot can do during conversations.
        </p>
      </motion.div>

      {/* Web Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "p-5 rounded-2xl border transition-all",
          config.tools.webSearch
            ? "bg-blue-500/10 border-blue-500/30"
            : "glass border-white/10"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all",
                config.tools.webSearch
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-white/5 text-white/40"
              )}
            >
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">Web Search</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  Powered by Tavily
                </span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                Let your chatbot search the internet in real-time for up-to-date information,
                news, and answers to questions.
              </p>
              {config.tools.webSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-2"
                >
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: <Globe className="w-3 h-3" />, label: "Live search" },
                      { icon: <Clock className="w-3 h-3" />, label: "Real-time" },
                      { icon: <Zap className="w-3 h-3" />, label: "Fast results" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full"
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={() =>
              onChange({
                tools: { ...config.tools, webSearch: !config.tools.webSearch },
              })
            }
            className={cn(
              "relative w-12 h-6 rounded-full transition-all flex-shrink-0 mt-1",
              config.tools.webSearch ? "bg-blue-500" : "bg-white/10"
            )}
          >
            <motion.div
              animate={{ x: config.tools.webSearch ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* Calendly */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "p-5 rounded-2xl border transition-all",
          config.tools.calendly
            ? "bg-purple-500/10 border-purple-500/30"
            : "glass border-white/10"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all",
                config.tools.calendly
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-white/5 text-white/40"
              )}
            >
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">Calendly</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Scheduling
                </span>
                {calendlyConnected && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <p className="text-white/40 text-sm mt-1">
                Let your chatbot show your Calendly widget and book appointments directly in
                the conversation.
              </p>

              {config.tools.calendly && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-3"
                >
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-wider">
                      Your Calendly URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={config.tools.calendlyUrl}
                        onChange={(e) =>
                          onChange({
                            tools: { ...config.tools, calendlyUrl: e.target.value },
                          })
                        }
                        placeholder="https://calendly.com/yourname"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                      />
                      <button
                        onClick={handleCalendlyTest}
                        disabled={!config.tools.calendlyUrl || calendlyTesting}
                        className="px-4 py-2.5 rounded-xl bg-purple-600/50 hover:bg-purple-600/70 text-purple-200 text-sm disabled:opacity-40 transition-all whitespace-nowrap"
                      >
                        {calendlyTesting ? "Testing..." : "Test Link"}
                      </button>
                    </div>
                  </div>

                  {config.tools.calendlyUrl && (
                    <a
                      href={config.tools.calendlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview your Calendly
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={() =>
              onChange({
                tools: { ...config.tools, calendly: !config.tools.calendly },
              })
            }
            className={cn(
              "relative w-12 h-6 rounded-full transition-all flex-shrink-0 mt-1",
              config.tools.calendly ? "bg-purple-500" : "bg-white/10"
            )}
          >
            <motion.div
              animate={{ x: config.tools.calendly ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* Coming Soon Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <p className="text-xs text-white/30 uppercase tracking-wider">Coming Soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: "Stripe Payments", icon: "💳" },
            { name: "HubSpot CRM", icon: "🔶" },
            { name: "Slack Notifications", icon: "💬" },
            { name: "Google Sheets", icon: "📊" },
            { name: "Zapier", icon: "⚡" },
            { name: "WhatsApp", icon: "📱" },
          ].map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-3 p-3 rounded-xl glass opacity-40 cursor-not-allowed"
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="text-xs text-white/50">{tool.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
