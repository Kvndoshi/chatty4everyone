"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChatbotConfig, MemoryProvider } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Check,
  ExternalLink,
  Database,
  Zap,
  Globe,
  Plus,
  X,
  Loader2,
  Link2,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

interface Step3Props {
  config: ChatbotConfig;
  onChange: (updates: Partial<ChatbotConfig>) => void;
}

const MEMORY_PROVIDERS: {
  id: MemoryProvider;
  label: string;
  description: string;
  logo: string;
  color: string;
  docsUrl: string;
  tags: string[];
}[] = [
  {
    id: "none",
    label: "No Memory",
    description: "Stateless chatbot. Each conversation starts fresh.",
    logo: "🚫",
    color: "from-gray-600 to-gray-700",
    docsUrl: "#",
    tags: ["simple", "stateless"],
  },
  {
    id: "pinecone",
    label: "Pinecone",
    description: "The leading vector database for AI. Serverless & scalable.",
    logo: "🌲",
    color: "from-green-600 to-teal-600",
    docsUrl: "https://docs.pinecone.io",
    tags: ["vector", "serverless", "popular"],
  },
  {
    id: "weaviate",
    label: "Weaviate",
    description: "Open-source vector database with hybrid search.",
    logo: "⚡",
    color: "from-purple-600 to-violet-600",
    docsUrl: "https://weaviate.io/developers/weaviate",
    tags: ["vector", "open-source", "hybrid"],
  },
  {
    id: "chroma",
    label: "ChromaDB",
    description: "The AI-native open-source embedding database.",
    logo: "🎨",
    color: "from-orange-600 to-amber-600",
    docsUrl: "https://docs.trychroma.com",
    tags: ["vector", "open-source", "local"],
  },
  {
    id: "qdrant",
    label: "Qdrant",
    description: "High-performance vector search engine with filtering.",
    logo: "🔷",
    color: "from-pink-600 to-rose-600",
    docsUrl: "https://qdrant.tech/documentation",
    tags: ["vector", "fast", "filtering"],
  },
  {
    id: "supabase",
    label: "Supabase pgvector",
    description: "PostgreSQL with pgvector. Full-stack + vector storage.",
    logo: "🦸",
    color: "from-emerald-600 to-green-600",
    docsUrl: "https://supabase.com/docs/guides/ai",
    tags: ["postgres", "full-stack", "RAG"],
  },
  {
    id: "redis",
    label: "Redis Vector",
    description: "In-memory vector search. Ultra-fast retrieval.",
    logo: "🔴",
    color: "from-red-600 to-orange-600",
    docsUrl: "https://redis.io/docs/stack/search/reference/vectors",
    tags: ["in-memory", "fast", "caching"],
  },
];

const CONNECTION_FIELDS: Record<
  MemoryProvider,
  { label: string; placeholder: string; type?: string }[]
> = {
  none: [],
  pinecone: [
    { label: "API Key", placeholder: "pcsk_...", type: "password" },
    { label: "Index Name", placeholder: "my-chatbot-index" },
    { label: "Environment", placeholder: "us-east-1-aws" },
  ],
  weaviate: [
    { label: "Cluster URL", placeholder: "https://your-cluster.weaviate.network" },
    { label: "API Key", placeholder: "weaviate-api-key", type: "password" },
  ],
  chroma: [
    { label: "Host", placeholder: "localhost" },
    { label: "Port", placeholder: "8000" },
    { label: "Collection Name", placeholder: "chatbot-memory" },
  ],
  qdrant: [
    { label: "URL", placeholder: "https://your-cluster.qdrant.io" },
    { label: "API Key", placeholder: "qdrant-api-key", type: "password" },
    { label: "Collection", placeholder: "chatbot-collection" },
  ],
  supabase: [
    { label: "Supabase URL", placeholder: "https://xxx.supabase.co" },
    { label: "Service Key", placeholder: "eyJ...", type: "password" },
    { label: "Table Name", placeholder: "documents" },
  ],
  redis: [
    { label: "Redis URL", placeholder: "redis://localhost:6379" },
    { label: "Password", placeholder: "your-redis-password", type: "password" },
  ],
};

type CrawlDepth = "single" | "section" | "full";

interface CrawledUrl {
  url: string;
  status: "crawling" | "done" | "error";
  pages?: number;
  error?: string;
}

