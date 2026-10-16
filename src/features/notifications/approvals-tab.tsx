import { BadgeCheck, Info } from "lucide-react"
import { severityMeta } from "@/lib/status"
import type { Agent, Approval, Company } from "@/lib/types"
import { EmptyState } from "@/components/hq/states"
import { ApprovalCard, APPROVAL_DISABLED_REASON } from "./approval-card"
import type { RecordIndex } from "./record-index"

export function ApprovalsTab({
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
  const pending = approvals
    .filter((a) => a.state === "pending")
    .sort((a, b) => severityMeta[a.risk].rank - severityMeta[b.risk].rank || (a.expiresAt ?? "9").localeCompare(b.expiresAt ?? "9"))

  return (
    <div className="space-y-4">
      <div role="note" className="flex items-start gap-2.5 rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <p>
          <span className="font-medium text-foreground/85">{APPROVAL_DISABLED_REASON}.</span> HQ shows what agents are waiting on so
          you can review context; Approve and Reject stay disabled until a write-capable adapter is explicitly approved.
        </p>
      </div>
      {pending.length === 0 ? (
        <EmptyState icon={<BadgeCheck className="size-4" />} title="Nothing awaiting approval" description="No pending requests in this company context." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {pending.map((a) => (
            <ApprovalCard
              key={a.id}
              approval={a}
              agent={agentById.get(a.requestedByAgentId)}
              index={index}
              companies={companies}
              highlighted={a.id === selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
