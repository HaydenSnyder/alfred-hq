"use client"

import { ListTodo } from "lucide-react"
import { timeAgo } from "@/lib/format"
import { taskStatusOrder } from "@/lib/status"
import type { Task } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { PriorityBadge, TaskStatusBadge } from "@/components/hq/status-badge"

export function AgentTasksTab({ tasks }: { tasks: Task[] }) {
  const { inspect } = useHQ()
  // Active work first (in progress, review, blocked…), completed last.
  const rank = (t: Task) => (t.status === "done" ? 99 : -taskStatusOrder.indexOf(t.status))
  const sorted = [...tasks].sort((a, b) => rank(a) - rank(b))

  return (
    <Panel title="Assigned tasks" description="Select a task to inspect it" href="/projects" hrefLabel="All projects">
      {sorted.length === 0 ? (
        <EmptyState icon={<ListTodo className="size-4" />} title="No assigned tasks" description="This agent has no tasks assigned right now." className="py-8" />
      ) : (
        <ul className="-mx-2 divide-y">
          {sorted.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => inspect({ kind: "task", id: t.id })}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent/60"
              >
                <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">{t.key}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{t.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    Updated {timeAgo(t.updatedAt)}
                    {t.dueAt && ` · due ${timeAgo(t.dueAt)}`}
                  </span>
                </span>
                <span className="hidden sm:inline-flex">
                  <PriorityBadge priority={t.priority} />
                </span>
                <TaskStatusBadge status={t.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
