"use client"

import { FlaskConical, Info, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent, Message } from "@/lib/types"
import { AgentAvatar } from "@/components/hq/avatars"
import { Markdown } from "@/components/hq/markdown"

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function MessageItem({ message, agent }: { message: Message; agent?: Agent }) {
  if (message.author.kind === "system") {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
          <Info className="size-3 shrink-0" />
          <Markdown content={message.content} className="text-xs" />
        </div>
      </div>
    )
  }

  if (message.author.kind === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] space-y-1.5 md:max-w-[75%]">
          <div className="rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-[15px] whitespace-pre-wrap md:text-sm">{message.content}</div>
          {message.attachments?.length ? (
            <ul className="flex flex-wrap justify-end gap-1.5">
              {message.attachments.map((a) => (
                <li key={a.name} className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Paperclip className="size-3" /> {a.name} <span className="text-status-warning">(not uploaded)</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-right text-[11px] text-muted-foreground">You · {clock(message.createdAt)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {agent ? <AgentAvatar agent={agent} size="md" showStatus={false} /> : <span className="size-8 shrink-0 rounded-lg bg-muted" />}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium">{agent?.name ?? "Agent"}</span>
          {agent && <span className="text-muted-foreground">{agent.title}</span>}
          {message.simulated && (
            <span className="inline-flex items-center gap-1 rounded-full border border-status-warning/30 bg-status-warning/10 px-1.5 py-px text-[10px] font-medium text-status-warning">
              <FlaskConical className="size-2.5" /> Demo response
            </span>
          )}
          <span className="text-muted-foreground">{clock(message.createdAt)}</span>
        </div>
        <div className={cn("text-[15px] md:text-sm", message.simulated && "text-foreground/90")}>
          <Markdown content={message.content} className="text-[15px] md:text-sm" />
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator({ agent }: { agent?: Agent }) {
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      {agent ? <AgentAvatar agent={agent} size="md" showStatus={false} /> : <span className="size-8 rounded-lg bg-muted" />}
      <div className="flex items-center gap-1 rounded-full border bg-card px-3 py-2" aria-label="Preparing demo response">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
