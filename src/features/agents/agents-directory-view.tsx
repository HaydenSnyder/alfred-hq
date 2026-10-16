"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Bot, CircleSlash, Plus, SearchX, Zap } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { inCompanyContext } from "@/lib/format"
import type { AgentRole } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { AgentCard } from "@/components/hq/agent-card"
import { AgentHierarchy } from "@/components/hq/agent-hierarchy"
import { MetricCard } from "@/components/hq/metric-card"
import { PageHeader } from "@/components/hq/page-header"
import { Panel } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { Button } from "@/components/ui/button"
import { AgentFilters } from "./agent-filters"
import { AgentTable } from "./agent-table"
import {
  emptyFilters,
  filterAgents,
  isUnverified,
  needsAttention,
  parseStatusFilter,
  withAncestors,
  type AgentFilterState,
  type StatusFilter,
  type ViewMode,
} from "./agent-utils"
import { DemoActionButton } from "@/components/hq/demo-action"

export function AgentsDirectoryView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { companyContext, setCompanyContext } = useHQ()

  // Status lives in the URL so links like /agents?status=attention work and stay shareable.
  const status = parseStatusFilter(searchParams.get("status"))
  const [scope, setScope] = useState(() => searchParams.get("scope") ?? "all")
  const [department, setDepartment] = useState("all")
  const [role, setRole] = useState<"all" | AgentRole>("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")

  const q = useHQQuery("agents-directory", async (p) => {
    const [agents, companies] = await Promise.all([p.listAgents(), p.listCompanies()])
    return { agents, companies }
  })

  const setStatus = (next: StatusFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "all") params.delete("status")
    else params.set("status", next)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const clearFilters = () => {
    setScope(emptyFilters.scope)
    setDepartment(emptyFilters.department)
    setRole(emptyFilters.role)
    setQuery(emptyFilters.query)
    setStatus("all")
  }

  const filters: AgentFilterState = { status, scope, department, role, query }

  const derived = useMemo(() => {
    if (q.status !== "success") return null
    const { agents, companies } = q.data
    const inContext = agents.filter((a) => inCompanyContext(a.scope, companyContext))
    const scopeOptions = {
      global: inContext.some((a) => a.scope.kind === "global"),
      personal: inContext.some((a) => a.scope.kind === "personal"),
      companyIds: companies.map((c) => c.id).filter((id) => inContext.some((a) => a.scope.kind === "company" && a.scope.companyId === id)),
    }
    return { agents, companies, inContext, scopeOptions }
  }, [q.status, q.data, companyContext])

  const actions = (
    <DemoActionButton variant="default" reason="Disabled in prototype — agents are registered through Hermes, not HQ">
      <Plus /> New agent
    </DemoActionButton>
  )

  const header = (
    <PageHeader
      title="Agent workforce"
      description="Every registered agent across Alfred, the companies and your personal work. Read-only monitoring — status comes from the last health check."
      actions={actions}
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState variant="cards" rows={6} className="mt-4" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )
  if (!derived || derived.agents.length === 0)
    return (
      <>
        {header}
        <EmptyState icon={<Bot className="size-4" />} title="No agents registered" description="The data source returned no agents." />
      </>
    )

  const { companies, inContext, scopeOptions, agents } = derived
  // Ignore a scope that isn't available in the current HQ context.
  const effective: AgentFilterState = {
    ...filters,
    scope: scope === "all" || (scope === "global" && scopeOptions.global) || (scope === "personal" && scopeOptions.personal) || scopeOptions.companyIds.includes(scope) ? scope : "all",
  }
  if (effective.scope !== scope) effective.department = "all"
  const visible = filterAgents(inContext, effective, companies).sort((a, b) => a.name.localeCompare(b.name))
  const filtersActive = visible.length !== inContext.length

  const working = inContext.filter((a) => a.status === "working").length
  const attention = inContext.filter(needsAttention).length
  const unverified = inContext.filter(isUnverified).length
  const contextCompany = companies.find((c) => c.id === companyContext)

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Agents in view" icon={<Bot />} value={inContext.length} hint={`${agents.length} registered in total`} />
        <MetricCard label="Working now" icon={<Zap />} value={working} hint={`${inContext.filter((a) => a.status === "idle").length} idle`} />
        <MetricCard
          label="Needs attention"
          icon={<AlertTriangle />}
          value={attention}
          hint="Degraded or offline"
          tone={attention ? "warning" : undefined}
          href="/agents?status=attention"
        />
        <MetricCard label="Unverified" icon={<CircleSlash />} value={unverified} hint="Unknown or unconfigured — not assumed healthy" />
      </div>

      {companyContext !== "all" && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          Showing agents in the <span className="font-medium text-foreground">{contextCompany?.name ?? "Personal"}</span> context
          {companyContext === "personal" && " (global and personal agents)"}.
          <Button variant="link" size="xs" className="h-auto p-0 text-xs" onClick={() => setCompanyContext("all")}>
            Show all
          </Button>
        </p>
      )}

      <div className="mt-4">
        <AgentFilters
          filters={effective}
          companies={companies}
          scopeOptions={scopeOptions}
          view={view}
          onStatusChange={setStatus}
          onScopeChange={(v) => {
            setScope(v)
            setDepartment("all")
          }}
          onDepartmentChange={setDepartment}
          onRoleChange={setRole}
          onQueryChange={setQuery}
          onViewChange={setView}
          onClear={clearFilters}
        />
      </div>

      <p className="mt-4 mb-3 text-xs text-muted-foreground" aria-live="polite">
        {visible.length} of {inContext.length} agents
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-4" />}
          title="No agents match these filters"
          description="Try a different status, scope or search term."
          action={
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visible.map((a) => (
            <AgentCard key={a.id} agent={a} companies={companies} />
          ))}
        </div>
      ) : view === "list" ? (
        <AgentTable agents={visible} companies={companies} />
      ) : (
        <Panel
          title="Organisation hierarchy"
          description={
            filtersActive
              ? "Matching agents are highlighted; dimmed nodes are shown for reporting context. Select a node to inspect it."
              : "Reporting lines from Alfred down. Select a node to inspect it, or use the arrow to open its profile."
          }
        >
          <AgentHierarchy
            key={`${companyContext}-${filtersActive}`}
            agents={withAncestors(visible, agents)}
            companies={companies}
            matchIds={filtersActive ? new Set(visible.map((a) => a.id)) : undefined}
            defaultDepth={filtersActive ? 99 : 2}
          />
        </Panel>
      )}
    </>
  )
}
