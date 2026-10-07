"use client";

import dynamic from "next/dynamic";

// The editor reads localStorage/sessionStorage on first render, so it only runs in the browser.
const Editor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
  loading: () => <div style={{ height: "100dvh", background: "#0c0d10" }} />,
});

export function EditorLoader() {
  return <Editor />;
}
