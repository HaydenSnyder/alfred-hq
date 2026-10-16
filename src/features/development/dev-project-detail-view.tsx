"use client"

import Link from "next/link"
import { Code2, FlaskConical, FolderGit2, GitBranch, GitPullRequest, ListTodo, MessageSquare, Play, Rocket, SquareTerminal } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { formatDateTime, scopeLabel, timeAgo } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import { severityMeta, taskStatusMeta } from "@/lib/status"
import type { DevelopmentInfo } from "@/lib/types"
import { PageHeader } from "@/components/hq/page-header"
import { Panel } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState, UnknownState } from "@/components/hq/states"
import { StatusBadge, ToneBadge } from "@/components/hq/status-badge"
import { Timeline, eventTypeMeta, type TimelineItem } from "@/components/hq/event-timeline"
import { Button } from "@/components/ui/button"
import { ProgressBar, ProjectStatusBadge, ScopeChip } from "@/features/projects/shared"
import { DemoActionButton } from "@/components/hq/demo-action"
import { TaskExplorer } from "@/features/projects/task-explorer"
import { eventsForProject } from "@/features/projects/project-utils"
import { prStateMeta, testStatusMeta } from "./dev-meta"
import { PlanReview } from "./plan-review"

export function DevProjectDetailView({ id }: { id: string }) {
  const q = useHQQuery(`dev-project:${id}`, async (p) => {
    const [project, tasks, sessions, events, approvals, agents, companies] = await Promise.all([
      p.getProject(id),
      p.listTasks({ projectId: id }),
      p.listSessions(),
      p.listEvents(),
      p.listApprovals(),
      p.listAgents(),
      p.listCompanies(),
    ])
    return { project, tasks, sessions, events, approvals, agents, companies }
  })

  const crumbs = [{ label: "Development", href: "/development" }]

  if (q.status === "loading")
    return (
      <>
        <PageHeader title="Loading project…" breadcrumbs={crumbs} />
        <LoadingState variant="detail" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        <PageHeader title="Development project" breadcrumbs={crumbs} />
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { project, tasks, sessions, events, approvals, agents, companies } = q.data
  if (!project || !project.dev)
    return (
      <>
        <PageHeader title={project ? project.name : "Project not found"} breadcrumbs={crumbs} demo={false} />
        <EmptyState
          icon={<Code2 className="size-4" />}
          title={project ? "Not a development project" : "This project doesn't exist"}
          description={
            project
              ? "This project has no repository or development information."
              : `No development project with id "${id}" was found in the data source.`
          }
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={project ? `/projects/${project.id}` : "/development"}>{project ? "Open project overview" : "Back to Development"}</Link>
            </Button>
          }
        />
      </>
    )

  const dev = project.dev
  const agentById = new Map(agents.map((a) => [a.id, a]))
  const cto = dev.ctoAgentId ? agentById.get(dev.ctoAgentId) : undefined
  const approval = dev.plan?.approvalId ? approvals.find((a) => a.id === dev.plan?.approvalId) : undefined
  const linkedSessions = sessions.filter((s) => project.sessionIds.includes(s.id) || s.projectId === project.id)

  const projectEvents = eventsForProject(
    events,
    project,
    tasks.map((t) => t.id)
  )
  const timeline: TimelineItem[] = [
    ...projectEvents.map(
      (e): TimelineItem => ({
        id: e.id,
        at: e.at,
        title: e.title,
        detail: e.detail,
        icon: eventTypeMeta[e.type].icon,
        tone: e.severity === "info" ? "muted" : severityMeta[e.severity].tone,
        href: e.refs[0] ? hrefFor(e.refs[0]) : undefined,
        meta: (
          <>
            <span>{eventTypeMeta[e.type].label}</span>
            {e.agentId && agentById.get(e.agentId) && (
              <>
                <span aria-hidden>·</span>
                <span>{agentById.get(e.agentId)?.name}</span>
              </>
            )}
          </>
        ),
      })
    ),
    ...tasks.map(
      (t): TimelineItem => ({
        id: `task-${t.id}`,
        at: t.updatedAt,
        title: `${t.key} · ${t.title}`,
        icon: ListTodo,
        tone: taskStatusMeta[t.status].tone,
        href: hrefFor({ kind: "task", id: t.id }),
        meta: (
          <>
            <span>Task {taskStatusMeta[t.status].label.toLowerCase()}</span>
            {t.assigneeAgentId && agentById.get(t.assigneeAgentId) && (
              <>
                <span aria-hidden>·</span>
                <span>{agentById.get(t.assigneeAgentId)?.name}</span>
              </>
            )}
          </>
        ),
      })
    ),
  ].sort((a, b) => b.at.localeCompare(a.at))

  return (
    <>
      <PageHeader
        breadcrumbs={[...crumbs, { label: project.name }]}
        title={project.name}
        icon={
          <span className="flex size-8 items-center justify-center rounded-lg border bg-surface-2 text-muted-foreground">
            <Code2 className="size-4" aria-hidden />
          </span>
        }
        description={project.summary}
        actions={
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/projects/${project.id}`}>Project overview</Link>
            </Button>
            <DemoActionButton>
              <Play /> Run tests
            </DemoActionButton>
            <DemoActionButton>
              <Rocket /> Deploy
            </DemoActionButton>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <ProjectStatusBadge status={project.status} />
        <ScopeChip label={scopeLabel(project.scope, companies)} />
        {cto && (
          <span>
            CTO{" "}
            <Link href={`/agents/${cto.id}`} className="text-foreground hover:underline">
              {cto.name}
            </Link>
          </span>
        )}
        <ProgressBar value={project.progress} className="w-40" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RefCard icon={<FolderGit2 />} label="Repository">
          <p className="truncate font-mono text-sm">
            {dev.repo.owner}/{dev.repo.name}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="size-3" aria-hidden /> {dev.repo.defaultBranch}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">Reference only — not linked to GitHub.</p>
        </RefCard>
        <RefCard icon={<SquareTerminal />} label="T3 Code thread">
          {dev.t3ThreadRef ? (
            <>
              <p className="truncate font-mono text-sm" title={dev.t3ThreadRef}>
                {dev.t3ThreadRef}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">Reference only — threads open in T3 Code.</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No thread linked</p>
          )}
        </RefCard>
        <TestsCard tests={dev.tests} />
        <DeploymentCard deployment={dev.deployment} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <PlanReview plan={dev.plan} approval={approval} agentById={agentById} />

          <Panel title="Tasks">
            {tasks.length === 0 ? (
              <EmptyState title="No tasks" className="py-6" />
            ) : (
              <TaskExplorer tasks={tasks} agentById={agentById} companies={companies} showProject={false} defaultLayout="board" />
            )}
          </Panel>

          <Panel title="Agent execution timeline" description="Events and task updates for this project">
            {timeline.length === 0 ? <EmptyState title="No execution recorded" className="py-6" /> : <Timeline items={timeline} />}
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
          <Panel title="Pull requests" description="References only — not live GitHub data">
            {dev.pullRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground">No pull requests.</p>
            ) : (
              <ul className="divide-y">
                {[...dev.pullRequests]
                  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                  .map((pr) => (
                    <li key={pr.number} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                      <GitPullRequest className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="mr-1 text-muted-foreground tabular">#{pr.number}</span>
                          {pr.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {pr.author} · updated {timeAgo(pr.updatedAt)}
                        </p>
                      </div>
                      <ToneBadge tone={prStateMeta[pr.state].tone}>{prStateMeta[pr.state].label}</ToneBadge>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>

          <Panel title="Linked sessions">
            {linkedSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sessions linked.</p>
            ) : (
              <ul className="-mx-2">
                {linkedSessions.map((s) => (
                  <li key={s.id}>
                    <Link href={`/chat/${s.id}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent/60">
                      <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm">{s.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(s.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}

function RefCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border bg-card p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      {children}
    </div>
  )
}

function TestsCard({ tests }: { tests: DevelopmentInfo["tests"] }) {
  const meta = testStatusMeta[tests.status]
  return (
    <RefCard icon={<FlaskConical />} label="Tests">
      <ToneBadge tone={meta.tone}>{meta.label}</ToneBadge>
      {tests.status === "unknown" ? (
        <UnknownState className="mt-2" title="No test run reported" description="Not assumed passing." />
      ) : (
        <>
          <p className="mt-2 text-sm tabular">
            <span className="text-status-success">{tests.passed} passed</span>
            <span className="text-muted-foreground"> · </span>
            <span className={tests.failed ? "text-status-danger" : "text-muted-foreground"}>{tests.failed} failed</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground" title={formatDateTime(tests.at)}>
            {tests.at ? `Last run ${timeAgo(tests.at)}` : "Run time unknown"}
          </p>
        </>
      )}
    </RefCard>
  )
}

function DeploymentCard({ deployment }: { deployment: DevelopmentInfo["deployment"] }) {
  return (
    <RefCard icon={<Rocket />} label="Deployment">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm capitalize">{deployment.environment}</span>
        {deployment.status === "pending" ? <ToneBadge tone="info">Pending</ToneBadge> : <StatusBadge status={deployment.status} />}
      </div>
      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{deployment.version ?? "No version deployed"}</p>
      <p className="mt-1 text-[11px] text-muted-foreground" title={formatDateTime(deployment.at)}>
        {deployment.at ? `Deployed ${timeAgo(deployment.at)}` : "No deployment recorded"}
      </p>
    </RefCard>
  )
}
