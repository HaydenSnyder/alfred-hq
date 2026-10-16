"use client"

import { useState } from "react"
import { BadgeCheck, ListTodo, Plus, Rocket } from "lucide-react"
import { scopeLabel, timeAgo } from "@/lib/format"
import { taskStatusMeta, taskStatusOrder, type Tone } from "@/lib/status"
import type { RecordRef, Scope, Severity } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { DataTable, type DataTableColumn } from "@/components/hq/data-table"
import { EmptyState } from "@/components/hq/states"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { DemoOnlyButton, FilterBar, FilterSelect, ScopeChip } from "@/features/projects/shared"
import { approvalStateMeta } from "./dev-meta"
import { projectIdFromRefs, type DevelopmentData } from "./use-development-data"

type RequestKind = "task" | "plan" | "deployment"

interface DevRequest {
  id: string
  ref: RecordRef
  kind: RequestKind
  key?: string
  title: string
  projectName?: string
  status: { label: string; tone: Tone; rank: number }
  agentName?: string
  scope: Scope
  updatedAt: string
  risk?: Severity
}

const kindMeta: Record<RequestKind, { label: string; icon: typeof ListTodo }> = {
  task: { label: "Task", icon: ListTodo },
  plan: { label: "Plan", icon: BadgeCheck },
  deployment: { label: "Deployment", icon: Rocket },
}

const approvalRank = { pending: 0, rejected: 1, approved: 7, expired: 8 } as const

/**
 * Development requests, derived from development tasks and plan/deployment
 * approvals. Read-only: creating requests is not possible in the prototype.
 */
export function DevRequests({ data }: { data: DevelopmentData }) {
  const { inspect } = useHQ()
  const [kind, setKind] = useState("all")
  const { agentById, projectById, companies } = data

  const requests: DevRequest[] = [
    ...data.approvals.map((a): DevRequest => {
      const pid = projectIdFromRefs(a)
      return {
        id: a.id,
        ref: { kind: "approval", id: a.id },
        kind: a.kind === "deployment" ? "deployment" : "plan",
        title: a.title,
        projectName: pid ? projectById.get(pid)?.name : undefined,
        status: { ...approvalStateMeta[a.state], rank: approvalRank[a.state] },
        agentName: agentById.get(a.requestedByAgentId)?.name,
        scope: a.scope,
        updatedAt: a.updatedAt,
        risk: a.risk,
      }
    }),
    ...data.tasks.map(
      (t): DevRequest => ({
        id: t.id,
        ref: { kind: "task", id: t.id },
        kind: "task",
        key: t.key,
        title: t.title,
        projectName: t.projectId ? projectById.get(t.projectId)?.name : undefined,
        status: { ...taskStatusMeta[t.status], rank: 1 + taskStatusOrder.indexOf(t.status) },
        agentName: t.assigneeAgentId ? agentById.get(t.assigneeAgentId)?.name : undefined,
        scope: t.scope,
        updatedAt: t.updatedAt,
      })
    ),
  ]
  const filtered = requests.filter((r) => kind === "all" || r.kind === kind)

  const columns: DataTableColumn<DevRequest>[] = [
    {
      id: "title",
      header: "Request",
      cell: (r) => (
        <span className="block min-w-0">
          <span className="block truncate font-medium md:max-w-[22rem]">{r.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {r.key && <span className="font-mono">{r.key} · </span>}
            {r.projectName ?? "No project"}
          </span>
        </span>
      ),
      sortValue: (r) => r.title.toLowerCase(),
    },
    {
      id: "kind",
      header: "Type",
      cell: (r) => {
        const Icon = kindMeta[r.kind].icon
        return (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <Icon className="size-3.5 text-muted-foreground" aria-hidden />
            {kindMeta[r.kind].label}
          </span>
        )
      },
      sortValue: (r) => r.kind,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => <ToneBadge tone={r.status.tone}>{r.status.label}</ToneBadge>,
      sortValue: (r) => r.status.rank,
    },
    {
      id: "risk",
      header: "Risk",
      cell: (r) => (r.risk ? <SeverityBadge severity={r.risk} /> : <span className="text-xs text-muted-foreground">—</span>),
      hideOnMobile: true,
    },
    {
      id: "agent",
      header: "Agent",
      cell: (r) => <span className="text-sm">{r.agentName ?? <span className="text-muted-foreground italic">Unassigned</span>}</span>,
      sortValue: (r) => r.agentName,
    },
    {
      id: "scope",
      header: "Scope",
      cell: (r) => <ScopeChip label={scopeLabel(r.scope, companies)} />,
      hideOnMobile: true,
    },
    {
      id: "updated",
      header: "Updated",
      cell: (r) => <span className="text-xs whitespace-nowrap text-muted-foreground tabular">{timeAgo(r.updatedAt)}</span>,
      sortValue: (r) => r.updatedAt,
      align: "right",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar>
          <FilterSelect
            label="Type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All" },
              { value: "task", label: "Tasks" },
              { value: "plan", label: "Plans" },
              { value: "deployment", label: "Deployments" },
            ]}
          />
          <span className="text-xs text-muted-foreground tabular">
            {filtered.length} of {requests.length}
          </span>
        </FilterBar>
        <DemoOnlyButton variant="default">
          <Plus /> New request
        </DemoOnlyButton>
      </div>
      <p className="text-xs text-muted-foreground">
        Requests are derived from development tasks and plan or deployment approvals. HQ never calls the Development Gateway.
      </p>
      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(r) => r.id}
        onRowClick={(r) => inspect(r.ref)}
        rowLabel={(r) => `Open ${kindMeta[r.kind].label.toLowerCase()} ${r.title}`}
        initialSort={{ id: "status", dir: "asc" }}
        caption="Development requests"
        empty={<EmptyState title="No development requests" description="Nothing in the current context or filter." className="py-8" />}
      />
    </div>
  )
}
