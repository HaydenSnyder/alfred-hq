"use client"

import { useMemo, useState } from "react"
import { History, SearchX } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { DEMO_NOW } from "@/lib/data/mock/clock"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/hq/page-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { visibleInContext } from "@/features/infrastructure/demo-guards"
import { applyActivityFilters, dateRangeLabel, defaultActivityFilters, groupByDay, type ActivityFilters } from "./activity-filters"
import { ActivityToolbar } from "./activity-toolbar"
import { ActivityDayGroup } from "./day-group"

export function ActivityView() {
  const { companyContext } = useHQ()
  const [filters, setFilters] = useState<ActivityFilters>(defaultActivityFilters)

  const q = useHQQuery("activity", async (p) => {
    const [events, agents, companies] = await Promise.all([p.listEvents(), p.listAgents(), p.listCompanies()])
    return { events, agents, companies }
  })

  const derived = useMemo(() => {
    if (!q.data) return undefined
    const agentById = new Map(q.data.agents.map((a) => [a.id, a]))
    const base = q.data.events.filter((e) => visibleInContext(e.scope, companyContext))
    const agentIds = new Set(base.map((e) => e.agentId).filter(Boolean))
    const agents = q.data.agents.filter((a) => agentIds.has(a.id)).sort((a, b) => a.name.localeCompare(b.name))
    const companyIds = [...new Set(base.flatMap((e) => (e.scope.kind === "company" ? [e.scope.companyId] : [])))]
    const scopeOptions = {
      global: base.some((e) => e.scope.kind === "global"),
      personal: base.some((e) => e.scope.kind === "personal"),
      companyIds,
    }
    const filtered = applyActivityFilters(base, filters, agentById)
    return { agentById, base, agents, scopeOptions, filtered, groups: groupByDay(filtered) }
  }, [q.data, companyContext, filters])

  const header = (
    <PageHeader
      title="Operational History"
      description={
        <>
          Searchable record of agent executions, incidents, recoveries, approvals and changes across the ecosystem. Dates are relative to the demo clock (
          {DEMO_NOW.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}).
        </>
      }
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="list" rows={8} />
      </>
    )
  if (q.status === "error" || q.status === "offline" || !derived)
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { agentById, base, agents, scopeOptions, filtered, groups } = derived

  if (base.length === 0)
    return (
      <>
        {header}
        <EmptyState icon={<History className="size-4" />} title="No operational history" description="No events were recorded in this company context." />
      </>
    )

  return (
    <>
      {header}
      <ActivityToolbar value={filters} onChange={setFilters} agents={agents} companies={q.data.companies} scopeOptions={scopeOptions} />

      <p className="mt-4 mb-2 text-xs text-muted-foreground tabular" role="status" aria-live="polite">
        {filtered.length === base.length
          ? `${base.length} events`
          : `${filtered.length} of ${base.length} events match`}
        {groups.length > 0 && ` · ${groups.length} day${groups.length === 1 ? "" : "s"}`}
        {filters.range !== "all" && ` · ${dateRangeLabel[filters.range]}`}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-4" />}
          title="No events match these filters"
          description="Widen the date range or clear a filter to see more history."
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultActivityFilters)}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <ActivityDayGroup key={g.key} group={g} agentById={agentById} companies={q.data.companies} />
          ))}
        </div>
      )}
    </>
  )
}
