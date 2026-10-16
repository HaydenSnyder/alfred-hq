"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Check, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, scopeLabel, timeAgo, titleCase } from "@/lib/format"
import { DEMO_NOW } from "@/lib/data/mock/clock"
import type { Agent, Approval, Company } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { AgentAvatar } from "@/components/hq/avatars"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { DisabledAction } from "@/features/infrastructure/demo-guards"
import { LinkedRecordChips } from "./linked-records"
import type { RecordIndex } from "./record-index"

export const APPROVAL_DISABLED_REASON = "Approvals are not executed from HQ in this phase"

export const approvalKindLabel: Record<Approval["kind"], string> = {
  deployment: "Deployment",
  plan: "Plan",
  purchase: "Purchase",
  config_change: "Configuration change",
  agent_change: "Agent change",
  research_publish: "Research publication",
}

export const approvalStateTone = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  expired: "muted",
} as const

function Expiry({ at }: { at?: string }) {
  if (!at) return <span className="text-muted-foreground">No expiry set</span>
  const past = new Date(at).getTime() <= DEMO_NOW.getTime()
  const soon = !past && new Date(at).getTime() - DEMO_NOW.getTime() < 4 * 3600_000
  return (
    <time dateTime={at} title={formatDateTime(at)} className={cn("tabular", soon && "text-status-warning", past && "text-muted-foreground")}>
      {past ? `Expired ${timeAgo(at)}` : `Expires ${timeAgo(at)}`}
    </time>
  )
}

export function ApprovalCard({
  approval,
  agent,
  index,
  companies,
  highlighted,
}: {
  approval: Approval
  agent?: Agent
  index: RecordIndex
  companies: Company[]
  highlighted?: boolean
}) {
  const { inspect } = useHQ()
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [highlighted])

  const a = approval
  return (
    <article
      ref={ref}
      id={`approval-${a.id}`}
      aria-current={highlighted ? "true" : undefined}
      className={cn(
        "relative flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4",
        highlighted && "border-brand/50 ring-2 ring-brand/20"
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <ToneBadge tone={approvalStateTone[a.state]}>{titleCase(a.state)}</ToneBadge>
        <span className="text-[11px] text-muted-foreground">Risk</span>
        <SeverityBadge severity={a.risk} />
        <span className="ml-auto text-[11px] text-muted-foreground">{approvalKindLabel[a.kind]}</span>
      </div>

      <div>
        <h3 className="text-sm font-medium">
          <button
            type="button"
            onClick={() => inspect({ kind: "approval", id: a.id })}
            className="text-left outline-none hover:underline focus-visible:underline"
          >
            {a.title}
          </button>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-xs min-[420px]:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-[11px] text-muted-foreground">Requested by</dt>
          <dd className="mt-0.5 flex min-w-0 items-center gap-2">
            {agent ? (
              <Link href={`/agents/${agent.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                <AgentAvatar agent={agent} size="sm" />
                <span className="truncate">{agent.name}</span>
              </Link>
            ) : (
              <span className="text-muted-foreground">Unknown agent</span>
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] text-muted-foreground">Requested</dt>
          <dd className="mt-0.5 tabular" title={formatDateTime(a.createdAt)}>
            {timeAgo(a.createdAt)} · {scopeLabel(a.scope, companies)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] text-muted-foreground">{a.state === "pending" ? "Expiry" : "Decided"}</dt>
          <dd className="mt-0.5 flex items-center gap-1.5">
            <Clock className="size-3 text-muted-foreground" />
            {a.state === "pending" ? <Expiry at={a.expiresAt} /> : <span title={formatDateTime(a.decidedAt)}>{a.decidedAt ? timeAgo(a.decidedAt) : "—"}</span>}
          </dd>
        </div>
      </dl>

      {a.refs.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">Linked records</p>
          <LinkedRecordChips refs={a.refs} index={index} />
        </div>
      )}

      {a.state === "pending" && (
        <div className="mt-auto space-y-2 border-t pt-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <DisabledAction label={`Reject: ${a.title}`} reason={APPROVAL_DISABLED_REASON} variant="outline">
              <X /> Reject
            </DisabledAction>
            <DisabledAction label={`Approve: ${a.title}`} reason={APPROVAL_DISABLED_REASON} variant="default">
              <Check /> Approve
            </DisabledAction>
          </div>
          <p className="text-[11px] text-muted-foreground sm:text-right">{APPROVAL_DISABLED_REASON}. Decide through existing Alfred channels.</p>
        </div>
      )}
    </article>
  )
}
