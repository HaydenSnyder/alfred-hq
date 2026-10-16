"use client"

import { scopeLabel, timeAgo } from "@/lib/format"
import { taskStatusOrder } from "@/lib/status"
import type { Agent, Company, Priority, Project, Task } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { AgentAvatar } from "@/components/hq/avatars"
import { DataTable, type DataTableColumn } from "@/components/hq/data-table"
import { EmptyState } from "@/components/hq/states"
import { PriorityBadge, TaskStatusBadge } from "@/components/hq/status-badge"
import { ScopeChip } from "./shared"

const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

/** Sortable task list. Rows open the task in the inspector. */
export function TaskTable({
  tasks,
  agentById,
  companies,
  projectById,
  showProject = true,
  emptyTitle = "No tasks match",
}: {
  tasks: Task[]
  agentById: Map<string, Agent>
  companies: Company[]
  projectById?: Map<string, Project>
  showProject?: boolean
  emptyTitle?: string
}) {
  const { inspect, inspector } = useHQ()
  const selectedId = inspector.selection?.kind === "task" ? inspector.selection.id : undefined

  const columns: DataTableColumn<Task>[] = [
    {
      id: "key",
      header: "Key",
      cell: (t) => <span className="font-mono text-[11px] text-muted-foreground">{t.key}</span>,
      sortValue: (t) => t.key,
      className: "w-20",
    },
    {
      id: "title",
      header: "Task",
      cell: (t) => (
        <span className="block min-w-0">
          <span className="block truncate font-medium md:max-w-[22rem]">{t.title}</span>
          {showProject && t.projectId && projectById?.get(t.projectId) && (
            <span className="block truncate text-xs text-muted-foreground">{projectById.get(t.projectId)?.name}</span>
          )}
        </span>
      ),
      sortValue: (t) => t.title.toLowerCase(),
    },
    {
      id: "status",
      header: "Status",
      cell: (t) => <TaskStatusBadge status={t.status} />,
      sortValue: (t) => taskStatusOrder.indexOf(t.status),
    },
    {
      id: "priority",
      header: "Priority",
      cell: (t) => <PriorityBadge priority={t.priority} />,
      sortValue: (t) => priorityRank[t.priority],
    },
    {
      id: "assignee",
      header: "Assignee",
      cell: (t) => {
        const a = t.assigneeAgentId ? agentById.get(t.assigneeAgentId) : undefined
        return a ? (
          <span className="flex items-center gap-1.5">
            <AgentAvatar agent={a} size="sm" showStatus={false} />
            <span className="truncate">{a.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground italic">Unassigned</span>
        )
      },
      sortValue: (t) => (t.assigneeAgentId ? agentById.get(t.assigneeAgentId)?.name : undefined),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (t) => <ScopeChip label={scopeLabel(t.scope, companies)} />,
      sortValue: (t) => scopeLabel(t.scope, companies),
      hideOnMobile: true,
    },
    {
      id: "updated",
      header: "Updated",
      cell: (t) => <span className="text-xs whitespace-nowrap text-muted-foreground tabular">{timeAgo(t.updatedAt)}</span>,
      sortValue: (t) => t.updatedAt,
      align: "right",
      hideOnMobile: true,
    },
  ]

  return (
    <DataTable
      data={tasks}
      columns={columns}
      getRowId={(t) => t.id}
      onRowClick={(t) => inspect({ kind: "task", id: t.id })}
      rowLabel={(t) => `Open task ${t.key}: ${t.title}`}
      isRowActive={(t) => t.id === selectedId}
      initialSort={{ id: "status", dir: "asc" }}
      caption="Tasks"
      empty={<EmptyState title={emptyTitle} description="Try clearing a filter." className="py-8" />}
      renderMobileCard={(t) => {
        const a = t.assigneeAgentId ? agentById.get(t.assigneeAgentId) : undefined
        return (
          <span className="block">
            <span className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{t.key}</span>
              <TaskStatusBadge status={t.status} />
            </span>
            <span className="mt-1 block text-sm font-medium">{t.title}</span>
            <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <PriorityBadge priority={t.priority} />
              <ScopeChip label={scopeLabel(t.scope, companies)} />
              <span>{a?.name ?? "Unassigned"}</span>
              <span aria-hidden>·</span>
              <span>{timeAgo(t.updatedAt)}</span>
            </span>
          </span>
        )
      }}
    />
  )
}
