import { Fragment } from "react"
import { cn } from "@/lib/utils"

/**
 * Deliberately small markdown renderer for chat messages, reports and memory
 * documents: headings, paragraphs, ordered/unordered lists, fenced code,
 * inline code, bold and italics. Content is rendered as React text nodes, so
 * no HTML from records is ever injected.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parseBlocks(content)
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "code":
            return (
              <div key={i} className="overflow-hidden rounded-lg border bg-surface-2">
                {block.lang && (
                  <div className="border-b px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{block.lang}</div>
                )}
                <pre className="scrollbar-thin overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
                  <code>{block.text}</code>
                </pre>
              </div>
            )
          case "heading": {
            const cls = block.level <= 2 ? "text-base font-semibold" : "text-sm font-semibold"
            return (
              <p key={i} role="heading" aria-level={block.level + 1} className={cn(cls, "pt-1")}>
                <Inline text={block.text} />
              </p>
            )
          }
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 marker:text-muted-foreground">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-1 pl-5 marker:text-muted-foreground">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            )
          default:
            return (
              <p key={i}>
                <Inline text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}

type Block =
  | { type: "p"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "code"; lang?: string; text: string }
  | { type: "ul" | "ol"; items: string[] }

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || undefined
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++])
      i++
      blocks.push({ type: "code", lang, text: body.join("\n") })
      continue
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] })
      i++
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""))
      blocks.push({ type: "ul", items })
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""))
      blocks.push({ type: "ol", items })
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) para.push(lines[i++])
    blocks.push({ type: "p", text: para.join(" ") })
  }
  return blocks
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
              {part.slice(1, -1)}
            </code>
          )
        if (part.startsWith("**") && part.endsWith("**"))
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          )
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
          return (
            <em key={i} className="text-muted-foreground">
              {part.slice(1, -1)}
            </em>
          )
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
