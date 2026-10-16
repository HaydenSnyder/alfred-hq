"use client"

import Link from "next/link"
import { BadgeCheck, FlaskConical, FolderGit2, GitPullRequest } from "lucide-react"
import { scopeLabel, timeAgo } from "@/lib/format"
import type { Agent, Project } from "@/lib/types"
import { AgentAvatar } from "@/components/hq/avatars"
import { MetricCard } from "@/components/hq/metric-card"
import { Panel, PropertyList } from "@/components/hq/panel"
import { EmptyState, UnknownState } from "@/components/hq/states"
import { StatusBadge, ToneBadge } from "@/components/hq/status-badge"
import { UsageMeter } from "@/components/hq/uptime-bar"
import { ProgressBar, ProjectStatusBadge, ScopeChip } from "@/features/projects/shared"
import { testStatusMeta } from "./dev-meta"
import type { DevelopmentData } from "./use-development-data"

export function DevOverview({ data }: { data: DevelopmentData }) {
  const { projects, tasks, approvals, agents, companies } = data
  const cto = agents.find((a) => a.role === "cto")
  const openPRs = projects.flatMap((p) => p.dev?.pullRequests ?? []).filter((pr) => pr.state === "open")
  const draftPRs = projects.flatMap((p) => p.dev?.pullRequests ?? []).filter((pr) => pr.state === "draft")
  const failing = projects.filter((p) => p.dev?.tests.status === "failing")
  const unknownTests = projects.filter((p) => !p.dev || p.dev.tests.status === "unknown")
  const pendingPlans = approvals.filter((a) => a.kind === "plan" && a.state === "pending")
  const active = projects.filter((p) => p.status === "active")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Active dev projects" icon={<FolderGit2 />} value={active.length} hint={`${projects.length} development projects`} />
        <MetricCard label="Open pull requests" icon={<GitPullRequest />} value={openPRs.length} hint={`${draftPRs.length} draft`} />
        <MetricCard
          label="Failing test suites"
          icon={<FlaskConical />}
          value={failing.length}
          tone={failing.length ? "danger" : undefined}
          hint={unknownTests.length ? `${unknownTests.length} with unknown status` : "All suites reporting"}
        />
        <MetricCard
          label="Pending plan approvals"
          icon={<BadgeCheck />}
          value={pendingPlans.length}
          tone={pendingPlans.length ? "info" : undefined}
          hint="Review only in this phase"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <CtoCard cto={cto} activeTasks={cto ? tasks.filter((t) => t.assigneeAgentId === cto.id && t.status !== "done").length : 0} />

        <Panel title="Development projects" description="Repositories coordinated by the Development CTO" className="xl:col-span-2">
          {projects.length === 0 ? (
            <EmptyState title="No development projects" description="None in the current company context." className="py-8" />
          ) : (
            <ul className="grid gap-2 md:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <DevProjectCard project={p} scope={scopeLabel(p.scope, companies)} openTasks={tasks.filter((t) => t.projectId === p.id && t.status !== "done").length} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

function CtoCard({ cto, activeTasks }: { cto?: Agent; activeTasks: number }) {
  if (!cto)
    return (
      <Panel title="Development CTO">
        <UnknownState title="No CTO agent registered" description="Development coordination status is unknown." />
      </Panel>
    )
  const capacity = cto.config.maxConcurrentTasks
  const load = capacity > 0 ? Math.round((activeTasks / capacity) * 100) : 0
  return (
    <Panel title="Development CTO" href={`/agents/${cto.id}`} hrefLabel="Profile">
      <div className="flex items-center gap-3">
        <AgentAvatar agent={cto} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{cto.name}</p>
          <p className="truncate text-xs text-muted-foreground">{cto.title}</p>
        </div>
        <StatusBadge status={cto.status} />
      </div>
      <PropertyList
        className="mt-4"
        items={[
          { label: "Model", value: <span className="font-mono text-xs">{cto.model.name}</span> },
          { label: "Provider", value: cto.model.provider },
          { label: "Last active", value: cto.lastActiveAt ? timeAgo(cto.lastActiveAt) : <span className="text-muted-foreground">No verified check</span> },
          { label: "7-day tasks", value: <span className="tabular">{cto.stats.tasksCompleted7d} completed</span> },
        ]}
      />
      <UsageMeter
        className="mt-4"
        value={load}
        label={`Current load · ${activeTasks}/${capacity} concurrent tasks`}
      />
    </Panel>
  )
}

function DevProjectCard({ project, scope, openTasks }: { project: Project; scope: string; openTasks: number }) {
  const dev = project.dev
  const tests = testStatusMeta[dev?.tests.status ?? "unknown"]
  const openPRs = dev?.pullRequests.filter((pr) => pr.state === "open" || pr.state === "draft").length ?? 0
  return (
    <Link
      href={`/development/${project.id}`}
      className="flex h-full flex-col rounded-lg border bg-card p-3 transition-colors hover:border-foreground/15 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{project.name}</span>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {dev ? `${dev.repo.owner}/${dev.repo.name}` : "No repository linked"}
          </span>
        </span>
        <ProjectStatusBadge status={project.status} />
      </span>
      <span className="mt-3 flex flex-wrap items-center gap-1.5">
        <ScopeChip label={scope} />
        <ToneBadge tone={tests.tone}>Tests {tests.label.toLowerCase()}</ToneBadge>
        {dev && dev.deployment.status !== "pending" ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            {dev.deployment.environment}
            <StatusBadge status={dev.deployment.status} withTooltip={false} />
          </span>
        ) : (
          <ToneBadge tone="info">Deploy pending</ToneBadge>
        )}
      </span>
      <span className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <GitPullRequest className="size-3.5" aria-hidden /> {openPRs} open
        </span>
        <span>{openTasks} open tasks</span>
        <ProgressBar value={project.progress} className="ml-auto w-28" />
      </span>
    </Link>
  )
}
