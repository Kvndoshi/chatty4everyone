"use client";

import { motion } from "framer-motion";
import { ChatbotConfig, ChatTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChatPreview } from "@/components/ChatPreview";

interface Step5Props {
  config: ChatbotConfig;
  onChange: (updates: Partial<ChatbotConfig>) => void;
}

const TEMPLATES: { id: ChatTemplate; label: string; description: string; icon: string }[] = [
  { id: "bubble", label: "Bubble Widget", description: "Floating chat button in the corner", icon: "💬" },
  { id: "fullpage", label: "Full Page", description: "Takes up the entire viewport", icon: "🖥️" },
  { id: "sidebar", label: "Sidebar", description: "Slides in from the side", icon: "📋" },
  { id: "inline", label: "Inline Embed", description: "Embedded inside your page", icon: "📌" },
  { id: "minimal", label: "Minimal Bar", description: "Compact input bar at bottom", icon: "➡️" },
];

const SIZE_OPTIONS = [
  { id: "small", label: "Small", desc: "320×480", w: 320, h: 480 },
  { id: "medium", label: "Medium", desc: "380×580", w: 380, h: 580 },
  { id: "large", label: "Large", desc: "440×680", w: 440, h: 680 },
  { id: "fullscreen", label: "Full Screen", desc: "100%", w: 0, h: 0 },
] as const;

const POSITION_OPTIONS = [
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "top-right", label: "Top Right" },
  { id: "top-left", label: "Top Left" },
] as const;

const FONT_OPTIONS = ["Inter", "Roboto", "Poppins", "Montserrat", "Open Sans", "System UI"];

const PRESET_PALETTES = [
  { name: "Violet Night", primary: "#7c3aed", secondary: "#2563eb", bg: "#0f0a1e", text: "#ffffff" },
  { name: "Ocean Breeze", primary: "#0891b2", secondary: "#0284c7", bg: "#0a1628", text: "#ffffff" },
  { name: "Emerald", primary: "#059669", secondary: "#0d9488", bg: "#051a13", text: "#ffffff" },
  { name: "Rose Gold", primary: "#e11d48", secondary: "#db2777", bg: "#1a0510", text: "#ffffff" },
  { name: "Sunset", primary: "#ea580c", secondary: "#d97706", bg: "#1a0a00", text: "#ffffff" },
  { name: "Clean White", primary: "#6366f1", secondary: "#8b5cf6", bg: "#ffffff", text: "#1a1a2e" },
  { name: "Midnight Blue", primary: "#3b82f6", secondary: "#1d4ed8", bg: "#0a0f1e", text: "#ffffff" },
  { name: "Forest", primary: "#16a34a", secondary: "#15803d", bg: "#061008", text: "#ffffff" },
];

const AVATAR_OPTIONS = ["🤖", "💫", "🧠", "✨", "🎯", "🦊", "🦉", "🌟", "💡", "🚀", "👾", "🎭"];

export function Step5({ config, onChange }: Step5Props) {
  const [activeTab, setActiveTab] = useState<"template" | "style" | "content" | "behavior">("template");

  const tabs = [
    { id: "template", label: "Template" },
    { id: "style", label: "Style" },
    { id: "content", label: "Content" },
    { id: "behavior", label: "Behavior" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl glass w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Template Tab */}
          {activeTab === "template" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onChange({ template: t.id })}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl text-left transition-all",
                      "glass glass-hover",
                      config.template === t.id
                        ? "ring-2 ring-purple-500/60 bg-white/[0.07]"
                        : "opacity-60 hover:opacity-90"
                    )}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{t.label}</div>
                      <div className="text-white/40 text-xs">{t.description}</div>
                    </div>
                    {config.template === t.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onChange({ size: s.id })}
                      className={cn(
                        "p-2 rounded-xl text-center transition-all glass",
                        config.size === s.id
                          ? "ring-2 ring-purple-500/60 bg-white/[0.07] text-white"
                          : "text-white/40 hover:text-white/70"
                      )}
                    >
                      <div className="text-xs font-medium">{s.label}</div>
                      <div className="text-xs text-white/30 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {POSITION_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onChange({ position: p.id })}
                      className={cn(
                        "p-2.5 rounded-xl text-sm text-center transition-all glass",
                        config.position === p.id
                          ? "ring-2 ring-purple-500/60 bg-white/[0.07] text-white"
                          : "text-white/40 hover:text-white/70"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Style Tab */}
          {activeTab === "style" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Color Palettes */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Color Palettes</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      onClick={() =>
                        onChange({
                          primaryColor: palette.primary,
                          secondaryColor: palette.secondary,
                          bgColor: palette.bg,
                          textColor: palette.text,
                        })
                      }
                      title={palette.name}
                      className={cn(
                        "h-10 rounded-xl overflow-hidden border-2 transition-all",
                        config.primaryColor === palette.primary
                          ? "border-white/40 scale-105"
                          : "border-transparent hover:border-white/20"
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Primary Color", key: "primaryColor" as keyof ChatbotConfig },
                  { label: "Secondary Color", key: "secondaryColor" as keyof ChatbotConfig },
                  { label: "Background", key: "bgColor" as keyof ChatbotConfig },
                  { label: "Text Color", key: "textColor" as keyof ChatbotConfig },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs text-white/40">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config[key] as string}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={config[key] as string}
                        onChange={(e) => onChange({ [key]: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl glass text-white text-xs placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs text-white/50 uppercase tracking-wider">Border Radius</label>
                  <span className="text-xs text-white/40">{config.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={config.borderRadius}
                  onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Font */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Font Family</label>
                <div className="flex flex-wrap gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      onClick={() => onChange({ fontFamily: font })}
                      style={{ fontFamily: font }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all glass",
                        config.fontFamily === font
                          ? "ring-2 ring-purple-500/60 text-white bg-white/[0.07]"
                          : "text-white/40 hover:text-white/70"
                      )}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Avatar */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Bot Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => onChange({ botAvatar: avatar })}
                      className={cn(
                        "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all glass",
                        config.botAvatar === avatar
                          ? "ring-2 ring-purple-500/60 bg-white/10 scale-110"
                          : "hover:bg-white/5"
                      )}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot Name */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Bot Display Name</label>
                <input
                  type="text"
                  value={config.botName}
                  onChange={(e) => onChange({ botName: e.target.value })}
                  placeholder="Assistant"
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
              </div>

              {/* Welcome Message */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Welcome Message</label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => onChange({ welcomeMessage: e.target.value })}
                  rows={3}
                  placeholder="Hi! How can I help you today?"
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm resize-none"
                />
              </div>

              {/* Input Placeholder */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">Input Placeholder</label>
                <input
                  type="text"
                  value={config.placeholder}
                  onChange={(e) => onChange({ placeholder: e.target.value })}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
              </div>
            </motion.div>
          )}

          {/* Behavior Tab */}
          {activeTab === "behavior" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {[
                {
                  label: "Show Branding",
                  desc: `Show "Powered by Chatty4Everyone"`,
                  key: "showBranding",
                  value: config.showBranding,
                },
              ].map(({ label, desc, key, value }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl glass">
                  <div>
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-white/40 text-xs mt-0.5">{desc}</div>
                  </div>
                  <button
                    onClick={() => onChange({ [key]: !value })}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-all",
                      value ? "bg-purple-500" : "bg-white/10"
                    )}
                  >
                    <motion.div
                      animate={{ x: value ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="sticky top-6">
          <div className="space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider">Live Preview</p>
            <div className="rounded-2xl overflow-hidden glass border border-white/10 relative" style={{ minHeight: "480px" }}>
              <ChatPreview config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
