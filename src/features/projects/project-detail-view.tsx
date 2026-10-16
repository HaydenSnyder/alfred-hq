"use client"

import Link from "next/link"
import { Code2, FileText, FolderKanban, GitPullRequest, MessageSquare, Microscope, Package } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { formatDate, scopeLabel, timeAgo } from "@/lib/format"
import type { Project } from "@/lib/types"
import { PageHeader } from "@/components/hq/page-header"
import { Panel, PropertyList } from "@/components/hq/panel"
import { MetricCard } from "@/components/hq/metric-card"
import { EventTimeline } from "@/components/hq/event-timeline"
import { AgentAvatar } from "@/components/hq/avatars"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { StatusBadge, ToneBadge, VerificationBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"
import { ProgressBar, ProjectStatusBadge, ScopeChip, projectKindLabel } from "./shared"
import { ProjectKindIcon } from "./project-table"
import { TaskExplorer } from "./task-explorer"
import { eventsForProject } from "./project-utils"
import { prStateMeta, testStatusMeta } from "@/features/development/dev-meta"
import { stageMeta } from "@/features/research/research-meta"

const outputIcon: Record<Project["outputs"][number]["kind"], typeof FileText> = {
  document: FileText,
  release: Package,
  report: Microscope,
  dataset: FileText,
}

export function ProjectDetailView({ id }: { id: string }) {
  const q = useHQQuery(`project:${id}`, async (p) => {
    const [project, tasks, sessions, research, events, agents, companies, projects] = await Promise.all([
      p.getProject(id),
      p.listTasks({ projectId: id }),
      p.listSessions(),
      p.listResearch(),
      p.listEvents(),
      p.listAgents(),
      p.listCompanies(),
      p.listProjects(),
    ])
    return { project, tasks, sessions, research, events, agents, companies, projects }
  })

  const crumbs = [{ label: "Projects", href: "/projects" }]

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
        <PageHeader title="Project" breadcrumbs={crumbs} />
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { project, tasks, sessions, research, events, agents, companies, projects } = q.data
  if (!project)
    return (
      <>
        <PageHeader title="Project not found" breadcrumbs={crumbs} demo={false} />
        <EmptyState
          icon={<FolderKanban className="size-4" />}
          title="This project doesn't exist"
          description={`No project with id "${id}" was found in the data source.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/projects">Back to projects</Link>
            </Button>
          }
        />
      </>
    )

  const agentById = new Map(agents.map((a) => [a.id, a]))
  const projectById = new Map(projects.map((p) => [p.id, p]))
  const lead = project.leadAgentId ? agentById.get(project.leadAgentId) : undefined
  const linkedSessions = sessions.filter((s) => project.sessionIds.includes(s.id) || s.projectId === project.id)
  const relatedResearch = research.filter((r) => project.researchIds.includes(r.id) || r.projectId === project.id)
  const projectAgents = project.agentIds.map((aid) => agentById.get(aid)).filter((a): a is NonNullable<typeof a> => !!a)
  const history = eventsForProject(
    events,
    project,
    tasks.map((t) => t.id)
  )
  const openTasks = tasks.filter((t) => t.status !== "done").length
  const blocked = tasks.filter((t) => t.status === "blocked").length

  return (
    <>
      <PageHeader
        breadcrumbs={[...crumbs, { label: project.name }]}
        title={project.name}
        icon={
          <span className="flex size-8 items-center justify-center rounded-lg border bg-surface-2 text-muted-foreground">
            <ProjectKindIcon kind={project.kind} className="size-4" />
          </span>
        }
        description={project.summary}
        actions={
          project.dev ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/development/${project.id}`}>
                <Code2 /> Development view
              </Link>
            </Button>
          ) : project.kind === "research" ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/research">
                <Microscope /> Research
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Status" value={<ProjectStatusBadge status={project.status} className="h-6 text-xs" />} hint={`Updated ${timeAgo(project.updatedAt)}`} />
        <MetricCard label="Progress" value={`${project.progress}%`} footer={<ProgressBar value={project.progress} showLabel={false} />} />
        <MetricCard label="Open tasks" value={openTasks} hint={blocked ? `${blocked} blocked` : `${tasks.length} total`} tone={blocked ? "warning" : undefined} />
        <MetricCard label="Assigned agents" value={projectAgents.length} hint={lead ? `Led by ${lead.name}` : "No lead agent"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Panel title="Summary">
            <PropertyList
              items={[
                { label: "Key", value: <span className="font-mono text-xs">{project.key}</span> },
                { label: "Scope", value: <ScopeChip label={scopeLabel(project.scope, companies)} /> },
                { label: "Kind", value: projectKindLabel[project.kind] },
                { label: "Status", value: <ProjectStatusBadge status={project.status} /> },
                { label: "Lead agent", value: lead ? <Link className="hover:underline" href={`/agents/${lead.id}`}>{lead.name}</Link> : <span className="text-muted-foreground">None</span> },
                { label: "Created", value: formatDate(project.createdAt) },
              ]}
            />
          </Panel>

          <Panel title="Tasks" description="Select a task to open it in the inspector">
            {tasks.length === 0 ? (
              <EmptyState title="No tasks yet" description="This project has no tasks in the data source." className="py-8" />
            ) : (
              <TaskExplorer tasks={tasks} agentById={agentById} companies={companies} projectById={projectById} showProject={false} />
            )}
          </Panel>

          <Panel title="Activity history" description="Events referencing this project, its tasks, sessions or research">
            {history.length === 0 ? (
              <EmptyState title="No recorded activity" className="py-6" />
            ) : (
              <EventTimeline events={history} agentById={agentById} />
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
          <Panel title="Assigned agents">
            {projectAgents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No agents assigned.</p>
            ) : (
              <ul className="-mx-2">
                {projectAgents.map((a) => (
                  <li key={a.id}>
                    <Link href={`/agents/${a.id}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent/60">
                      <AgentAvatar agent={a} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {a.name}
                          {a.id === project.leadAgentId && <span className="ml-1.5 text-[11px] text-muted-foreground">Lead</span>}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">{a.title}</span>
                      </span>
                      <StatusBadge status={a.status} withTooltip={false} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Linked sessions">
            {linkedSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sessions linked to this project.</p>
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

          <Panel title="Related research">
            {relatedResearch.length === 0 ? (
              <p className="text-xs text-muted-foreground">No research linked.</p>
            ) : (
              <ul className="-mx-2">
                {relatedResearch.map((r) => (
                  <li key={r.id}>
                    <Link href={`/research/${r.id}`} className="block rounded-md px-2 py-1.5 hover:bg-accent/60">
                      <span className="block truncate text-sm">{r.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <ToneBadge tone={stageMeta[r.stage].tone}>{stageMeta[r.stage].label}</ToneBadge>
                        <VerificationBadge status={r.verification} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {project.dev && (
            <Panel title="Development" href={`/development/${project.id}`} hrefLabel="Open">
              <PropertyList
                items={[
                  {
                    label: "Repository",
                    value: (
                      <span className="font-mono text-xs">
                        {project.dev.repo.owner}/{project.dev.repo.name}
                      </span>
                    ),
                  },
                  {
                    label: "Open PRs",
                    value: (
                      <span className="inline-flex items-center gap-1">
                        <GitPullRequest className="size-3.5 text-muted-foreground" aria-hidden />
                        {project.dev.pullRequests.filter((p) => p.state === "open" || p.state === "draft").length}
                      </span>
                    ),
                  },
                  {
                    label: "Tests",
                    value: <ToneBadge tone={testStatusMeta[project.dev.tests.status].tone}>{testStatusMeta[project.dev.tests.status].label}</ToneBadge>,
                  },
                  {
                    label: "Deployment",
                    value: (
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{project.dev.deployment.environment}</span>
                        {project.dev.deployment.status === "pending" ? (
                          <ToneBadge tone="info">Pending</ToneBadge>
                        ) : (
                          <StatusBadge status={project.dev.deployment.status} withTooltip={false} />
                        )}
                      </span>
                    ),
                  },
                ]}
              />
              {project.dev.pullRequests[0] && (
                <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <ToneBadge tone={prStateMeta[project.dev.pullRequests[0].state].tone} dot={false}>
                    #{project.dev.pullRequests[0].number}
                  </ToneBadge>
                  <span className="truncate">{project.dev.pullRequests[0].title}</span>
                </p>
              )}
            </Panel>
          )}

          <Panel title="Decisions">
            {project.decisions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No decisions recorded.</p>
            ) : (
              <ul className="space-y-3">
                {project.decisions.map((d) => (
                  <li key={d.id} className="text-sm">
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{d.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(d.at)}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.outcome}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Outputs">
            {project.outputs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No outputs yet.</p>
            ) : (
              <ul className="space-y-2">
                {project.outputs.map((o) => {
                  const Icon = outputIcon[o.kind]
                  return (
                    <li key={o.id} className="flex items-center gap-2.5 text-sm">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-surface-2 text-muted-foreground">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{o.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground capitalize">{o.kind}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}
