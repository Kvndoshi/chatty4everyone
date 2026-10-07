import { Fragment, type ReactNode } from "react";

// Minimal, safe markdown for bot replies: paragraphs, "- " bullet lists,
// **bold**, `code` and [links](https://…). Builds React nodes — never HTML strings.

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)\s]+\))/g;

function inline(text: string, key: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const k = `${key}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return <code key={k} style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.92em", padding: "1px 4px", borderRadius: 4, background: "rgba(127,127,127,.16)" }}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) return <a key={k} href={link[2]} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{link[1]}</a>;
    return <Fragment key={k}>{part}</Fragment>;
  });
}

export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={`ul-${blocks.length}`} style={{ margin: "4px 0", paddingLeft: 18, listStyle: "disc" }}>
        {items.map((it, i) => <li key={i}>{inline(it, `li-${blocks.length}-${i}`)}</li>)}
      </ul>,
    );
  };
  text.split("\n").forEach((line, i) => {
    const m = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    if (m) { list.push(m[1]); return; }
    flush();
    if (line.trim()) blocks.push(<p key={`p-${i}`} style={{ margin: blocks.length ? "6px 0 0" : 0 }}>{inline(line.replace(/^#+\s*/, ""), `p-${i}`)}</p>);
  });
  flush();
  return <>{blocks}</>;
}
