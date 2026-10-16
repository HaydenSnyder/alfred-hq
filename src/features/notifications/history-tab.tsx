"use client"

import { useEffect, useRef, useState } from "react"
import { History } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, scopeLabel, timeAgo, titleCase } from "@/lib/format"
import type { Agent, Approval, Company } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { EmptyState } from "@/components/hq/states"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { approvalKindLabel, approvalStateTone } from "./approval-card"
import { LinkedRecordChips } from "./linked-records"
import type { RecordIndex } from "./record-index"

type StateFilter = "all" | "approved" | "rejected" | "expired"

function HistoryRow({
  approval: a,
  agent,
  companies,
  index,
  highlighted,
}: {
  approval: Approval
  agent?: Agent
  companies: Company[]
  index: RecordIndex
  highlighted?: boolean
}) {
  const { inspect } = useHQ()
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [highlighted])
  const decided = a.decidedAt ?? a.expiresAt ?? a.updatedAt
  return (
    <li ref={ref} aria-current={highlighted ? "true" : undefined} className={cn("px-4 py-3", highlighted && "bg-brand/[0.06]")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <button type="button" onClick={() => inspect({ kind: "approval", id: a.id })} className="text-left text-sm font-medium hover:underline focus-visible:underline focus-visible:outline-none">
            {a.title}
          </button>
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <span>{agent?.name ?? "Unknown agent"}</span>
            <span aria-hidden>·</span>
            <span>{approvalKindLabel[a.kind]}</span>
            <span aria-hidden>·</span>
            <span>{scopeLabel(a.scope, companies)}</span>
          </p>
          <LinkedRecordChips refs={a.refs} index={index} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-col sm:items-end">
          <ToneBadge tone={approvalStateTone[a.state]}>{titleCase(a.state)}</ToneBadge>
          <SeverityBadge severity={a.risk} />
          <time dateTime={decided} title={formatDateTime(decided)} className="text-[11px] text-muted-foreground tabular">
            {timeAgo(decided)}
          </time>
        </div>
      </div>
    </li>
  )
}

export function HistoryTab({
  approvals,
  agentById,
  companies,
  index,
  selectedId,
}: {
  approvals: Approval[]
  agentById: Map<string, Agent>
  companies: Company[]
  index: RecordIndex
  selectedId?: string
}) {
  const [filter, setFilter] = useState<StateFilter>("all")
  const decided = approvals
    .filter((a) => a.state !== "pending")
    .sort((a, b) => (b.decidedAt ?? b.updatedAt).localeCompare(a.decidedAt ?? a.updatedAt))
  const shown = filter === "all" ? decided : decided.filter((a) => a.state === filter)
  const count = (s: StateFilter) => (s === "all" ? decided.length : decided.filter((a) => a.state === s).length)

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Filter by outcome" className="flex flex-wrap gap-1.5">
        {(["all", "approved", "rejected", "expired"] as StateFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              filter === s ? "border-foreground/20 bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60"
            )}
          >
            {s === "all" ? "All outcomes" : titleCase(s)}
            <span className="tabular opacity-70">{count(s)}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<History className="size-4" />} title="No decided approvals" description="Approved, rejected and expired requests appear here." />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {shown.map((a) => (
            <HistoryRow
              key={a.id}
              approval={a}
              agent={agentById.get(a.requestedByAgentId)}
              companies={companies}
              index={index}
              highlighted={a.id === selectedId}
            />
          ))}
        </ul>
      )}
      <p className="text-[11px] text-muted-foreground">Decisions shown were recorded by Alfred (demo). None were made from HQ.</p>
    </div>
  )
}
