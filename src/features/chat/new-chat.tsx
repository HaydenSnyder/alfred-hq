"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useHQ } from "@/components/providers/hq-store"
import { ChatComposer } from "@/components/hq/chat-composer"
import { AlfredLogo } from "@/components/shell/sidebar"
import { CompanySwitcher } from "@/components/shell/company-switcher"
import { useChat } from "./chat-context"

const SUGGESTIONS = [
  "Summarise today's incidents across all companies",
  "What approvals are waiting on me?",
  "Draft a plan for the HQ read-only adapter",
  "How is the Meridian booking outage progressing?",
]

/** Landing state for a new session (ChatGPT-style). */
export function NewChat() {
  const router = useRouter()
  const params = useSearchParams()
  const { startSession, status } = useChat()
  const { companyContext } = useHQ()
  const started = useRef(false)

  // Prompts handed over from the Command Center composer.
  const prompt = params.get("prompt")
  useEffect(() => {
    if (!prompt || started.current || status === "loading") return
    started.current = true
    const id = startSession(prompt)
    router.replace(`/chat/${id}`)
  }, [prompt, status, startSession, router])

  const start = (text: string, attachments: { name: string; sizeBytes: number }[] = []) => {
    const id = startSession(text, attachments)
    router.push(`/chat/${id}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlfredLogo className="size-10 rounded-xl [&_svg]:size-5" />
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">What should Alfred work on?</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            New session context:
            <CompanySwitcher className="h-7 text-xs" />
          </div>
        </div>
        <ChatComposer
          autoFocus
          onSubmit={(text, attachments) => start(text, attachments)}
          placeholder={companyContext === "all" ? "Message Alfred…" : "Message this company's Alfred…"}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => start(s)}
              className="rounded-xl border bg-card px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
