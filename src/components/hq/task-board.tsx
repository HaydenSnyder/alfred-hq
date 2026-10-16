"use client"

import { CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { scopeLabel, timeAgo } from "@/lib/format"
import { taskStatusMeta, taskStatusOrder, toneClasses } from "@/lib/status"
import type { Agent, Company, Priority, Project, Task, TaskStatus } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { AgentAvatar } from "./avatars"
import { PriorityBadge } from "./status-badge"

const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

/**
 * Kanban board grouped by task status. Columns scroll horizontally inside
 * their own container on narrow screens; the page itself never overflows.
 */
export function TaskBoard({
  tasks,
  onOpen,
  agentById,
  companies,
  projectById,
  statuses = taskStatusOrder,
  showScope = true,
  className,
}: {
  tasks: Task[]
  onOpen: (task: Task) => void
  agentById?: Map<string, Agent>
  companies?: Company[]
  /** When provided, cards show the project name. */
  projectById?: Map<string, Project>
  statuses?: TaskStatus[]
  showScope?: boolean
  className?: string
}) {
  const { inspector } = useHQ()
  const selectedId = inspector.selection?.kind === "task" ? inspector.selection.id : undefined

  return (
    <div
      className={cn("scrollbar-thin -mx-1 overflow-x-auto px-1 pb-2", className)}
      role="region"
      aria-label="Task board"
      tabIndex={0}
    >
      <div className="flex min-w-max gap-3 xl:min-w-0">
        {statuses.map((status) => {
          const meta = taskStatusMeta[status]
          const items = tasks
            .filter((t) => t.status === status)
            .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.updatedAt.localeCompare(a.updatedAt))
          return (
            <section
              key={status}
              aria-label={`${meta.label} (${items.length})`}
              className="flex w-64 shrink-0 flex-col rounded-xl border bg-surface-2/50 xl:w-auto xl:min-w-[11rem] xl:flex-1"
            >
              <header className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
                <span className="flex items-center gap-2 text-xs font-medium">
                  <span className={cn("size-2 rounded-full", toneClasses[meta.tone].dot)} aria-hidden />
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground tabular">{items.length}</span>
              </header>
              <ul className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {items.length === 0 && (
                  <li className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">No tasks</li>
                )}
                {items.map((t) => (
                  <li key={t.id}>
                    <TaskCard
                      task={t}
                      onOpen={onOpen}
                      agent={t.assigneeAgentId ? agentById?.get(t.assigneeAgentId) : undefined}
                      scope={showScope ? scopeLabel(t.scope, companies) : undefined}
                      project={t.projectId ? projectById?.get(t.projectId) : undefined}
                      active={selectedId === t.id}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onOpen,
  agent,
  scope,
  project,
  active,
}: {
  task: Task
  onOpen: (task: Task) => void
  agent?: Agent
  scope?: string
  project?: Project
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      aria-pressed={active}
      className={cn(
        "block w-full rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/15 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active && "border-foreground/25 bg-surface-2"
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{task.key}</span>
        <PriorityBadge priority={task.priority} />
      </span>
      <span className="mt-1.5 line-clamp-2 block text-sm leading-snug">{task.title}</span>
      {project && <span className="mt-1 block truncate text-[11px] text-muted-foreground">{project.name}</span>}
      <span className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          {agent ? (
            <>
              <AgentAvatar agent={agent} size="sm" showStatus={false} />
              <span className="truncate">{agent.name}</span>
            </>
          ) : (
            <span className="italic">Unassigned</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {task.dueAt && (
            <span className="inline-flex items-center gap-0.5" title="Due">
              <CalendarClock className="size-3" aria-hidden />
              {timeAgo(task.dueAt)}
            </span>
          )}
          {scope && <span className="rounded border px-1 py-px">{scope}</span>}
        </span>
      </span>
    </button>
  )
}
