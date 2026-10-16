"use client"

import Link from "next/link"
import { BrainCircuit, FileSearch, FlaskConical, FolderKanban, Library, Quote, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { formatDate, scopeLabel } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import { severityMeta, toneClasses, verificationMeta } from "@/lib/status"
import type { ResearchRecord } from "@/lib/types"
import { PageHeader } from "@/components/hq/page-header"
import { Panel, PropertyList } from "@/components/hq/panel"
import { AgentAvatar } from "@/components/hq/avatars"
import { Markdown } from "@/components/hq/markdown"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { StatusBadge, ToneBadge, VerificationBadge } from "@/components/hq/status-badge"
import { Timeline, eventTypeMeta, type TimelineItem } from "@/components/hq/event-timeline"
import { Button } from "@/components/ui/button"
import { DemoOnlyButton, ScopeChip } from "@/features/projects/shared"
import { SourceCard } from "./source-card"
import { sourceTypeMeta, stageMeta, stageOrder } from "./research-meta"

const destinationLabel: Record<ResearchRecord["knowledgeDestinations"][number]["kind"], string> = {
  global_brain: "Global Brain",
  company_brain: "Company Brain",
  project: "Project",
}

export function ResearchDetailView({ id }: { id: string }) {
  const q = useHQQuery(`research:${id}`, async (p) => {
    const [record, agents, companies, projects, events] = await Promise.all([
      p.getResearch(id),
      p.listAgents(),
      p.listCompanies(),
      p.listProjects(),
      p.listEvents(),
    ])
    return { record, agents, companies, projects, events }
  })

  const crumbs = [{ label: "Research", href: "/research" }]

  if (q.status === "loading")
    return (
      <>
        <PageHeader title="Loading research…" breadcrumbs={crumbs} />
        <LoadingState variant="detail" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        <PageHeader title="Research record" breadcrumbs={crumbs} />
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { record, agents, companies, projects, events } = q.data
  if (!record)
    return (
      <>
        <PageHeader title="Research record not found" breadcrumbs={crumbs} demo={false} />
        <EmptyState
          icon={<FileSearch className="size-4" />}
          title="This research record doesn't exist"
          description={`No research record with id "${id}" was found in the data source.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/research">Back to research</Link>
            </Button>
          }
        />
      </>
    )

  const agentById = new Map(agents.map((a) => [a.id, a]))
  const project = record.projectId ? projects.find((p) => p.id === record.projectId) : undefined
  const recordAgents = record.agentIds.map((a) => agentById.get(a)).filter((a): a is NonNullable<typeof a> => !!a)
  const stageIndex = stageOrder.indexOf(record.stage)
  const verifiedCount = record.sources.filter((s) => s.verification === "verified").length

  const activity: TimelineItem[] = [
    ...events
      .filter((e) => e.refs.some((r) => r.kind === "research" && r.id === record.id))
      .map(
        (e): TimelineItem => ({
          id: e.id,
          at: e.at,
          title: e.title,
          detail: e.detail,
          icon: eventTypeMeta[e.type].icon,
          tone: e.severity === "info" ? "muted" : severityMeta[e.severity].tone,
          href: e.refs[0] ? hrefFor(e.refs[0]) : undefined,
          meta: e.agentId ? <span>{agentById.get(e.agentId)?.name ?? "Agent"}</span> : undefined,
        })
      ),
    ...record.sources.map(
      (s): TimelineItem => ({
        id: `src-${s.id}`,
        at: s.collectedAt,
        title: `Collected ${sourceTypeMeta[s.type].label.toLowerCase()} source: ${s.title}`,
        icon: sourceTypeMeta[s.type].icon,
        tone: verificationMeta[s.verification].tone,
        meta: <span>{verificationMeta[s.verification].label}</span>,
      })
    ),
  ].sort((a, b) => b.at.localeCompare(a.at))

  return (
    <>
      <PageHeader
        breadcrumbs={[...crumbs, { label: record.title }]}
        title={record.title}
        icon={
          <span className="flex size-8 items-center justify-center rounded-lg border bg-surface-2 text-muted-foreground">
            <FlaskConical className="size-4" aria-hidden />
          </span>
        }
        actions={
          <DemoOnlyButton variant="default">
            <Upload /> Publish to Brain
          </DemoOnlyButton>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ToneBadge tone={stageMeta[record.stage].tone}>{stageMeta[record.stage].label}</ToneBadge>
        <VerificationBadge status={record.verification} />
        <ScopeChip label={scopeLabel(record.scope, companies)} />
        <span className="text-xs text-muted-foreground">Updated {formatDate(record.updatedAt)}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <section className="rounded-xl border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Quote className="size-3.5" aria-hidden /> Research question
            </p>
            <p className="mt-2 text-base font-medium text-pretty md:text-lg">{record.question}</p>
          </section>

          <Panel
            title="Report"
            description="Illustrative report generated for the prototype"
            actions={
              <ToneBadge tone="warning" dot={false}>
                Example report
              </ToneBadge>
            }
          >
            <div className="mb-3 rounded-lg border border-status-warning/25 bg-status-warning/[0.06] px-3 py-2 text-xs text-foreground/85">
              Example report — illustrative content, not real research findings.
            </div>
            {record.report.trim() ? (
              <Markdown content={record.report} />
            ) : (
              <EmptyState title="No report drafted yet" description={`This record is still ${stageMeta[record.stage].label.toLowerCase()}.`} className="py-6" />
            )}
          </Panel>

          <Panel title="Sources" description={`${record.sources.length} collected · ${verifiedCount} verified`}>
            {record.sources.length === 0 ? (
              <EmptyState title="No sources collected" className="py-6" />
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {record.sources.map((s) => (
                  <li key={s.id}>
                    <SourceCard source={s} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
          <Panel title="Pipeline stage">
            <ol className="space-y-1.5">
              {stageOrder.map((st, i) => {
                const done = i < stageIndex
                const current = i === stageIndex
                return (
                  <li key={st} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        done ? toneClasses.success.dot : current ? toneClasses[stageMeta[st].tone].dot : "bg-muted"
                      )}
                      aria-hidden
                    />
                    <span className={cn(current ? "font-medium" : done ? "text-foreground/80" : "text-muted-foreground")}>{stageMeta[st].label}</span>
                    {current && <span className="ml-auto text-[11px] text-muted-foreground">Current</span>}
                  </li>
                )
              })}
            </ol>
          </Panel>

          <Panel title="Details">
            <PropertyList
              items={[
                { label: "Scope", value: scopeLabel(record.scope, companies) },
                {
                  label: "Project",
                  value: project ? (
                    <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 hover:underline">
                      <FolderKanban className="size-3.5 text-muted-foreground" aria-hidden />
                      {project.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  ),
                },
                { label: "Verification", value: <VerificationBadge status={record.verification} /> },
                {
                  label: "Sources",
                  value: (
                    <span className="inline-flex items-center gap-1 tabular">
                      <Library className="size-3.5 text-muted-foreground" aria-hidden />
                      {record.sources.length}
                    </span>
                  ),
                },
                { label: "Created", value: formatDate(record.createdAt) },
              ]}
            />
          </Panel>

          <Panel title="Knowledge destinations">
            {record.knowledgeDestinations.length === 0 ? (
              <p className="text-xs text-muted-foreground">No destinations configured.</p>
            ) : (
              <ul className="space-y-2">
                {record.knowledgeDestinations.map((k, i) => {
                  const inner = (
                    <>
                      <BrainCircuit className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{k.label}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {destinationLabel[k.kind]}
                          {k.nodeId ? " · open in Brain" : " · not yet linked to a node"}
                        </span>
                      </span>
                    </>
                  )
                  return (
                    <li key={`${k.kind}-${i}`}>
                      {k.nodeId ? (
                        <Link href={`/brain?node=${k.nodeId}`} className="flex items-center gap-2.5 rounded-lg border p-2.5 transition-colors hover:bg-surface-2">
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2.5 rounded-lg border border-dashed p-2.5">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">Publishing to Brain is disabled in the prototype.</p>
          </Panel>

          <Panel title="Agents">
            {recordAgents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No agents assigned.</p>
            ) : (
              <ul className="-mx-2">
                {recordAgents.map((a) => (
                  <li key={a.id}>
                    <Link href={`/agents/${a.id}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent/60">
                      <AgentAvatar agent={a} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{a.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{a.title}</span>
                      </span>
                      <StatusBadge status={a.status} withTooltip={false} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Agent activity">
            {activity.length === 0 ? <EmptyState title="No activity recorded" className="py-6" /> : <Timeline items={activity} />}
          </Panel>
        </div>
      </div>
    </>
  )
}
