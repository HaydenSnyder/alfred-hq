"use client"

import { useRef, useState } from "react"
import { ArrowUp, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface ComposerAttachment {
  name: string
  sizeBytes: number
}

/**
 * Message composer. Attachments are listed locally only — files are never
 * read or uploaded in the prototype.
 */
export function ChatComposer({
  onSubmit,
  placeholder = "Message Alfred…",
  disabled,
  autoFocus,
  toolbar,
  footnote = "Demo mode — messages stay in this browser and are not delivered to Hermes.",
  className,
}: {
  onSubmit: (text: string, attachments: ComposerAttachment[]) => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  /** Context controls rendered beside the attach button (company, project…). */
  toolbar?: React.ReactNode
  footnote?: React.ReactNode
  className?: string
}) {
  const [value, setValue] = useState("")
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const canSend = !disabled && value.trim().length > 0

  const submit = () => {
    if (!canSend) return
    onSubmit(value.trim(), attachments)
    setValue("")
    setAttachments([])
    textRef.current?.focus()
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className="rounded-2xl border bg-card shadow-xs transition-colors focus-within:border-foreground/20"
        onClick={(e) => {
          if (e.target === e.currentTarget) textRef.current?.focus()
        }}
      >
        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 px-3 pt-3">
            {attachments.map((a, i) => (
              <li key={`${a.name}-${i}`} className="flex items-center gap-1.5 rounded-md border bg-surface-2 py-1 pr-1 pl-2 text-xs">
                <Paperclip className="size-3 text-muted-foreground" />
                <span className="max-w-40 truncate">{a.name}</span>
                <span className="text-muted-foreground">{Math.max(1, Math.round(a.sizeBytes / 1024))} KB</span>
                <button
                  type="button"
                  className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setAttachments((list) => list.filter((_, j) => j !== i))}
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="sr-only" htmlFor="hq-composer">
          Message
        </label>
        <textarea
          id="hq-composer"
          ref={textRef}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="field-sizing-content block max-h-60 min-h-[52px] w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[15px] outline-none placeholder:text-muted-foreground md:text-sm"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, sizeBytes: f.size }))
              setAttachments((list) => [...list, ...files])
              e.target.value = ""
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => fileRef.current?.click()} aria-label="Attach files (demo — not uploaded)">
                <Paperclip />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach files (demo — files are not uploaded)</TooltipContent>
          </Tooltip>
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">{toolbar}</div>
          <Button size="icon-sm" className="rounded-full" onClick={submit} disabled={!canSend} aria-label="Send message">
            <ArrowUp />
          </Button>
        </div>
      </div>
      {footnote && <p className="px-2 text-center text-[11px] text-muted-foreground">{footnote}</p>}
    </div>
  )
}
