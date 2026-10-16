import Link from "next/link"
import { ChevronRight, MessagesSquare, Pin } from "lucide-react"
import { timeAgo } from "@/lib/format"
import type { Agent, Company, Session } from "@/lib/types"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { ToneBadge } from "@/components/hq/status-badge"

export function CompanySessionsTab({
  company,
  sessions,
  agentById,
}: {
  company: Company
  sessions: Session[]
  agentById: Map<string, Agent>
}) {
  return (
    <Panel title="Sessions" description={`Conversations scoped to ${company.shortName}`} href="/chat" hrefLabel="All sessions">
      {sessions.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="size-4" />}
          title="No sessions"
          description={`No conversations are scoped to ${company.shortName} yet.`}
          className="py-8"
        />
      ) : (
        <ul className="-mx-2 divide-y">
          {sessions.map((s) => {
            const names = s.agentIds.map((id) => agentById.get(id)?.name).filter(Boolean)
            return (
              <li key={s.id}>
                <Link href={`/chat/${s.id}`} className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent/60">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-surface-2 text-muted-foreground">
                    <MessagesSquare className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm">{s.title}</span>
                      {s.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" aria-label="Pinned" />}
                      {s.local && (
                        <ToneBadge tone="muted" dot={false}>
                          Local
                        </ToneBadge>
                      )}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {names.length ? names.join(", ") : "No agents"} · {s.taskIds.length} {s.taskIds.length === 1 ? "task" : "tasks"}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular">{timeAgo(s.updatedAt)}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
