"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SessionList } from "@/components/hq/session-list"
import { LoadingState } from "@/components/hq/states"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { ChatProvider, useChat } from "./chat-context"

/** Persistent chat frame: session panel + active conversation. */
export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ChatFrame>{children}</ChatFrame>
    </ChatProvider>
  )
}

function ChatFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeId = pathname.startsWith("/chat/") ? decodeURIComponent(pathname.slice(6)) : undefined

  return (
    <div className="flex min-h-0 flex-1">
      {/* On phones the list is its own screen; a conversation is full-screen. */}
      <aside className={cn("w-full shrink-0 flex-col border-r bg-surface md:flex md:w-72", activeId ? "hidden" : "flex")}>
        <SessionPanel activeId={activeId} />
      </aside>
      <section className={cn("min-w-0 flex-1 flex-col", activeId ? "flex" : "hidden md:flex")}>{children}</section>
    </div>
  )
}

function SessionPanel({ activeId }: { activeId?: string }) {
  const { sessions, companies, status } = useChat()
  const [filter, setFilter] = useState("")
  const visible = sessions.filter((s) => s.title.toLowerCase().includes(filter.trim().toLowerCase()))

  return (
    <>
      <div className="space-y-2 border-b p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Alfred Chat</h1>
          <DemoDataIndicator />
        </div>
        <Button asChild className="w-full justify-start">
          <Link href="/chat?new=1">
            <Plus /> New session
          </Link>
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter sessions"
            className="h-8 pl-8 text-sm"
            aria-label="Filter sessions"
          />
        </div>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-1.5 py-3">
        {status === "loading" ? (
          <LoadingState rows={6} className="px-1.5" />
        ) : status === "error" || status === "offline" ? (
          <p className="px-3 py-4 text-xs text-muted-foreground">Session history is unavailable from the data source. Local sessions still work.</p>
        ) : null}
        {status !== "loading" && <SessionList sessions={visible} activeId={activeId} companies={companies} />}
      </div>
    </>
  )
}
