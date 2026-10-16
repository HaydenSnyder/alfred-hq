"use client"

import { Check, CircleDashed, MessageSquareWarning, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, timeAgo } from "@/lib/format"
import { toneClasses } from "@/lib/status"
import type { Agent, Approval, DevelopmentInfo } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { DemoOnlyButton } from "@/features/projects/shared"
import { approvalStateMeta } from "./dev-meta"

/**
 * Plan review: steps as an ordered checklist, with the approval state taken
 * from the linked approval. Decision controls are disabled in the prototype.
 */
export function PlanReview({
  plan,
  approval,
  agentById,
}: {
  plan?: DevelopmentInfo["plan"]
  approval?: Approval
  agentById: Map<string, Agent>
}) {
  const { inspect } = useHQ()

  if (!plan)
    return (
      <Panel title="Plan review">
        <EmptyState title="No plan submitted" description="The CTO hasn't proposed an implementation plan for this project." className="py-6" />
      </Panel>
    )

  const state = approval?.state
  const meta = state ? approvalStateMeta[state] : { label: "No approval linked", tone: "muted" as const }
  const requester = approval ? agentById.get(approval.requestedByAgentId) : undefined
  const approved = state === "approved"
  const rejected = state === "rejected"

  return (
    <Panel
      title="Plan review"
      description={plan.title}
      actions={<ToneBadge tone={meta.tone}>{meta.label}</ToneBadge>}
    >
      {approval && (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Requested by {requester?.name ?? "unknown agent"}</span>
          <span title={formatDateTime(approval.createdAt)}>{timeAgo(approval.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            Risk <SeverityBadge severity={approval.risk} />
          </span>
          <button
            type="button"
            onClick={() => inspect({ kind: "approval", id: approval.id })}
            className="rounded px-1 underline-offset-2 hover:text-foreground hover:underline"
          >
            View approval
          </button>
        </div>
      )}

      <ol className="space-y-1.5" aria-label="Plan steps">
        {plan.steps.map((step, i) => {
          const Icon = approved ? Check : rejected ? X : CircleDashed
          const tone = approved ? toneClasses.success : rejected ? toneClasses.danger : toneClasses.muted
          return (
            <li key={step.id} className="flex gap-3 rounded-lg border bg-surface-2/40 p-3">
              <span
                className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border", tone.text, tone.border, tone.bg)}
                aria-label={approved ? "Approved" : rejected ? "Changes requested" : "Awaiting approval"}
              >
                <Icon className="size-3" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  <span className="mr-1.5 text-muted-foreground tabular">{i + 1}.</span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        <DemoOnlyButton variant="default">
          <Check /> Approve plan
        </DemoOnlyButton>
        <DemoOnlyButton>
          <MessageSquareWarning /> Request changes
        </DemoOnlyButton>
        <span className="text-[11px] text-muted-foreground">Demo only — approvals are not executed from HQ.</span>
      </div>
    </Panel>
  )
}
