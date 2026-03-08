"use client";

import { ChatbotConfig } from "@/lib/types";
import { useState } from "react";
import { Send, X, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPreviewProps {
  config: ChatbotConfig;
}

export function ChatPreview({ config }: ChatPreviewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [inputVal, setInputVal] = useState("");

  const messages = [
    { role: "bot" as const, text: config.welcomeMessage || "Hi! How can I help you today?" },
    { role: "user" as const, text: "Hi! I need some help." },
    { role: "bot" as const, text: "Of course! I'm here to assist you. What can I do for you?" },
  ];

  const primaryGradient = `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{
        minHeight: "480px",
        background: "#0a0a14",
        fontFamily: config.fontFamily || "Inter",
      }}
    >
      {/* Fake website background */}
      <div className="absolute inset-0 opacity-20">
        <div className="p-6 space-y-3">
          {[85, 72, 90, 65, 80, 75].map((w, i) => (
            <div key={i} className="h-3 bg-white/10 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Chat Widget */}
      <div className="absolute" style={{ bottom: "16px", right: "16px" }}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="mb-3 flex flex-col shadow-2xl overflow-hidden"
              style={{
                width: "300px",
                height: "420px",
                borderRadius: `${config.borderRadius}px`,
                background: config.bgColor,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ background: primaryGradient }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
                    {config.botAvatar}
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: config.textColor }}
                    >
                      {config.botName || "Assistant"}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                      <span className="text-xs opacity-70" style={{ color: config.textColor }}>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Minimize2 className="w-3.5 h-3.5" style={{ color: config.textColor }} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: config.textColor }} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ color: config.textColor }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-1.5 mt-0.5"
                        style={{ background: primaryGradient }}>
                        {config.botAvatar}
                      </div>
                    )}
                    <div
                      className="max-w-[80%] px-3 py-2 text-xs leading-relaxed"
                      style={{
                        borderRadius: msg.role === "user"
                          ? `${config.borderRadius}px ${Math.min(4, config.borderRadius)}px ${config.borderRadius}px ${config.borderRadius}px`
                          : `${Math.min(4, config.borderRadius)}px ${config.borderRadius}px ${config.borderRadius}px ${config.borderRadius}px`,
                        background: msg.role === "user"
                          ? primaryGradient
                          : "rgba(255,255,255,0.08)",
                        color: config.textColor,
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mr-1.5"
                    style={{ background: primaryGradient }}>
                    {config.botAvatar}
                  </div>
                  <div className="px-3 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="flex gap-1 items-center h-4">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: config.primaryColor }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div
                className="p-3 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <input
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={config.placeholder || "Type a message..."}
                    className="flex-1 bg-transparent text-xs outline-none"
                    style={{ color: config.textColor, opacity: 0.7 }}
                  />
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: primaryGradient }}
                  >
                    <Send className="w-3 h-3" style={{ color: config.textColor }} />
                  </button>
                </div>
                {config.showBranding && (
                  <div className="text-center mt-1.5 text-xs opacity-30" style={{ color: config.textColor }}>
                    Powered by Chatty4Everyone
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bubble Button */}
        <div className="flex justify-end">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-xl"
            style={{ background: primaryGradient, color: config.textColor }}
          >
            {isOpen ? <X className="w-5 h-5" /> : config.botAvatar}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
