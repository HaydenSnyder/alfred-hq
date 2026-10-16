"use client"

import { useState } from "react"
import { AlertOctagon, AlertTriangle, Building2, CircleSlash, HeartPulse, Search, SearchX } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { useHQ } from "@/components/providers/hq-store"
import { CompanyCard } from "@/components/hq/company-card"
import { MetricCard } from "@/components/hq/metric-card"
import { PageHeader } from "@/components/hq/page-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { companyIncidents, companyStats, healthFilterOptions, matchesHealthFilter, type HealthFilter } from "./company-utils"

export function CompaniesDirectoryView() {
  const { companyContext, setCompanyContext } = useHQ()
  const [query, setQuery] = useState("")
  const [health, setHealth] = useState<HealthFilter>("all")

  const q = useHQQuery("companies-directory", async (p) => {
    const [companies, agents, tasks, incidents] = await Promise.all([p.listCompanies(), p.listAgents(), p.listTasks(), p.listIncidents()])
    return { companies, agents, tasks, incidents }
  })

  const header = (
    <PageHeader
      title="Companies"
      description="Every company Alfred operates for. This is the private HQ view — each company's own website and staff portal are separate."
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState variant="cards" rows={4} className="mt-4" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { companies: all, agents, tasks, incidents } = q.data
  if (all.length === 0)
    return (
      <>
        {header}
        <EmptyState icon={<Building2 className="size-4" />} title="No companies" description="The data source returned no companies." />
      </>
    )

  if (companyContext === "personal")
    return (
      <>
        {header}
        <EmptyState
          icon={<Building2 className="size-4" />}
          title="Personal context selected"
          description="Companies are hidden while HQ is scoped to your personal work."
          action={
            <Button size="sm" variant="outline" onClick={() => setCompanyContext("all")}>
              Show all companies
            </Button>
          }
        />
      </>
    )

  const inContext = companyContext === "all" ? all : all.filter((c) => c.id === companyContext)
  const needle = query.trim().toLowerCase()
  const visible = inContext.filter(
    (c) =>
      matchesHealthFilter(c.health, health) &&
      (!needle || [c.name, c.shortName, c.industry, c.tagline].some((f) => f.toLowerCase().includes(needle)))
  )

  const healthy = inContext.filter((c) => matchesHealthFilter(c.health, "healthy")).length
  const attention = inContext.filter((c) => matchesHealthFilter(c.health, "attention")).length
  const unverified = inContext.filter((c) => matchesHealthFilter(c.health, "unverified")).length
  const openIncidents = inContext.reduce((n, c) => n + companyIncidents(c, incidents).length, 0)

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Healthy" icon={<HeartPulse />} value={`${healthy}/${inContext.length}`} hint="Verified at last check" />
        <MetricCard label="Needs attention" icon={<AlertTriangle />} value={attention} hint="Degraded or offline" tone={attention ? "warning" : undefined} />
        <MetricCard label="Unverified" icon={<CircleSlash />} value={unverified} hint="Unknown or unconfigured" />
        <MetricCard
          label="Open incidents"
          icon={<AlertOctagon />}
          value={openIncidents}
          tone={openIncidents ? "danger" : undefined}
          href="/infrastructure"
        />
      </div>

      {companyContext !== "all" && (
        <p className="mt-4 text-xs text-muted-foreground">
          Scoped to one company by the HQ context switcher.{" "}
          <Button variant="link" size="xs" className="h-auto p-0 text-xs" onClick={() => setCompanyContext("all")}>
            Show all
          </Button>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies or industries…" aria-label="Search companies" className="pl-8" />
        </div>
        <div className="-mx-1 overflow-x-auto px-1">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={health}
            onValueChange={(v) => v && setHealth(v as HealthFilter)}
            aria-label="Filter by health"
          >
            {healthFilterOptions.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <p className="mt-4 mb-3 text-xs text-muted-foreground" aria-live="polite">
        {visible.length} of {inContext.length} companies
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-4" />}
          title="No companies match"
          description="Try a different search or health filter."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQuery("")
                setHealth("all")
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <CompanyCard key={c.id} company={c} stats={companyStats(c.id, agents, tasks)} />
          ))}
        </div>
      )}
    </>
  )
}
