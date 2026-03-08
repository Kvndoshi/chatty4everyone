"use client";

import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { ChatbotWizard } from "@/components/ChatbotWizard";

export default function Home() {
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return <ChatbotWizard />;
  }

  return <LandingPage onGetStarted={() => setShowBuilder(true)} />;
}
