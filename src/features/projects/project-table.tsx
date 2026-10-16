"use client"

import { useRouter } from "next/navigation"
import { Code2, FolderKanban, Microscope } from "lucide-react"
import { scopeLabel, timeAgo } from "@/lib/format"
import type { Agent, Company, Project, Task } from "@/lib/types"
import { AgentAvatar } from "@/components/hq/avatars"
import { DataTable, type DataTableColumn } from "@/components/hq/data-table"
import { EmptyState } from "@/components/hq/states"
import { ProgressBar, ProjectStatusBadge, ScopeChip, projectKindLabel } from "./shared"

const kindIcon = { general: FolderKanban, development: Code2, research: Microscope } as const
const statusRank: Record<Project["status"], number> = { active: 0, planning: 1, paused: 2, completed: 3 }

export function ProjectKindIcon({ kind, className }: { kind: Project["kind"]; className?: string }) {
  const Icon = kindIcon[kind]
  return <Icon className={className ?? "size-3.5"} aria-hidden />
}

export function ProjectTable({
  projects,
  tasks,
  agentById,
  companies,
}: {
  projects: Project[]
  tasks: Task[]
  agentById: Map<string, Agent>
  companies: Company[]
}) {
  const router = useRouter()
  const openCount = (p: Project) => tasks.filter((t) => t.projectId === p.id && t.status !== "done").length

  const columns: DataTableColumn<Project>[] = [
    {
      id: "name",
      header: "Project",
      cell: (p) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-surface-2 text-muted-foreground">
            <ProjectKindIcon kind={p.kind} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium md:max-w-[18rem]">{p.name}</span>
            <span className="block truncate text-xs text-muted-foreground md:max-w-[18rem]">
              <span className="font-mono">{p.key}</span> · {projectKindLabel[p.kind]}
            </span>
          </span>
        </span>
      ),
      sortValue: (p) => p.name.toLowerCase(),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (p) => <ScopeChip label={scopeLabel(p.scope, companies)} />,
      sortValue: (p) => scopeLabel(p.scope, companies),
    },
    {
      id: "status",
      header: "Status",
      cell: (p) => <ProjectStatusBadge status={p.status} />,
      sortValue: (p) => statusRank[p.status],
    },
    {
      id: "progress",
      header: "Progress",
      cell: (p) => <ProgressBar value={p.progress} className="w-32" />,
      sortValue: (p) => p.progress,
    },
    {
      id: "lead",
      header: "Lead agent",
      cell: (p) => {
        const lead = p.leadAgentId ? agentById.get(p.leadAgentId) : undefined
        return lead ? (
          <span className="flex items-center gap-1.5">
            <AgentAvatar agent={lead} size="sm" />
            <span className="truncate">{lead.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground italic">No lead</span>
        )
      },
      sortValue: (p) => (p.leadAgentId ? agentById.get(p.leadAgentId)?.name : undefined),
    },
    {
      id: "open",
      header: "Open tasks",
      cell: (p) => <span className="tabular">{openCount(p)}</span>,
      sortValue: openCount,
      align: "right",
      hideOnMobile: true,
    },
    {
      id: "updated",
      header: "Updated",
      cell: (p) => <span className="text-xs whitespace-nowrap text-muted-foreground tabular">{timeAgo(p.updatedAt)}</span>,
      sortValue: (p) => p.updatedAt,
      align: "right",
      hideOnMobile: true,
    },
  ]

  return (
    <DataTable
      data={projects}
      columns={columns}
      getRowId={(p) => p.id}
      onRowClick={(p) => router.push(`/projects/${p.id}`)}
      rowLabel={(p) => `Open project ${p.name}`}
      initialSort={{ id: "status", dir: "asc" }}
      caption="Projects"
      empty={<EmptyState title="No projects match" description="Try a different scope, status or kind." className="py-8" />}
      renderMobileCard={(p) => {
        const lead = p.leadAgentId ? agentById.get(p.leadAgentId) : undefined
        return (
          <span className="block">
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{p.name}</span>
                <span className="block text-xs text-muted-foreground">
                  <span className="font-mono">{p.key}</span> · {projectKindLabel[p.kind]} · {lead?.name ?? "No lead"}
                </span>
              </span>
              <ProjectStatusBadge status={p.status} />
            </span>
            <span className="mt-2.5 flex items-center gap-2">
              <ScopeChip label={scopeLabel(p.scope, companies)} />
              <ProgressBar value={p.progress} className="flex-1" />
            </span>
          </span>
        )
      }}
    />
  )
}
