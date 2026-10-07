"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code2, Zap, Sparkles, Shield, Globe, Bot, Github } from "lucide-react";

const FEATURES = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Smart AI Builder",
    description: "Writes the instructions for your use case. One OpenRouter key gives you GPT, Claude, Gemini and open-source models.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "One-Line Embed",
    description: "Copy a single script tag and paste it anywhere. Works with any website, CMS, or framework.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "RAG & Memory",
    description: "Add a Supermemory key and your assistant answers from your own website and docs.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "No Backend to Run",
    description: "Paste your API keys and publish. Keys are encrypted server-side and never reach your visitors.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: "Visual UI Designer",
    description: "Design your chatbot's look and feel with a live preview. Choose from templates or customize pixel by pixel.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Open Source",
    description: "MIT licensed. Self-host it, fork it, extend it. Restrict each assistant to your own domains.",
    color: "from-teal-500 to-cyan-500",
  },
];

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen grid-bg text-white overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 -left-20 w-[400px] h-[400px] bg-green-600/8 blur-[100px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
            C4
          </div>
          <span className="font-bold text-lg">Chatty4Everyone</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Kvndoshi/chatfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/60 mb-8 border border-white/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Open source chatbot builder for any website
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6">
            Build & embed chatbots
            <br />
            <span className="gradient-text">in minutes, not months</span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Design, configure, and deploy AI chatbots to any website with a single line of code.
            Open source, fully customizable, no lock-in.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-2xl shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              Build Your Chatbot
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <a
              href="https://github.com/Kvndoshi/chatfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl glass glass-hover text-white/70 hover:text-white font-semibold text-lg transition-all"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </motion.div>

        {/* Code preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 max-w-xl mx-auto"
        >
          <div className="code-block rounded-2xl overflow-hidden text-left">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-2 text-xs text-white/20">index.html</span>
            </div>
            <pre className="p-5 text-sm font-mono leading-relaxed">
              <span className="text-white/30">{"<!-- Paste this before </body> -->"}</span>
              {"\n"}
              <span className="text-green-400">{"<script"}</span>
              {" "}
              <span className="text-yellow-300">src</span>
              <span className="text-white/60">{"=\""}</span>
              <span className="text-blue-300">{"https://your-chatty-host/widget.js"}</span>
              <span className="text-white/60">{"\""}
              {"\n  "}
              </span>
              <span className="text-yellow-300">data-bot</span>
              <span className="text-white/60">{"=\""}</span>
              <span className="text-blue-300">bot_k8x2m1q9</span>
              <span className="text-white/60">{"\""}
              {"\n  "}
              </span>
              <span className="text-yellow-300">async</span>
              <span className="text-green-400">{"\n></script>"}</span>
            </pre>
          </div>
          <p className="text-white/30 text-sm mt-3">
            That&apos;s it. One line → an AI assistant on your website.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "9+", label: "Memory Providers" },
            { value: "9", label: "AI Models" },
            { value: "5", label: "Embed Templates" },
            { value: "1", label: "Line to Embed" },
          ].map(({ value, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold gradient-text">{value}</div>
              <div className="text-white/40 text-sm mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Everything you need to deploy
            <br />
            <span className="gradient-text-pink">production-ready chatbots</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            From AI configuration to UI design to one-click embed generation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl glass glass-hover gradient-border"
            >
              <div
                className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">6 steps</span> to your chatbot
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5 hidden sm:block" />
          <div className="space-y-8">
            {[
              { step: "01", title: "Your website", desc: "Enter your site and name your assistant." },
              { step: "02", title: "What it does", desc: "Pick support, sales, docs, bookings or a store — we write its instructions." },
              { step: "03", title: "Connect your keys", desc: "Paste an OpenRouter key (any model) and, optionally, Supermemory for answers from your pages." },
              { step: "04", title: "Pick a layout", desc: "Floating bubble, support desk, chat bar, ⌘K search, side panel, inline or full page." },
              { step: "05", title: "Design it live", desc: "Drag, resize and restyle the widget right on a preview of your site." },
              { step: "06", title: "Publish & paste", desc: "Copy one script tag — or follow the WordPress, Shopify, Wix or GTM guide." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 sm:pl-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 font-mono font-bold text-purple-400 text-lg">
                  {item.step}
                </div>
                <div className="pt-3">
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                  <p className="text-white/40 text-sm mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to add AI to
            <br />
            <span className="gradient-text">your website?</span>
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Free, open source, and ready in minutes. No account required.
          </p>
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xl shadow-2xl shadow-purple-500/30 hover:from-purple-500 hover:to-blue-500 transition-all"
          >
            Start Building Free
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center text-white/30 text-sm">
        <p>
          Chatty4Everyone — Open Source Chatbot Builder •{" "}
          <a
            href="https://github.com/Kvndoshi/chatfolio"
            className="hover:text-white/60 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>{" "}
          • MIT License
        </p>
      </footer>
    </div>
  );
}
