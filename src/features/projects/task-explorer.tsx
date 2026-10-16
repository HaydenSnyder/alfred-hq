"use client"

import { useMemo, useState } from "react"
import { Columns3, List } from "lucide-react"
import { priorityMeta, taskStatusMeta, taskStatusOrder } from "@/lib/status"
import type { Agent, Company, Priority, Project, Task } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { TaskBoard } from "@/components/hq/task-board"
import { Button } from "@/components/ui/button"
import { FilterBar, FilterSelect, LayoutToggle } from "./shared"
import { TaskTable } from "./task-table"

export type TaskLayout = "list" | "board"

/** Task list + board with status / priority / assignee filters. */
export function TaskExplorer({
  tasks,
  agentById,
  companies,
  projectById,
  showProject = true,
  defaultLayout = "list",
  toolbarExtra,
}: {
  tasks: Task[]
  agentById: Map<string, Agent>
  companies: Company[]
  projectById?: Map<string, Project>
  showProject?: boolean
  defaultLayout?: TaskLayout
  toolbarExtra?: React.ReactNode
}) {
  const { inspect } = useHQ()
  const [layout, setLayout] = useState<TaskLayout>(defaultLayout)
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [assignee, setAssignee] = useState("all")

  const assigneeOptions = useMemo(() => {
    const ids = Array.from(new Set(tasks.map((t) => t.assigneeAgentId).filter((id): id is string => !!id)))
    return ids
      .map((id) => ({ value: id, label: agentById.get(id)?.name ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [tasks, agentById])

  const filtered = tasks.filter(
    (t) =>
      (status === "all" || t.status === status) &&
      (priority === "all" || t.priority === priority) &&
      (assignee === "all" || (assignee === "unassigned" ? !t.assigneeAgentId : t.assigneeAgentId === assignee))
  )
  const filtersActive = status !== "all" || priority !== "all" || assignee !== "all"

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar>
          {layout === "list" && (
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={[{ value: "all", label: "All" }, ...taskStatusOrder.map((s) => ({ value: s, label: taskStatusMeta[s].label }))]}
            />
          )}
          <FilterSelect
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={[
              { value: "all", label: "All" },
              ...(Object.keys(priorityMeta) as Priority[]).map((p) => ({ value: p, label: priorityMeta[p].label })),
            ]}
          />
          <FilterSelect
            label="Assignee"
            value={assignee}
            onChange={setAssignee}
            options={[{ value: "all", label: "Anyone" }, ...assigneeOptions, { value: "unassigned", label: "Unassigned" }]}
          />
          {toolbarExtra}
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus("all")
                setPriority("all")
                setAssignee("all")
              }}
            >
              Clear
            </Button>
          )}
        </FilterBar>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground tabular">
            {filtered.length} of {tasks.length}
          </span>
          <LayoutToggle
            value={layout}
            onChange={(v) => setLayout(v as TaskLayout)}
            options={[
              { value: "list", label: "List", icon: <List /> },
              { value: "board", label: "Board", icon: <Columns3 /> },
            ]}
          />
        </div>
      </div>

      {layout === "list" ? (
        <TaskTable tasks={filtered} agentById={agentById} companies={companies} projectById={projectById} showProject={showProject} />
      ) : (
        <TaskBoard
          tasks={filtered}
          onOpen={(t) => inspect({ kind: "task", id: t.id })}
          agentById={agentById}
          companies={companies}
          projectById={showProject ? projectById : undefined}
        />
      )}
    </div>
  )
}
