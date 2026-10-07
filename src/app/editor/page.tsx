import type { Metadata } from "next";
import { EditorLoader } from "./EditorLoader";

export const metadata: Metadata = { title: "Editor · Chatty4Everyone" };

export default function EditorPage() {
  return <EditorLoader />;
}
