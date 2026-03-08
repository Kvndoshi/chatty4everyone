"use client";

import { motion } from "framer-motion";
import { ChatbotConfig, UseCase } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Headphones,
  TrendingUp,
  HelpCircle,
  Calendar,
  ShoppingBag,
  User,
  Users,
  GraduationCap,
  Wrench,
} from "lucide-react";

interface Step1Props {
  config: ChatbotConfig;
  onChange: (updates: Partial<ChatbotConfig>) => void;
}

const USE_CASES: {
  id: UseCase;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "customer-support",
    label: "Customer Support",
    description: "Handle customer queries, complaints, and support tickets",
    icon: <Headphones className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "lead-generation",
    label: "Lead Generation",
    description: "Engage visitors and capture qualified leads",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "faq-bot",
    label: "FAQ Bot",
    description: "Answer frequently asked questions automatically",
    icon: <HelpCircle className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "appointment-booking",
    label: "Appointment Booking",
    description: "Schedule and manage appointments seamlessly",
    icon: <Calendar className="w-6 h-6" />,
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "e-commerce",
    label: "E-Commerce",
    description: "Help shoppers find products and complete purchases",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "personal-assistant",
    label: "Personal Assistant",
    description: "General purpose intelligent assistant",
    icon: <User className="w-6 h-6" />,
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "hr-onboarding",
    label: "HR Onboarding",
    description: "Guide new employees through the onboarding process",
    icon: <Users className="w-6 h-6" />,
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "education",
    label: "Education",
    description: "Teach and assist students with learning",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-amber-500 to-yellow-500",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Build something entirely unique",
    icon: <Wrench className="w-6 h-6" />,
    color: "from-gray-500 to-slate-500",
  },
];

export function Step1({ config, onChange }: Step1Props) {
  return (
    <div className="space-y-8">
      {/* Bot Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
          What&apos;s your chatbot&apos;s name?
        </label>
        <div className="relative">
          <input
            type="text"
            value={config.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Aria, Max, HelpBot..."
            className="w-full px-5 py-4 rounded-2xl glass text-white text-lg placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            autoFocus
          />
          {config.name && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl"
            >
              {config.botAvatar}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Use Case Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
          What do you need this chatbot for?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {USE_CASES.map((uc, i) => (
            <motion.button
              key={uc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => onChange({ useCase: uc.id, useCaseDescription: uc.description })}
              className={cn(
                "relative p-4 rounded-2xl text-left transition-all duration-200 group overflow-hidden",
                "glass glass-hover gradient-border",
                config.useCase === uc.id
                  ? "ring-2 ring-purple-500/60 bg-white/[0.08]"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              {config.useCase === uc.id && (
                <motion.div
                  layoutId="use-case-active"
                  className={`absolute inset-0 bg-gradient-to-br ${uc.color} opacity-10 rounded-2xl`}
                />
              )}
              <div
                className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${uc.color} text-white mb-3`}
              >
                {uc.icon}
              </div>
              <div className="font-semibold text-white text-sm">{uc.label}</div>
              <div className="text-white/40 text-xs mt-1 leading-relaxed">
                {uc.description}
              </div>
              {config.useCase === uc.id && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Optional description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-white/70 uppercase tracking-wider">
          Tell us more <span className="text-white/30 normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={config.useCaseDescription}
          onChange={(e) => onChange({ useCaseDescription: e.target.value })}
          placeholder="e.g. I run a SaaS tool for project management and need a chatbot to help users navigate the app..."
          rows={3}
          className="w-full px-5 py-4 rounded-2xl glass text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
        />
      </motion.div>
    </div>
  );
}