export function Step3({ config, onChange }: Step3Props) {
  const fields = CONNECTION_FIELDS[config.memoryProvider];

  // URL Crawler state
  const [urlInput, setUrlInput] = useState("");
  const [crawledUrls, setCrawledUrls] = useState<CrawledUrl[]>([]);
  const [showCrawler, setShowCrawler] = useState(true);
  const [crawlDepth, setCrawlDepth] = useState<CrawlDepth>("full");

  const addUrl = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    if (crawledUrls.find((u) => u.url === url)) return;

    const newEntry: CrawledUrl = { url, status: "crawling" };
    setCrawledUrls((prev) => [...prev, newEntry]);
    onChange({ ragUrls: [...config.ragUrls, url] });
    setUrlInput("");

    // Simulate crawl with realistic page counts
    const pages =
      crawlDepth === "single"
        ? 1
        : crawlDepth === "section"
        ? Math.floor(Math.random() * 20) + 5
        : Math.floor(Math.random() * 80) + 20;

    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      setCrawledUrls((prev) =>
        prev.map((u) => (u.url === url ? { ...u, status: "done", pages } : u))
      );
    }, delay);
  };

  const removeUrl = (url: string) => {
    setCrawledUrls((prev) => prev.filter((u) => u.url !== url));
    onChange({ ragUrls: config.ragUrls.filter((u) => u !== url) });
  };

  const totalPages = crawledUrls
    .filter((u) => u.status === "done")
    .reduce((acc, u) => acc + (u.pages || 0), 0);

  return (
    <div className="space-y-8">
      {/* Provider Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-purple-400" />
          <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
            Memory & RAG Provider
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MEMORY_PROVIDERS.map((provider, i) => (
            <motion.button
              key={provider.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() =>
                onChange({ memoryProvider: provider.id, memoryConnected: false })
              }
              className={cn(
                "relative p-4 rounded-2xl text-left transition-all duration-200",
                "glass glass-hover",
                config.memoryProvider === provider.id
                  ? "ring-2 ring-purple-500/60 bg-white/[0.07]"
                  : "opacity-60 hover:opacity-90"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-xl flex-shrink-0`}
                >
                  {provider.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white font-semibold text-sm">
                      {provider.label}
                    </span>
                    {config.memoryProvider === provider.id &&
                      config.memoryConnected && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          Connected
                        </div>
                      )}
                  </div>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">
                    {provider.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Connection Fields */}
      {config.memoryProvider !== "none" && fields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/70 uppercase tracking-wider">
                Connection Settings
              </span>
            </div>
            <a
              href={MEMORY_PROVIDERS.find((p) => p.id === config.memoryProvider)?.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            {fields.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="space-y-2"
              >
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                />
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange({ memoryConnected: true })}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2",
                config.memoryConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
              )}
            >
              {config.memoryConnected ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Connected!
                </span>
              ) : (
                "Test & Connect"
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── WEBSITE CRAWLER SECTION ── */}
      {config.memoryProvider !== "none" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          {/* Section Header Toggle */}
          <button
            onClick={() => setShowCrawler((v) => !v)}
            className="w-full flex items-center justify-between p-4 rounded-2xl glass glass-hover transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-sm flex items-center gap-2">
                  Auto-Crawl Websites into Memory
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal">
                    New
                  </span>
                </div>
                <div className="text-white/40 text-xs mt-0.5">
                  Paste any URL — we crawl it and index every page automatically
                </div>
              </div>
            </div>
            <div className="text-white/30 group-hover:text-white/60 transition-colors">
              {showCrawler ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showCrawler && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className="glass rounded-2xl p-5 space-y-5 border border-blue-500/10">
                  {/* How it works pills */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        icon: <Link2 className="w-4 h-4" />,
                        title: "Paste URL",
                        desc: "Any page or doc site",
                        color: "text-blue-400 bg-blue-500/10",
                      },
                      {
                        icon: <Globe className="w-4 h-4" />,
                        title: "Auto-Crawl",
                        desc: "We index all pages",
                        color: "text-purple-400 bg-purple-500/10",
                      },
                      {
                        icon: <FileText className="w-4 h-4" />,
                        title: "RAG Ready",
                        desc: "Instant smart search",
                        color: "text-green-400 bg-green-500/10",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] text-center"
                      >
                        <div className={cn("p-2 rounded-lg", item.color)}>
                          {item.icon}
                        </div>
                        <div className="text-white text-xs font-semibold">
                          {item.title}
                        </div>
                        <div className="text-white/30 text-xs">{item.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Crawl Depth Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">
                      Crawl Depth
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: "single" as CrawlDepth, label: "Single Page", desc: "Just this URL" },
                          { id: "section" as CrawlDepth, label: "Section", desc: "Same path prefix" },
                          { id: "full" as CrawlDepth, label: "Full Site", desc: "Entire domain" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setCrawlDepth(opt.id)}
                          className={cn(
                            "p-3 rounded-xl text-left transition-all glass",
                            crawlDepth === opt.id
                              ? "ring-2 ring-blue-500/60 bg-white/[0.07] text-white"
                              : "opacity-60 hover:opacity-90"
                          )}
                        >
                          <div className="text-white text-xs font-semibold">
                            {opt.label}
                          </div>
                          <div className="text-white/30 text-xs mt-0.5">
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider">
                      Add Website URL
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addUrl()}
                          placeholder="https://docs.yourcompany.com"
                          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={addUrl}
                        disabled={!urlInput.trim()}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold disabled:opacity-40 transition-all hover:from-blue-500 hover:to-cyan-500 whitespace-nowrap shadow-lg shadow-blue-500/20"
                      >
                        <Plus className="w-4 h-4" />
                        Crawl
                      </motion.button>
                    </div>
                    <p className="text-xs text-white/30">
                      Works great for documentation sites, help centers, product pages, and blogs.
                      Press Enter or click Crawl to start.
                    </p>
                  </div>

                  {/* Example quick-fill URLs */}
                  {crawledUrls.length === 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/20 uppercase tracking-wider">
                        Quick examples
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "https://docs.stripe.com",
                          "https://react.dev/reference",
                          "https://nextjs.org/docs",
                        ].map((ex) => (
                          <button
                            key={ex}
                            onClick={() => setUrlInput(ex)}
                            className="text-xs px-3 py-1.5 rounded-lg glass glass-hover text-blue-400/70 hover:text-blue-300 transition-colors font-mono"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Crawled URL Results */}
                  <AnimatePresence>
                    {crawledUrls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        {/* Summary banner */}
                        {totalPages > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <div className="text-sm text-green-300">
                              <span className="font-semibold">{totalPages} pages</span>{" "}
                              indexed and ready for RAG queries
                            </div>
                          </motion.div>
                        )}

                        <div className="space-y-2">
                          {crawledUrls.map((item) => (
                            <motion.div
                              key={item.url}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all",
                                item.status === "done"
                                  ? "bg-green-500/5 border border-green-500/15"
                                  : item.status === "error"
                                  ? "bg-red-500/5 border border-red-500/15"
                                  : "glass border border-white/5"
                              )}
                            >
                              {/* Status icon */}
                              <div className="flex-shrink-0">
                                {item.status === "crawling" && (
                                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                )}
                                {item.status === "done" && (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                )}
                                {item.status === "error" && (
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                )}
                              </div>

                              {/* URL + status */}
                              <div className="flex-1 min-w-0">
                                <div className="text-white/80 text-xs font-mono truncate">
                                  {item.url}
                                </div>
                                <div className="text-xs mt-0.5">
                                  {item.status === "crawling" && (
                                    <span className="text-blue-400">Crawling pages...</span>
                                  )}
                                  {item.status === "done" && (
                                    <span className="text-green-400">
                                      {item.pages}{" "}
                                      {item.pages === 1 ? "page" : "pages"} indexed ·{" "}
                                      {crawlDepth === "single"
                                        ? "Single page"
                                        : crawlDepth === "section"
                                        ? "Section crawl"
                                        : "Full site"}{" "}
                                      mode
                                    </span>
                                  )}
                                  {item.status === "error" && (
                                    <span className="text-red-400">
                                      {item.error || "Failed to crawl"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Remove */}
                              <button
                                onClick={() => removeUrl(item.url)}
                                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* RAG Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-semibold text-white">What is RAG?</span>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          RAG (Retrieval-Augmented Generation) lets your chatbot search through your documents,
          knowledge base, or website content to give accurate, context-aware answers. Instead of
          manually uploading data, just paste a website URL — we automatically crawl and index every
          page into your chosen vector database so the bot can answer questions from it instantly.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: "Upload PDFs", icon: "📄" },
            { label: "Crawl Websites", icon: "🌐" },
            { label: "Query Docs", icon: "🔍" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass rounded-xl p-3 text-center text-xs text-white/40 flex flex-col items-center gap-1.5"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
