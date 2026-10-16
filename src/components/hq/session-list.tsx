"use client"

import Link from "next/link"
import { MessageSquare, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { scopeLabel, timeAgo } from "@/lib/format"
import type { Company, Session } from "@/lib/types"

interface Group {
  label: string
  sessions: Session[]
}

function groupSessions(sessions: Session[]): Group[] {
  const pinned = sessions.filter((s) => s.pinned && !s.local)
  const local = sessions.filter((s) => s.local)
  const rest = sessions.filter((s) => !s.pinned && !s.local)
  return [
    { label: "Local demo sessions", sessions: local },
    { label: "Pinned", sessions: pinned },
    { label: "Recent", sessions: rest },
  ].filter((g) => g.sessions.length > 0)
}

/** Grouped conversation list used by Alfred Chat. */
export function SessionList({
  sessions,
  activeId,
  companies,
  className,
}: {
  sessions: Session[]
  activeId?: string
  companies?: Company[]
  className?: string
}) {
  const groups = groupSessions(sessions)
  if (groups.length === 0)
    return <p className={cn("px-3 py-6 text-center text-xs text-muted-foreground", className)}>No sessions match.</p>

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">{group.label}</p>
          <ul className="space-y-px">
            {group.sessions.map((s) => {
              const active = s.id === activeId
              return (
                <li key={s.id}>
                  <Link
                    href={`/chat/${s.id}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      active && "bg-accent"
                    )}
                  >
                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("truncate text-sm", active && "font-medium")}>{s.title}</span>
                        {s.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" aria-label="Pinned" />}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {scopeLabel(s.scope, companies)}
                        {!s.local && ` · ${timeAgo(s.updatedAt)}`}
                        {s.local && " · this browser only"}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
