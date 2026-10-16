"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpenCheck, FileSearch, Library, Microscope, ShieldQuestion } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { inCompanyContext, scopeLabel } from "@/lib/format"
import type { SourceType } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { PageHeader } from "@/components/hq/page-header"
import { MetricCard } from "@/components/hq/metric-card"
import { Panel } from "@/components/hq/panel"
import { AgentAvatar } from "@/components/hq/avatars"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { StatusBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"
import { ProgressBar, ProjectStatusBadge, ScopeChip } from "@/features/projects/shared"
import { ResearchPipeline } from "./research-pipeline"
import { ResearchTable } from "./research-table"
import { SourceCard } from "./source-card"
import { sourceTypeMeta, sourceTypeOrder, stageMeta, type ResearchStage } from "./research-meta"

const SOURCE_PREVIEW = 6

export function ResearchView() {
  const { companyContext } = useHQ()
  const [stage, setStage] = useState<ResearchStage | undefined>()
  const [sourceType, setSourceType] = useState<SourceType | "all">("all")
  const [showAllSources, setShowAllSources] = useState(false)

  const q = useHQQuery("research-index", async (p) => {
    const [research, projects, agents, companies] = await Promise.all([p.listResearch(), p.listProjects(), p.listAgents(), p.listCompanies()])
    return { research, projects, agents, companies }
  })

  const d = useMemo(() => {
    if (!q.data) return undefined
    const records = q.data.research.filter((r) => inCompanyContext(r.scope, companyContext))
    return {
      records,
      projects: q.data.projects.filter((p) => p.kind === "research" && inCompanyContext(p.scope, companyContext)),
      researchers: q.data.agents.filter((a) => a.role === "researcher" && inCompanyContext(a.scope, companyContext)),
      agentById: new Map(q.data.agents.map((a) => [a.id, a])),
      companies: q.data.companies,
      sources: records
        .flatMap((r) => r.sources.map((s) => ({ source: s, record: { id: r.id, title: r.title } })))
        .sort((a, b) => b.source.collectedAt.localeCompare(a.source.collectedAt)),
    }
  }, [q.data, companyContext])

  const header = (
    <PageHeader
      title="Research & Intelligence"
      icon={<Microscope className="size-5 text-muted-foreground" aria-hidden />}
      description="Research pipeline, collected sources and verification status. Reports shown here are illustrative examples."
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState className="mt-4" rows={5} />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )
  if (!d) return header

  const { records, projects, researchers, agentById, companies, sources } = d
  const verifiedSources = sources.filter((s) => s.source.verification === "verified").length
  const awaiting = sources.filter((s) => s.source.verification === "unverified" || s.source.verification === "disputed").length
  const stageRecords = stage ? records.filter((r) => r.stage === stage) : records
  const typeCounts = sourceTypeOrder.map((t) => ({ type: t, count: sources.filter((s) => s.source.type === t).length })).filter((t) => t.count > 0)
  const filteredSources = sources.filter((s) => sourceType === "all" || s.source.type === sourceType)
  const visibleSources = showAllSources ? filteredSources : filteredSources.slice(0, SOURCE_PREVIEW)

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Research records" icon={<FileSearch />} value={records.length} hint={`${records.filter((r) => r.stage === "published").length} published`} />
        <MetricCard label="Sources collected" icon={<Library />} value={sources.length} hint={`${typeCounts.length} source types`} />
        <MetricCard label="Verified sources" icon={<BookOpenCheck />} value={verifiedSources} hint={sources.length ? `${Math.round((verifiedSources / sources.length) * 100)}% of collected` : "No sources"} />
        <MetricCard
          label="Unverified or disputed"
          icon={<ShieldQuestion />}
          value={awaiting}
          tone={awaiting ? "warning" : undefined}
          hint="Not yet cross-checked"
        />
      </div>

      <Panel
        title="Pipeline"
        description={stage ? `Filtering records by ${stageMeta[stage].label.toLowerCase()}` : "Select a stage to filter records"}
        className="mt-4"
        actions={
          stage && (
            <Button variant="ghost" size="xs" onClick={() => setStage(undefined)}>
              Clear
            </Button>
          )
        }
      >
        <ResearchPipeline records={records} selected={stage} onSelect={setStage} />
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <section aria-labelledby="records-heading" className="space-y-2">
            <h2 id="records-heading" className="flex items-center justify-between text-sm font-medium">
              Research records
              <span className="text-xs font-normal text-muted-foreground tabular">
                {stageRecords.length} of {records.length}
              </span>
            </h2>
            <ResearchTable records={stageRecords} agentById={agentById} companies={companies} />
          </section>

          <Panel title="Source collection" description="Most recently collected sources across records">
            {sources.length === 0 ? (
              <EmptyState title="No sources collected" className="py-6" />
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by source type">
                  <TypeChip active={sourceType === "all"} onClick={() => setSourceType("all")} label="All" count={sources.length} />
                  {typeCounts.map(({ type, count }) => {
                    const Icon = sourceTypeMeta[type].icon
                    return (
                      <TypeChip
                        key={type}
                        active={sourceType === type}
                        onClick={() => setSourceType(type)}
                        label={sourceTypeMeta[type].label}
                        count={count}
                        icon={<Icon className="size-3" aria-hidden />}
                      />
                    )
                  })}
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {visibleSources.map(({ source, record }) => (
                    <li key={`${record.id}-${source.id}`}>
                      <SourceCard source={source} record={record} />
                    </li>
                  ))}
                </ul>
                {filteredSources.length > SOURCE_PREVIEW && (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAllSources((v) => !v)}>
                    {showAllSources ? "Show fewer" : `Show all ${filteredSources.length}`}
                  </Button>
                )}
              </>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
          <Panel title="Research projects" href="/projects" hrefLabel="All projects">
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground">No research projects in this context.</p>
            ) : (
              <ul className="-mx-2">
                {projects.map((p) => {
                  const lead = p.leadAgentId ? agentById.get(p.leadAgentId) : undefined
                  return (
                    <li key={p.id}>
                      <Link href={`/projects/${p.id}`} className="block rounded-md px-2 py-2 hover:bg-accent/60">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">{p.name}</span>
                          <ProjectStatusBadge status={p.status} />
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <ScopeChip label={scopeLabel(p.scope, companies)} />
                          <span className="truncate">
                            {lead?.name ?? "No lead"} · {p.researchIds.length} record{p.researchIds.length === 1 ? "" : "s"}
                          </span>
                        </span>
                        <ProgressBar value={p.progress} className="mt-2" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Research agents" href="/agents" hrefLabel="Workforce">
            {researchers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No research agents in this context.</p>
            ) : (
              <ul className="-mx-2">
                {researchers.map((a) => {
                  const active = records.filter((r) => r.agentIds.includes(a.id) && r.stage !== "published").length
                  return (
                    <li key={a.id}>
                      <Link href={`/agents/${a.id}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent/60">
                        <AgentAvatar agent={a} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{a.name}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {a.title} · {active} active record{active === 1 ? "" : "s"}
                          </span>
                        </span>
                        <StatusBadge status={a.status} withTooltip={false} />
                      </Link>
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

function TypeChip({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active ? "border-foreground/25 bg-surface-2 text-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      {label}
      <span className="tabular opacity-70">{count}</span>
    </button>
  )
}
