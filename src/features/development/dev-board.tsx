"use client"

import { useState } from "react"
import { useHQ } from "@/components/providers/hq-store"
import { EmptyState } from "@/components/hq/states"
import { TaskBoard } from "@/components/hq/task-board"
import { FilterBar, FilterSelect } from "@/features/projects/shared"
import type { DevelopmentData } from "./use-development-data"

export function DevBoard({ data }: { data: DevelopmentData }) {
  const { inspect } = useHQ()
  const [project, setProject] = useState("all")
  const tasks = data.tasks.filter((t) => project === "all" || t.projectId === project)

  if (data.tasks.length === 0)
    return <EmptyState title="No development tasks" description="No tasks belong to development projects in this context." />

  return (
    <div className="space-y-3">
      <FilterBar>
        <FilterSelect
          label="Project"
          value={project}
          onChange={setProject}
          options={[{ value: "all", label: "All projects" }, ...data.projects.map((p) => ({ value: p.id, label: p.name }))]}
        />
        <span className="text-xs text-muted-foreground tabular">{tasks.length} tasks</span>
      </FilterBar>
      <TaskBoard
        tasks={tasks}
        onOpen={(t) => inspect({ kind: "task", id: t.id })}
        agentById={data.agentById}
        companies={data.companies}
        projectById={project === "all" ? data.projectById : undefined}
      />
    </div>
  )
}
