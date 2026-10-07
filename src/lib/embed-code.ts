import type { Template } from "./widget";

export type InstallTarget = "script" | "react" | "wordpress" | "shopify" | "wix" | "gtm";

export const INSTALL_TARGETS: { id: InstallTarget; label: string }[] = [
  { id: "script", label: "Script tag" },
  { id: "react", label: "React / Next.js" },
  { id: "wordpress", label: "WordPress" },
  { id: "shopify", label: "Shopify" },
  { id: "wix", label: "Wix · Squarespace · Webflow" },
  { id: "gtm", label: "Google Tag Manager" },
];

const PLACEHOLDER_ID = "YOUR_BOT_ID";

/** The one line people paste into their site. */
export function scriptTag(origin: string, botId: string | null, template: Template): string {
  const inline = template === "inline" ? " data-inline" : "";
  return `<script src="${origin}/widget.js" data-bot="${botId ?? PLACEHOLDER_ID}"${inline} async></script>`;
}

export function installGuide(target: InstallTarget, origin: string, botId: string | null, template: Template): { code: string; steps: string[] } {
  const tag = scriptTag(origin, botId, template);
  const id = botId ?? PLACEHOLDER_ID;
  const where = template === "inline" ? "where the chat should appear" : "just before </body>";
  switch (target) {
    case "script":
      return { code: tag, steps: [`Paste this line into your site's HTML, ${where}.`, "That's it — the assistant appears on every page that has it."] };
    case "react":
      return {
        code: `// Next.js (app/layout.tsx) — or any React app with the plain <script> tag
import Script from "next/script";

<Script src="${origin}/widget.js" data-bot="${id}"${template === "inline" ? " data-inline" : ""} strategy="afterInteractive" />`,
        steps: ["Add the component to your root layout so it loads on every page.", "Open or close it from your own buttons with window.Chatty.open() / .close()."],
      };
    case "wordpress":
      return {
        code: tag,
        steps: [
          "In WordPress, go to Appearance → Theme File Editor → footer.php (or use a plugin like “WPCode” → Header & Footer).",
          `Paste the line into the footer section ${template === "inline" ? "or into a Custom HTML block where it should appear" : ""}.`.trim(),
          "Save — the assistant shows up across your site.",
        ],
      };
    case "shopify":
      return {
        code: tag,
        steps: ["In Shopify admin, go to Online Store → Themes → ⋯ → Edit code.", "Open layout/theme.liquid and paste the line just before </body>.", "Save and preview your store."],
      };
    case "wix":
      return {
        code: tag,
        steps: [
          "Wix: Settings → Custom code → + Add custom code → paste → load on all pages, place in Body - end.",
          "Squarespace: Settings → Advanced → Code injection → Footer.",
          "Webflow: Site settings → Custom code → Footer code, then publish.",
        ],
      };
    case "gtm":
      return {
        code: tag,
        steps: ["In Google Tag Manager, create a new tag → Custom HTML and paste the line.", "Trigger: All Pages. Submit and publish the container.", "No developer needed — works on any site already using GTM."],
      };
  }
}

/** Bookmarklet that injects the published widget into whatever page you're on. */
export function bookmarklet(origin: string, botId: string): string {
  const js = `(function(){if(window.Chatty&&window.Chatty.__loaded)return;var s=document.createElement('script');s.src='${origin}/widget.js';s.setAttribute('data-bot','${botId}');document.body.appendChild(s);})();`;
  return `javascript:${encodeURIComponent(js)}`;
}
