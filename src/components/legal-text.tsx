// Renders the shop's policy and agreement text. The agreement files are plain text with
// ALL-CAPS section titles; the policies use light Markdown headings and bullets.
type Block = { kind: "h2" | "h3" | "p" | "li"; text: string };

function clean(text: string) {
  return text.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "p", text: clean(paragraph.join(" ")) });
    paragraph = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || /^[=\-_*]{4,}$/.test(line)) { flush(); continue; }
    if (line.startsWith("# ")) { flush(); blocks.push({ kind: "h2", text: clean(line.slice(2)) }); continue; }
    if (/^#{2,}\s/.test(line)) { flush(); blocks.push({ kind: "h3", text: clean(line.replace(/^#+\s/, "")) }); continue; }
    if (/^[-*•]\s/.test(line)) { flush(); blocks.push({ kind: "li", text: clean(line.slice(2)) }); continue; }
    // "1. INDEMNIFICATION" or an all-caps title line in the agreement files.
    if (/^(\d+\.\s*)?[A-Z0-9 &/,'’()™:-]{6,}$/.test(line) && /[A-Z]{3}/.test(line)) { flush(); blocks.push({ kind: "h3", text: clean(line) }); continue; }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

export function LegalText({ text }: { text: string }) {
  return (
    <div className="legal-text">
      {parse(text).map((block, index) => {
        if (block.kind === "h2") return <h2 key={index}>{block.text}</h2>;
        if (block.kind === "h3") return <h3 key={index}>{block.text}</h3>;
        if (block.kind === "li") return <p className="legal-bullet" key={index}>{block.text}</p>;
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
