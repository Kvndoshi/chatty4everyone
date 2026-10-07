export type Tab = "type" | "launcher" | "colours" | "position" | "bubbles" | "text" | "window" | "bot" | "ai";
export type Site = "saas" | "docs" | "shop" | "blank" | "live";

/** The owner's API keys. Kept in sessionStorage only, until published to the server. */
export interface Keys {
  openrouter: string;
  supermemory: string;
}

/** A bot published to the server from this browser. */
export interface Published {
  botId: string;
  editToken: string;
  publishedAt: string;
  /** Which keys the server already holds. */
  hasOpenRouter: boolean;
  hasSupermemory: boolean;
  /** Settings as last published, to show "unpublished changes". */
  snapshot: string;
}

export const TAB_INFO: Record<Tab, { label: string; title: string; sub: string }> = {
  type: { label: "Type", title: "Chatbot type", sub: "Pick a layout and a style to start from." },
  launcher: { label: "Launcher", title: "Launcher", sub: "What visitors see before they click." },
  colours: { label: "Colours", title: "Colours", sub: "Palettes, brand colours and surfaces." },
  position: { label: "Position", title: "Position", sub: "Where it sits on the page." },
  bubbles: { label: "Bubbles", title: "Bubbles", sub: "Message colours, shape and rhythm." },
  text: { label: "Text", title: "Typography", sub: "Typeface and sizes inside the widget." },
  window: { label: "Window", title: "Chat window", sub: "Size, corners, header and input." },
  bot: { label: "Bot", title: "Personality", sub: "Name, avatar, copy and behaviour." },
  ai: { label: "AI", title: "Brain", sub: "Model, instructions, knowledge and keys." },
};
